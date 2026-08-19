import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MovieVisibility, WebMovie } from '@features/movies/models/web-movie';
import { EnrichmentPreview, EnrichmentSearchResult } from '@features/movies/models/enrichment';

interface WebMovieWire extends Omit<WebMovie, 'objectId'> {
    object_id?: number | null;
}

function toWebMovie(wire: WebMovieWire): WebMovie {
    return { ...wire, objectId: wire.object_id ?? null };
}

@Injectable({
    providedIn: 'root',
})
export class MovieProviderService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress + '/web/movies';

    list(limit = 50): Observable<WebMovie[]> {
        return this.http
            .get<WebMovieWire[]>(this.baseUrl, {
                params: { limit: String(limit) },
                withCredentials: true,
            })
            .pipe(map((movies) => movies.map(toWebMovie)));
    }

    findById(movieId: number): Observable<WebMovie> {
        return this.http
            .get<{ movie: WebMovieWire }>(`${this.baseUrl}/${movieId}`, {
                withCredentials: true,
            })
            .pipe(map((response) => toWebMovie(response.movie)));
    }

    create(title: string): Observable<WebMovie> {
        return this.http
            .post<WebMovieWire>(this.baseUrl, { title }, { withCredentials: true })
            .pipe(map(toWebMovie));
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

    setVisibility(movieId: number, visibility: MovieVisibility): Observable<WebMovie> {
        return this.http
            .post<WebMovieWire>(`${this.baseUrl}/${movieId}/visibility`, { visibility }, { withCredentials: true })
            .pipe(map(toWebMovie));
    }

    setShares(movieId: number, usernames: string[]): Observable<WebMovie> {
        return this.http
            .post<WebMovieWire>(`${this.baseUrl}/${movieId}/shares`, { usernames }, { withCredentials: true })
            .pipe(map(toWebMovie));
    }
}