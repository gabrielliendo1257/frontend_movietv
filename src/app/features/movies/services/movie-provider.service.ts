import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WebMovie } from '@features/movies/models/web-movie';
import { EnrichmentPreview, EnrichmentSearchResult } from '@features/movies/models/enrichment';

@Injectable({
    providedIn: 'root',
})
export class MovieProviderService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress + '/web/movies';

    list(limit = 50): Observable<WebMovie[]> {
        return this.http.get<WebMovie[]>(this.baseUrl, {
            params: { limit: String(limit) },
            withCredentials: true,
        });
    }

    findById(movieId: number): Observable<WebMovie> {
        return this.http
            .get<{ movie: WebMovie }>(`${this.baseUrl}/${movieId}`, {
                withCredentials: true,
            })
            .pipe(map((response) => response.movie));
    }

    create(title: string): Observable<WebMovie> {
        return this.http.post<WebMovie>(this.baseUrl, { title }, { withCredentials: true });
    }

    enrichmentSearch(query: string): Observable<EnrichmentSearchResult[]> {
        return this.http.get<EnrichmentSearchResult[]>(`${this.baseUrl}/enrichment/search`, {
            params: { query },
            withCredentials: true,
        });
    }

    enrichmentPreview(tmdbId: number): Observable<EnrichmentPreview> {
        return this.http.get<EnrichmentPreview>(`${this.baseUrl}/enrichment/preview`, {
            params: { tmdb_id: String(tmdbId) },
            withCredentials: true,
        });
    }

    enrich(movieId: number, tmdbId: number): Observable<unknown> {
        return this.http.post(
            `${this.baseUrl}/${movieId}/enrichment`,
            { tmdb_id: tmdbId },
            { withCredentials: true },
        );
    }
}