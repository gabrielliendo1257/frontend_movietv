import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { MovieVisibility, WebMovie } from '@features/movies/models/web-movie';
import { toWebMovie } from '@features/movies/data-access/movies-api';

@Injectable({ providedIn: 'root' })
export class VisibilityApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL) + '/web/movies';

    set(movieId: number, visibility: MovieVisibility, usernames?: string[]): Observable<WebMovie> {
        return this.http
            .post<WebMovie>(`${this.baseUrl}/${movieId}/visibility`, { visibility, usernames })
            .pipe(map(toWebMovie));
    }

    setShares(movieId: number, usernames: string[]): Observable<WebMovie> {
        return this.http
            .post<WebMovie>(`${this.baseUrl}/${movieId}/shares`, { usernames })
            .pipe(map(toWebMovie));
    }
}
