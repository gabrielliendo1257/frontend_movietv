import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Observable, EMPTY, Subscription, catchError, filter, map, switchMap, tap } from 'rxjs';
import { ACTIVE_UPLOAD_STATES, UploadTask } from '@features/uploads/models/upload-task';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { UploadSessionDto } from '@features/uploads/models/upload-response';
import { PendingUpload, UploadSessionPersistence } from '@features/uploads/services/upload-session-persistence';
import { UploadApiService, UploadHttpEvent } from '@features/uploads/services/upload-api-service';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { CreateMovieRequest } from '@features/movies/models/web-movie';
import { MovieStreamStore } from '@features/movies/services/movie-stream-store';

@Injectable({
    providedIn: 'root',
})
export class UploadFacade {
    private readonly uploadApiService: UploadApiService = inject(UploadApiService);
    private readonly persistence = inject(UploadSessionPersistence);
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly movieStreamStore = inject(MovieStreamStore);

    readonly tasks = signal<UploadTask[]>([]);

    readonly activeCount = computed(() =>
        this.tasks().filter((task) => ACTIVE_UPLOAD_STATES.has(task.state)).length,
    );

    private readonly versions = new Map<string, number>();
    private readonly subscriptions = new Map<string, Subscription>();

    constructor() {
        this.resumePendingUpload();
    }

    startUpload(file: File, metadata: MovieMetadata): string {
        const uploadId = crypto.randomUUID();
        const version = this.nextVersion(uploadId);

        this.tasks.update((tasks) => [
            {
                uploadId,
                file,
                fileName: file.name,
                progress: 0,
                state: 'requesting_session',
                uploadUrl: '',
                storageKey: '',
                metadata,
            },
            ...tasks,
        ]);

        this.runNewUpload(uploadId, file, metadata, version);

        return uploadId;
    }

    retry(uploadId: string): void {
        const task = this.taskById(uploadId);
        if (!task) return;

        const version = this.nextVersion(uploadId);
        this.updateTask(uploadId, { state: 'requesting_session', progress: 0, error: null });

        const run = (file: File) => this.runNewUpload(uploadId, file, task.metadata, version);

        if (task.file) {
            run(task.file);
            return;
        }

        void this.persistence.loadFile(uploadId).then((file) => {
            if (!this.isCurrent(uploadId, version)) return;

            if (!file) {
                this.updateTask(uploadId, { state: 'error', error: 'Upload session expired.' });
                return;
            }

            this.updateTask(uploadId, { file });
            run(file);
        });
    }

    cancel(uploadId: string): void {
        this.nextVersion(uploadId);

        this.subscriptions.get(uploadId)?.unsubscribe();
        this.subscriptions.delete(uploadId);

        this.updateTask(uploadId, { state: 'cancelled' });

        if (this.isStoredSession(uploadId)) {
            this.persistence.removeSession();
        }
    }

    remove(uploadId: string): void {
        this.nextVersion(uploadId);

        this.subscriptions.get(uploadId)?.unsubscribe();
        this.subscriptions.delete(uploadId);

        this.tasks.update((tasks) => tasks.filter((task) => task.uploadId !== uploadId));

        void this.persistence.deleteFile(uploadId).catch(() => undefined);
    }

    taskById(uploadId: string): UploadTask | null {
        return this.tasks().find((task) => task.uploadId === uploadId) ?? null;
    }

    private resumePendingUpload(): void {
        const pending = this.persistence.loadSession();
        if (!pending) return;

        const uploadId = pending.session.uploadId;
        const version = this.nextVersion(uploadId);

        this.tasks.update((tasks) => [
            {
                uploadId,
                file: null,
                fileName: pending.fileName,
                progress: 0,
                state: 'resuming',
                uploadUrl: pending.session.uploadUrl,
                storageKey: pending.session.storageKey,
                metadata: pending.metadata,
            },
            ...tasks,
        ]);

        void this.persistence.loadFile(uploadId)
            .then((file) => {
                if (!this.isCurrent(uploadId, version)) return;

                if (!file) {
                    this.failTask(uploadId, 'Upload session expired.');
                    return;
                }

                this.updateTask(uploadId, { file, state: 'uploading' });

                if (pending.stage === 'confirming') {
                    this.updateTask(uploadId, { state: 'confirming' });

                    this.uploadApiService
                        .confirmUpload(uploadId, pending.metadata)
                        .subscribe({
                            next: () => {
                                if (this.isCurrent(uploadId, version)) {
                                    this.finishTask(uploadId, version);
                                }
                            },
                            error: (error) => {
                                if (this.isCurrent(uploadId, version)) {
                                    this.failTask(uploadId, error);
                                }
                            },
                        });
                    return;
                }

                this.trackSubscription(
                    uploadId,
                    this.uploadAndConfirm(uploadId, file, pending.session, pending.metadata, version).subscribe(),
                );
            })
            .catch(() => {
                if (!this.isCurrent(uploadId, version)) return;

                this.persistence.removeSession();
                this.updateTask(uploadId, { state: 'error', error: 'Upload session expired.' });
            });
    }

