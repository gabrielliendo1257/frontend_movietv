import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import {
    IdentifyAssetRequest,
    Library,
    MediaAsset,
    MediaAssetPage,
} from '@features/libraries/models/library';

@Injectable({ providedIn: 'root' })
export class LibrariesApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL) + '/web/libraries';

    list(): Observable<Library[]> {
        return this.http.get<Library[]>(this.baseUrl);
    }

    register(rootPath: string): Observable<Library> {
        return this.http.post<Library>(this.baseUrl, { rootPath });
    }

    delete(libraryId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${libraryId}`);
    }

    scan(libraryId: number, page = 0, size = 20): Observable<MediaAssetPage> {
        return this.http.post<MediaAssetPage>(
            `${this.baseUrl}/${libraryId}/scan`,
            null,
            { params: { page: String(page), size: String(size) } },
        );
    }

    unidentified(libraryId: number, page = 0, size = 20): Observable<MediaAssetPage> {
        return this.http.get<MediaAssetPage>(`${this.baseUrl}/${libraryId}/unidentified`, {
            params: { page: String(page), size: String(size) },
        });
    }

    cancelScan(libraryId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${libraryId}/scan`);
    }

    identify(assetId: number, request: IdentifyAssetRequest): Observable<MediaAsset> {
        return this.http.post<MediaAsset>(
            `${this.baseUrl}/assets/${assetId}/identify`,
            { title: request.title, tmdb_id: request.tmdbId ?? null, kind: request.kind },
        );
    }
}
