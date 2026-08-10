import { inject, Injectable, signal } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadState, UploadTask } from '@features/uploads/models/upload-task';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { UploadSessionDto } from '@features/uploads/models/upload-response';
import { UploadSessionPersistence, PendingUpload } from '@features/uploads/services/upload-session-persistence';
import { catchError, EMPTY, filter, map, switchMap, tap } from 'rxjs';
import { UploadApiService } from '@features/uploads/services/upload-api-service';

@Injectable({
    providedIn: 'root',
})
export class UploadFacade {
    private readonly uploadApiService: UploadApiService = inject(UploadApiService);
    private readonly persistence = inject(UploadSessionPersistence);

    readonly state = signal<UploadState>('idle');
    readonly progress = signal(0);
    readonly error = signal<string | null>(null);
    readonly currentTask = signal<UploadTask | null>(null);

    private resumeVersion = 0;

    constructor() {
        this.resumePendingUpload();
    }

    uploadMovie(file: File, metadata: MovieMetadata) {
        this.resumeVersion++;
        this.reset();

        if (!file) {
            this.handleError('Invalid file.');
            return;
        }
        this.state.set('requesting_session');

        this.uploadApiService
            .getCredentials(file)
            .pipe(
                tap((session) => {
                    this.currentTask.set({
                        uploadId: session.uploadId,
                        storageKey: session.storageKey,
                        fileName: file.name,
                        progress: 0,
                        file,
                        uploadUrl: session.uploadUrl,
                        state: 'uploading',
                    });
                    this.state.set('uploading');

                    const pending: PendingUpload = {
                        session,
                        fileName: file.name,
                        stage: 'uploading',
                        metadata,
                    };

                    this.persistence.saveSession(pending);
                    void this.persistence.saveFile(session.uploadId, file).catch(() => undefined);
                }),

                switchMap((session) => this.uploadAndConfirm(file, session, metadata)),
            )
            .subscribe();
    }

    private resumePendingUpload(): void {
        const pending = this.persistence.loadSession();
        if (!pending) return;

        const version = this.resumeVersion;
        this.state.set('resuming');
        this.currentTask.set({
            uploadId: pending.session.uploadId,
            storageKey: pending.session.storageKey,
            fileName: pending.fileName,
            progress: 0,
            file: null,
            uploadUrl: pending.session.uploadUrl,
            state: 'resuming',
        });

        void this.persistence.loadFile(pending.session.uploadId)
            .then((file) => {
                if (version !== this.resumeVersion) return;

                if (!file) {
                    this.handleError('Upload session expired.');
                    this.persistence.clear();
                    return;
                }

                this.currentTask.update((task) =>
                    task ? { ...task, file, state: 'uploading' as const } : task,
                );
                this.state.set('uploading');

                if (pending.stage === 'confirming') {
                    this.state.set('confirming');

                    this.uploadApiService
                        .confirmUpload(pending.session.uploadId, pending.metadata)
                        .subscribe({
                            next: () => {
                                if (version === this.resumeVersion) {
                                    this.finishUpload();
                                }
                            },
                            error: (error) => {
                                if (version === this.resumeVersion) {
                                    this.failUpload(error);
                                }
                            },
                        });
                    return;
                }

                this.uploadAndConfirm(file, pending.session, pending.metadata, version)
                    .pipe(
                        tap(() => {
                            if (version === this.resumeVersion) {
                                this.finishUpload();
                            }
                        }),
                        catchError((error) => {
                            if (version === this.resumeVersion) {
                                this.failUpload(error);
                            }
                            return EMPTY;
                        }),
                    )
                    .subscribe();
            })
            .catch(() => {
                if (version !== this.resumeVersion) return;

                this.persistence.clear();
                this.reset();
            });
    }

    private uploadAndConfirm(
        file: File,
        session: UploadSessionDto,
        metadata: MovieMetadata,
        version?: number,
    ): Observable<unknown> {
        return this.uploadApiService
            .uploadToStorage(file, session)
            .pipe(
                tap((event) => {
                    if (version !== undefined && version !== this.resumeVersion) return;
                    this.handleUploadEvent(event);
                }),

                filter((event) => event.type === HttpEventType.Response),

                map(() => session),

                tap(() => {
                    if (version !== undefined && version !== this.resumeVersion) return;
                    this.state.set('confirming');
                    this.updateSessionStage('confirming');
                }),

                switchMap((currentSession) =>
                    this.uploadApiService
                        .confirmUpload(currentSession.uploadId, metadata)
                        .pipe(
                            tap(() => {
                                if (version !== undefined && version !== this.resumeVersion) return;
                                this.state.set('persisting');
                            }),
                        ),
                ),

                catchError((error) => {
                    if (version !== undefined && version !== this.resumeVersion) return EMPTY;
                    this.failUpload(error);
                    return EMPTY;
                }),
            );
    }

    private finishUpload(): void {
        this.state.set('completed');
        this.progress.set(100);
        this.updateTask(100, 'completed');
        this.persistence.clear();
    }

    private failUpload(error: unknown): void {
        console.error(error);
        this.handleError('Upload failed.');
        this.persistence.clear();
    }

    private updateSessionStage(stage: 'uploading' | 'confirming'): void {
        const pending = this.persistence.loadSession();
        if (!pending) return;

        this.persistence.saveSession({ ...pending, stage });
    }

    private handleUploadEvent(event: HttpEvent<unknown>): void {
        switch (event.type) {
            case HttpEventType.UploadProgress:
                const percent = Math.round((100 * event.loaded) / (event.total ?? 1));

                this.progress.set(percent);
                this.updateTask(percent, 'uploading');

                break;
            case HttpEventType.Response:
                this.progress.set(100);

                break;
        }
    }

    private updateTask(progress: number, state: UploadState): void {
        const task = this.currentTask();

        if (!task) return;

        this.currentTask.set({
            ...task,
            progress,
            state,
        });
    }

    private handleError(message: string): void {
        this.state.set('error');
        this.error.set(message);

        const task = this.currentTask();

        if (!task) return;

        this.currentTask.set({
            ...task,
            state: 'error',
        });
    }

    private reset(): void {
        this.state.set('idle');
        this.progress.set(0);
        this.error.set(null);
        this.currentTask.set(null);
    }
}