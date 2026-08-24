import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import {
    EMPTY,
    from,
    Observable,
    Subscription,
    catchError,
    filter,
    map,
    switchMap,
    take,
    takeWhile,
    tap,
    timer,
} from 'rxjs';
import { ACTIVE_UPLOAD_STATES, UploadTask } from '@features/uploads/models/upload-task';
import { MediaKind } from '@features/movies/models/media-kind';
import { MovieMetadata } from '@features/movies/models/movie-metadata';
import {
    AddMediaProcess,
    InitialAccess,
    MovieDraft,
    StartAddMediaCommand,
    UploadInstructions,
} from '@features/uploads/models/add-media';
import { PendingAddMedia, UploadSessionPersistence } from '@features/uploads/services/upload-session-persistence';
import { AddMediaApi } from '@features/uploads/data-access/add-media-api';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

/**
 * Estado de la experiencia "Añadir contenido" en el cliente.
 *
 * El BFF es dueño de la coreografía (draft → upload → verify): este facade
 * expresa la intención (start con idempotencia), sube los bytes al storage y
 * sigue el veredicto. Cada tarea local se identifica por su idempotencyKey,
 * lo que hace seguros el reintento y la reanudación tras recargar.
 */
@Injectable({ providedIn: 'root' })
export class UploadFacade {
    private readonly addMediaApi = inject(AddMediaApi);
    private readonly persistence = inject(UploadSessionPersistence);

    readonly tasks = signal<UploadTask[]>([]);

    readonly activeCount = computed(
        () => this.tasks().filter((task) => ACTIVE_UPLOAD_STATES.has(task.state)).length,
    );

    private readonly subscriptions = new Map<string, Subscription>();

    constructor() {
        this.resumePending();
    }

    startUpload(
        file: File,
        metadata: MovieMetadata,
        kind: MediaKind,
        access?: InitialAccess,
    ): string {
        const uploadId = newIdempotencyKey();

        this.tasks.update((tasks) => [
            {
                uploadId,
                addMediaId: null,
                movieId: null,
                file,
                fileName: file.name,
                progress: 0,
                state: 'starting',
                metadata,
                kind,
                access,
            },
            ...tasks,
        ]);

        void this.persistence.saveFile(uploadId, file).catch(() => undefined);
        this.runStart(uploadId, file);

        return uploadId;
    }

    retry(uploadId: string): void {
        const task = this.taskById(uploadId);
        // Evita doble submit mientras la tarea ya está activa.
        if (!task || ACTIVE_UPLOAD_STATES.has(task.state)) return;

        this.patchTask(uploadId, { state: 'starting', error: null });
        this.trackSubscription(
            uploadId,
            from(this.persistence.loadFile(uploadId))
                .pipe(
                    map((file) => file ?? this.taskById(uploadId)?.file ?? null),
                    switchMap((file) => {
                        if (!file) throw new Error('Upload session expired.');
                        this.patchTask(uploadId, { file });

                        return task.addMediaId
                            ? this.addMediaApi.status(task.addMediaId).pipe(
                                  switchMap((process) => this.continueFrom(uploadId, process)),
                              )
                            : this.startProcess(uploadId, file);
                    }),
                    catchError((error) => {
                        this.fail(uploadId, error);
                        return EMPTY;
                    }),
                )
                .subscribe(),
        );
    }

    cancel(uploadId: string): void {
        const task = this.taskById(uploadId);
        if (!task) return;

        this.subscriptions.get(uploadId)?.unsubscribe();
        this.subscriptions.delete(uploadId);

        if (task.addMediaId) {
            // Las compensaciones (draft/upload huérfanos) las ejecuta el BFF.
            this.addMediaApi.cancel(task.addMediaId).subscribe({ error: () => undefined });
        }

        this.patchTask(uploadId, { state: 'cancelled' });
        this.persistence.clearPending(uploadId);
    }

    remove(uploadId: string): void {
        this.cancel(uploadId);
        this.tasks.update((tasks) => tasks.filter((task) => task.uploadId !== uploadId));
        void this.persistence.deleteFile(uploadId).catch(() => undefined);
    }

    taskById(uploadId: string): UploadTask | null {
        return this.tasks().find((task) => task.uploadId === uploadId) ?? null;
    }

    // ─── Flujo principal ───

    /** Lanza el proceso de alta y gestiona su ciclo de vida. */
    private runStart(uploadId: string, file: File): void {
        this.trackSubscription(
            uploadId,
            this.startProcess(uploadId, file)
                .pipe(
                    catchError((error) => {
                        this.fail(uploadId, error);
                        return EMPTY;
                    }),
                )
                .subscribe(),
        );
    }

