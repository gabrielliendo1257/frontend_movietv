import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadRequest } from '@features/uploads/models/upload-request';
import { UploadSessionDto } from '@features/uploads/models/upload-response';
import { environment } from '../../../../environments/environment';

export type UploadHttpEvent = HttpEvent<unknown>;

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
                //'Content-Type': 'application/json',
                accept: 'application/json',
            },
            withCredentials: true,
        });
    }

    uploadToStorage(file: File, session: UploadSessionDto): Observable<UploadHttpEvent> {
        return this.http.put<unknown>(session.uploadUrl, file, {
            headers: {
                'Content-Type': session.object.expectedMime,
            },
            reportProgress: true,
            observe: 'events',
        });
    }

    confirmMovieComplete(movieId: number, storageId: string, sizeBytes: number): Observable<unknown> {
        return this.http.post(
            `${environment.backendAddress}/web/movies/${movieId}/complete`,
            {
                storageId: Number(storageId),
                sizeBytes,
            },
            { withCredentials: true },
        );
    }
}
