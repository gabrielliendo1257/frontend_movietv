import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    IdentifyAssetRequest,
    Library,
    MediaAsset,
    MediaAssetPage,
} from '@features/libraries/models/library';

@Injectable({
    providedIn: 'root',
})
export class LibrariesService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress + '/web/libraries';

    list(): Observable<Library[]> {
        return this.http.get<Library[]>(this.baseUrl, { withCredentials: true });
    }

    register(rootPath: string): Observable<Library> {
        return this.http.post<Library>(this.baseUrl, { rootPath }, { withCredentials: true });
    }

    delete(libraryId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${libraryId}`, { withCredentials: true });
    }

    scan(libraryId: number, page = 0, size = 20): Observable<MediaAssetPage> {
        return this.http.post<MediaAssetPage>(
            `${this.baseUrl}/${libraryId}/scan`,
            null,
            {
                params: { page: String(page), size: String(size) },
                withCredentials: true,
            },
        );
    }

    unidentified(libraryId: number, page = 0, size = 20): Observable<MediaAssetPage> {
        return this.http.get<MediaAssetPage>(`${this.baseUrl}/${libraryId}/unidentified`, {
            params: { page: String(page), size: String(size) },
            withCredentials: true,
        });
    }

    cancelScan(libraryId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${libraryId}/scan`, { withCredentials: true });
    }

    identify(assetId: number, request: IdentifyAssetRequest): Observable<MediaAsset> {
        return this.http.post<MediaAsset>(
            `${this.baseUrl}/assets/${assetId}/identify`,
            { title: request.title, tmdb_id: request.tmdbId ?? null, kind: request.kind },
            { withCredentials: true },
        );
    }
}