    private runNewUpload(
        uploadId: string,
        file: File,
        metadata: MovieMetadata,
        version: number,
    ): void {
        const subscription = this.uploadApiService
            .getCredentials(file)
            .pipe(
                tap((session) => {
                    if (!this.isCurrent(uploadId, version)) return;

                    this.updateTask(uploadId, {
                        uploadUrl: session.uploadUrl,
                        storageKey: session.storageKey,
                        state: 'uploading',
                    });

                    const pending: PendingUpload = {
                        session,
                        fileName: file.name,
                        stage: 'uploading',
                        metadata,
                    };

                    this.persistence.saveSession(pending);
                    void this.persistence.saveFile(session.uploadId, file).catch(() => undefined);
                }),

                switchMap((session) => {
                    if (!this.isCurrent(uploadId, version)) return EMPTY;

                    return this.uploadAndConfirm(uploadId, file, session, metadata, version);
                }),
            )
            .subscribe({
                error: (error) => {
                    if (this.isCurrent(uploadId, version)) {
                        this.failTask(uploadId, error);
                    }
                },
            });

        this.trackSubscription(uploadId, subscription);
    }

    private uploadAndConfirm(
        uploadId: string,
        file: File,
        session: UploadSessionDto,
        metadata: MovieMetadata,
        version: number,
    ): Observable<unknown> {
        return this.uploadApiService
            .uploadToStorage(file, session)
            .pipe(
                tap((event) => {
                    if (!this.isCurrent(uploadId, version)) return;
                    this.handleUploadEvent(uploadId, event);
                }),

                filter((event) => event.type === HttpEventType.Response),

                map(() => session),

                tap(() => {
                    if (!this.isCurrent(uploadId, version)) return;

                    this.updateTask(uploadId, { state: 'confirming' });
                    this.updateSessionStage(uploadId, 'confirming');
                }),

                switchMap((currentSession) =>
                    this.movieProviderService.create(this.toCreateRequest(metadata)).pipe(
                        tap((created) => {
                            if (this.isCurrent(uploadId, version)) {
                                this.movieStreamStore.setMovie(created.id, currentSession.uploadId);
                            }
                        }),
                        switchMap(() =>
                            this.uploadApiService
                                .confirmUpload(currentSession.uploadId, metadata)
                                .pipe(
                                    tap(() => {
                                        if (this.isCurrent(uploadId, version)) {
                                            this.updateTask(uploadId, { state: 'persisting' });
                                        }
                                    }),
                                ),
                        ),
                    ),
                ),

                tap(() => {
                    if (this.isCurrent(uploadId, version)) {
                        this.finishTask(uploadId, version);
                    }
                }),

                catchError((error) => {
                    if (this.isCurrent(uploadId, version)) {
                        this.failTask(uploadId, error);
                    }
                    return EMPTY;
                }),
            );
    }

    private toCreateRequest(metadata: MovieMetadata): CreateMovieRequest {
        const { id, ...request } = metadata;
        return request;
    }

    private handleUploadEvent(uploadId: string, event: UploadHttpEvent): void {        if (event.type !== HttpEventType.UploadProgress) return;

        const percent = Math.round((100 * event.loaded) / (event.total ?? 1));

        this.updateTask(uploadId, { progress: percent, state: 'uploading' });
    }

    private finishTask(uploadId: string, version: number): void {
        if (!this.isCurrent(uploadId, version)) return;

        this.updateTask(uploadId, { state: 'completed', progress: 100 });

        if (this.isStoredSession(uploadId)) {
            this.persistence.clear();
        }
    }

    private failTask(uploadId: string, error: unknown): void {
        const message = error instanceof Error ? error.message : 'Upload failed.';

        this.updateTask(uploadId, { state: 'error', error: message });

        if (this.isStoredSession(uploadId)) {
            this.persistence.removeSession();
        }
    }

    private updateSessionStage(uploadId: string, stage: 'uploading' | 'confirming'): void {
        const pending = this.persistence.loadSession();
        if (!pending || pending.session.uploadId !== uploadId) return;

        this.persistence.saveSession({ ...pending, stage });
    }

    private isStoredSession(uploadId: string): boolean {
        return this.persistence.loadSession()?.session.uploadId === uploadId;
    }

    private updateTask(uploadId: string, patch: Partial<UploadTask>): void {
        this.tasks.update((tasks) =>
            tasks.map((task) => (task.uploadId === uploadId ? { ...task, ...patch } : task)),
        );
    }

    private nextVersion(uploadId: string): number {
        const version = (this.versions.get(uploadId) ?? 0) + 1;
        this.versions.set(uploadId, version);
        return version;
    }

    private isCurrent(uploadId: string, version: number): boolean {
        return this.versions.get(uploadId) === version;
    }

    private trackSubscription(uploadId: string, subscription: Subscription): void {
        this.subscriptions.get(uploadId)?.unsubscribe();
        this.subscriptions.set(uploadId, subscription);
    }
}
