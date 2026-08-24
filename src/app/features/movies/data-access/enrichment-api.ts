import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { EnrichmentSearchResult } from '@features/movies/models/enrichment';
import { WebMovie } from '@features/movies/models/web-movie';
import { toWebMovie, WebMovieWire } from '@features/movies/data-access/movies-api';

@Injectable({ providedIn: 'root' })
export class EnrichmentApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL) + '/web/movies';

    search(query: string): Observable<EnrichmentSearchResult[]> {
        return this.http.get<EnrichmentSearchResult[]>(`${this.baseUrl}/enrichment/search`, {
            params: { query },
        });
    }

    link(movieId: number, tmdbId: number): Observable<unknown> {
        return this.http.post(`${this.baseUrl}/${movieId}/enrichment`, { tmdb_id: tmdbId });
    }

    unlink(movieId: number): Observable<WebMovie> {
        return this.http
            .delete<WebMovieWire>(`${this.baseUrl}/${movieId}/enrichment`)
            .pipe(map(toWebMovie));
    }
}