    private startProcess(uploadId: string, file: File): Observable<unknown> {
        // La intención completa vive en la tarea: draft + kind + acceso inicial.
        const task = this.taskById(uploadId);
        if (!task) return EMPTY;

        const command = toCommand(uploadId, file, task.metadata, task.kind, task.access);

        return this.addMediaApi.start(command).pipe(
            tap((process) => this.persistence.savePending(toPending(uploadId, task, process))),
            switchMap((process) => this.continueFrom(uploadId, process)),
        );
    }

    /** Siguiente paso según la fase reportada por el BFF. */
    private continueFrom(uploadId: string, process: AddMediaProcess): Observable<unknown> {
        this.patchTask(uploadId, { addMediaId: process.addMediaId, movieId: process.movieId });

        switch (process.phase) {
            case 'READY':
                this.finish(uploadId);
                return EMPTY;
            case 'FAILED':
                this.fail(uploadId, process.failureCode ?? 'ADD_MEDIA_FAILED');
                return EMPTY;
            case 'CANCELLED':
            case 'CANCELLING':
                this.patchTask(uploadId, { state: 'cancelled' });
                return EMPTY;
            case 'VERIFYING_UPLOAD':
            case 'FINALIZING':
                return this.awaitVerdict(uploadId, process.addMediaId);
            default:
                // STARTING / PREPARING / WAITING_FOR_UPLOAD
                return process.upload
                    ? this.uploadAndComplete(uploadId, process)
                    : this.pollUntilActionable(process.addMediaId).pipe(
                          switchMap((next) => this.continueFrom(uploadId, next)),
                      );
        }
    }

    private uploadAndComplete(uploadId: string, process: AddMediaProcess): Observable<unknown> {
        const instructions = process.upload as UploadInstructions;

        this.patchTask(uploadId, { state: 'uploading', progress: 0 });

        return from(this.persistence.loadFile(uploadId)).pipe(
            switchMap((file) => {
                const resolved = file ?? this.taskById(uploadId)?.file ?? null;
                if (!resolved) throw new Error('Upload session expired.');
                this.patchTask(uploadId, { file: resolved });

                return this.addMediaApi.uploadToStorage(resolved, instructions).pipe(
                    tap((event) => {
                        if (event.type !== HttpEventType.UploadProgress) return;
                        this.patchTask(uploadId, {
                            progress: Math.round((100 * event.loaded) / (event.total ?? 1)),
                        });
                    }),
                    filter((event) => event.type === HttpEventType.Response),
                    switchMap(() => this.addMediaApi.complete(process.addMediaId, resolved.size)),
                );
            }),
            switchMap((verdict) => this.continueFrom(uploadId, verdict)),
            catchError((error) => {
                this.fail(uploadId, error);
                return EMPTY;
            }),
        );
    }

    /** complete devolvió 202: storage aún verifica; sondeo hasta veredicto. */
    private awaitVerdict(uploadId: string, addMediaId: string): Observable<unknown> {
        this.patchTask(uploadId, { state: 'verifying' });

        return this.poll(addMediaId, (p) => p.phase === 'READY' || p.phase === 'FAILED').pipe(
            tap((final) => {
                if (final.phase === 'READY') {
                    this.finish(uploadId);
                } else {
                    this.fail(uploadId, final.failureCode ?? 'UPLOAD_VERIFICATION_FAILED');
                }
            }),
            catchError(() => {
                this.fail(uploadId, 'UPLOAD_VERIFICATION_TIMEOUT');
                return EMPTY;
            }),
        );
    }

    private pollUntilActionable(addMediaId: string): Observable<AddMediaProcess> {
        return this.poll(
            addMediaId,
            (p) => p.phase !== 'STARTING' && p.phase !== 'PREPARING',
        );
    }

    /** Sondea estado; emite el último valor al cumplirse la condición o agotar intentos. */
    private poll(
        addMediaId: string,
        done: (process: AddMediaProcess) => boolean,
    ): Observable<AddMediaProcess> {
        return timer(POLL_INTERVAL_MS, POLL_INTERVAL_MS).pipe(
            switchMap(() => this.addMediaApi.status(addMediaId)),
            takeWhile(done, /* inclusive */ true),
            take(MAX_POLLS + 1),
        );
    }

    // ─── Reanudación tras recarga ───

    private resumePending(): void {
        const pending = this.persistence.loadPending();
        if (!pending) return;

        this.tasks.update((tasks) => [
            {
                uploadId: pending.idempotencyKey,
                addMediaId: pending.addMediaId,
                movieId: pending.movieId,
                file: null,
                fileName: pending.fileName,
                progress: 0,
                state: 'starting',
                metadata: pendingMetadata(pending),
                kind: pending.draft.kind ?? 'MOVIE',
                access: pending.access,
            },
            ...tasks,
        ]);

        this.trackSubscription(
            pending.idempotencyKey,
            from(this.persistence.loadFile(pending.idempotencyKey))
                .pipe(
                    tap((file) => {
                        if (file) this.patchTask(pending.idempotencyKey, { file });
                    }),
                    switchMap(() =>
                        pending.addMediaId
                            ? this.addMediaApi.status(pending.addMediaId).pipe(
                                  switchMap((process) =>
                                      this.continueFrom(pending.idempotencyKey, process),
                                  ),
                              )
                            : EMPTY,
                    ),
                    catchError((error) => {
                        this.fail(pending.idempotencyKey, error);
                        return EMPTY;
                    }),
                )
                .subscribe(),
        );
    }

