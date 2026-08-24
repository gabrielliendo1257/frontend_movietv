import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { MediaKind } from '@features/movies/models/media-kind';
import { MovieUpdateRequest } from '@features/movies/models/movie-update';
import { MovieVisibility, WebMovie } from '@features/movies/models/web-movie';

/** DTO tal como lo serializa el BFF (snake_case en objectId). */
export interface WebMovieWire extends Omit<WebMovie, 'objectId'> {
    object_id?: number | null;
}

export function toWebMovie(wire: WebMovieWire): WebMovie {
    return { ...wire, objectId: wire.object_id ?? null };
}

@Injectable({ providedIn: 'root' })
export class MoviesApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL) + '/web/movies';

    list(limit = 50): Observable<WebMovie[]> {
        return this.http
            .get<WebMovieWire[]>(this.baseUrl, { params: { limit: String(limit) } })
            .pipe(map((movies) => movies.map(toWebMovie)));
    }

    findById(movieId: number): Observable<WebMovie> {
        return this.http
            .get<{ movie: WebMovieWire }>(`${this.baseUrl}/${movieId}`)
            .pipe(map((response) => toWebMovie(response.movie)));
    }

    create(title: string): Observable<WebMovie> {
        return this.http
            .post<WebMovieWire>(this.baseUrl, { title })
            .pipe(map(toWebMovie));
    }

    update(movieId: number, request: MovieUpdateRequest): Observable<WebMovie> {
        return this.http
            .put<WebMovieWire>(`${this.baseUrl}/${movieId}`, request)
            .pipe(map(toWebMovie));
    }
}

export type { MovieVisibility, MediaKind };
