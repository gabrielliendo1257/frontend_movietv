import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WebMovie } from '@features/movies/models/web-movie';
import { MovieDetails, MovieSummary, Pagination } from '@features/movies/models/the-movie-db';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';

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
        return this.http.get<WebMovie>(`${this.baseUrl}/${movieId}`, {
            withCredentials: true,
        });
    }

    create(title: string): Observable<WebMovie> {
        return this.http.post<WebMovie>(this.baseUrl, { title }, { withCredentials: true });
    }

    enrichmentSearch(query: string): Observable<Pagination<MovieSummary>> {
        return this.http.get<Pagination<MovieSummary>>(`${this.baseUrl}/enrichment/search`, {
            params: { query },
            withCredentials: true,
        });
    }

    enrichmentPreview(tmdbId: number): Observable<MovieDetails> {
        return this.http.get<MovieDetails>(`${this.baseUrl}/enrichment/preview`, {
            params: { tmdb_id: String(tmdbId) },
            withCredentials: true,
        });
    }

    enrich(movieId: number, metadata: MovieMetadata): Observable<unknown> {
        return this.http.post(`${this.baseUrl}/${movieId}/enrichment`, metadata, {
            withCredentials: true,
        });
    }
}