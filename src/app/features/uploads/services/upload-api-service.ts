import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadRequest } from '@features/uploads/models/upload-request';
import { UploadSessionDto } from '@features/uploads/models/upload-response';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { environment } from '../../../../environments/environment';

interface UploadProgressEvent {
    type: HttpEventType.UploadProgress;
    loaded: number;
    total: number | null;
}

interface UploadResponseEvent {
    type: HttpEventType.Response;
    status: number;
}

export type UploadHttpEvent = HttpEvent<unknown> | UploadProgressEvent | UploadResponseEvent;

@Injectable({
    providedIn: 'root',
})
export class UploadApiService {
    private readonly http = inject(HttpClient);
    private readonly uploadsUrl = environment.backendAddress + '/web/uploads';

    getCredentials(file: File): Observable<UploadSessionDto> {
        const request: UploadRequest = {
            filename: file.name,
            mime_type: file.type,
            file_size: file.size,
        };

        return this.http.post<UploadSessionDto>(this.uploadsUrl, request, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            withCredentials: true,
        });
    }

    uploadToStorage(file: File, session: UploadSessionDto, signal?: AbortSignal): Observable<UploadHttpEvent> {
        return new Observable<UploadHttpEvent>((subscriber) => {
            let sent = 0;

            const countedStream = file.stream().pipeThrough(
                new TransformStream<Uint8Array, Uint8Array>({
                    transform(chunk, controller) {
                        sent += chunk.byteLength;
                        subscriber.next({ type: HttpEventType.UploadProgress, loaded: sent, total: file.size });
                        controller.enqueue(chunk);
                    },
                }),
            );

            fetch(session.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': session.object.expectedMime,
                },
                body: countedStream,
                signal,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Upload failed with status ${response.status}.`);
                    }

                    subscriber.next({ type: HttpEventType.Response, status: response.status });
                    subscriber.complete();
                })
                .catch((error: unknown) => subscriber.error(error));
        });
    }

    confirmUpload(uploadId: string, metadata: MovieMetadata): Observable<unknown> {
        return this.http.post(`${this.uploadsUrl}/${uploadId}/complete`, metadata, {
            withCredentials: true,
        });
    }
}