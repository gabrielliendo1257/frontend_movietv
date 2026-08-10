import { inject, Injectable, signal } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UploadState, UploadTask } from '@features/uploads/models/upload-task';
import { catchError, EMPTY, filter, map, switchMap, tap } from 'rxjs';
import { UploadApiService } from '@features/uploads/services/upload-api-service';

@Injectable({
    providedIn: 'root',
})
export class UploadFacade {
    private readonly uploadApiService: UploadApiService = inject(UploadApiService);

    readonly state = signal<UploadState>('idle');
    readonly progress = signal(0);
    readonly error = signal<string | null>(null);
    readonly currentTask = signal<UploadTask | null>(null);

    uploadMovie(file: File) {
        this.reset();

        if (!file) {
            this.handleError('Invalid file.');
            return;
        }
        this.state.set('requesting_session');

        this.uploadApiService
            .getCredentials(file)
            .pipe(
                tap((uploadResponse) => {
                    this.currentTask.set({
                        uploadId: uploadResponse.uploadId,
                        storageKey: uploadResponse.storageKey,
                        fileName: file.name,
                        progress: 0,
                        file: file,
                        uploadUrl: uploadResponse.uploadUrl,
                        state: 'uploading',
                    });
                    this.state.set('uploading');
                }),

                switchMap((session) =>
                    this.uploadApiService.uploadToStorage(file, session).pipe(
                        tap((event) => {
                            this.handleUploadEvent(event);
                        }),

                        filter((event) => event.type === HttpEventType.Response),

                        map(() => session),
                    ),
                ),

                tap(() => {
                    this.state.set('confirming');
                }),

                switchMap((session) =>
                    this.uploadApiService.confirmUpload(session.uploadId).pipe(
                        tap(() => {
                            this.state.set('persisting');
                        }),
                    ),
                ),

                tap(() => {
                    this.state.set('completed');
                    this.progress.set(100);
                    this.updateTask(100, 'completed');
                }),

                catchError((error) => {
                    console.error(error);
                    this.handleError('Upload failed.');

                    return EMPTY;
                }),
            )
            .subscribe();
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