    // ─── Helpers ───

    private finish(uploadId: string): void {
        this.patchTask(uploadId, { state: 'completed', progress: 100 });
        this.persistence.clearPending(uploadId);
    }

    private fail(uploadId: string, error: unknown): void {
        this.patchTask(uploadId, { state: 'failed', error: toMessage(error) });
        this.persistence.clearPending(uploadId);
    }

    private patchTask(uploadId: string, patch: Partial<UploadTask>): void {
        this.tasks.update((tasks) =>
            tasks.map((task) => (task.uploadId === uploadId ? { ...task, ...patch } : task)),
        );
    }

    private trackSubscription(uploadId: string, subscription: Subscription): void {
        this.subscriptions.get(uploadId)?.unsubscribe();
        this.subscriptions.set(uploadId, subscription);
    }
}

function toCommand(
    idempotencyKey: string,
    file: File,
    metadata: MovieMetadata,
    kind: MediaKind,
    access?: InitialAccess,
): StartAddMediaCommand {
    return {
        file: {
            filename: file.name,
            sizeBytes: file.size,
            mimeType: file.type || 'application/octet-stream',
        },
        movie: {
            providerId: metadata.id,
            draft: toDraft(metadata, kind),
        },
        access,
        idempotencyKey,
    };
}

function toPending(
    idempotencyKey: string,
    task: UploadTask,
    process: AddMediaProcess,
): PendingAddMedia {
    return {
        idempotencyKey,
        addMediaId: process.addMediaId,
        movieId: process.movieId,
        fileName: task.fileName,
        providerId: task.metadata.id,
        draft: toDraft(task.metadata, task.kind),
        access: task.access,
    };
}

function toDraft(metadata: MovieMetadata, kind: MediaKind): MovieDraft {
    return {
        title: metadata.title,
        originalTitle: metadata.originalTitle,
        year: metadata.year,
        genres: metadata.genres,
        popularity: metadata.popularity,
        duration: metadata.duration,
        director: metadata.director,
        cast: metadata.cast,
        overview: metadata.overview,
        poster_path: metadata.poster_path,
        release_date: metadata.release_date,
        country: metadata.country,
        language: metadata.language,
        awards: metadata.awards,
        kind,
    };
}

/** Reconstruye la metadata mínima para reintentos desde un proceso persistido. */
function pendingMetadata(pending: PendingAddMedia): MovieMetadata {
    return {
        id: pending.providerId,
        title: pending.draft.title,
        originalTitle: pending.draft.originalTitle ?? '',
        year: pending.draft.year ?? null,
        genres: pending.draft.genres ?? [],
        popularity: pending.draft.popularity ?? 5,
        duration: pending.draft.duration ?? '',
        director: pending.draft.director ?? '',
        cast: pending.draft.cast ?? [],
        overview: pending.draft.overview ?? '',
        poster_path: pending.draft.poster_path ?? null,
        release_date: pending.draft.release_date ?? '',
        country: pending.draft.country ?? '',
        language: pending.draft.language ?? '',
        awards: pending.draft.awards ?? [],
    };
}

function toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
        if (error.status === 409) return 'La subida fue rechazada por el servidor.';
        if (error.status === 403) return 'No tienes permiso para añadir contenido.';
        if (error.status === 401) return 'Inicia sesión para añadir contenido.';
        if (error.status === 0) return 'Sin conexión con el servidor.';
        return `Error ${error.status} al procesar la subida.`;
    }
    if (error instanceof Error) return error.message;
    return typeof error === 'string' ? error : 'Upload failed.';
}

/**
 * Clave de idempotencia del proceso. `crypto.randomUUID` solo existe en
 * contextos seguros (HTTPS/localhost); al servir por HTTP en LAN caemos a
 * UUID v4 vía getRandomValues, disponible en cualquier contexto.
 */
function newIdempotencyKey(): string {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === 'function') {
        return '10000000-1000-4000-8000-100000000000'.replace(
            /[018]/g,
            (position) =>
                (
                    +position ^
                    (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+position / 4)))
                ).toString(16),
        );
    }

    // Último recurso para entornos sin Web Crypto (no debería ocurrir).
    const random = () => Math.random().toString(36).slice(2, 10);
    return `${Date.now()}-${random()}-${random()}`;
}
