import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateMovieRequest, WebMovie } from '@features/movies/models/web-movie';

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

    create(request: CreateMovieRequest): Observable<WebMovie> {
        return this.http.post<WebMovie>(this.baseUrl, request, {
            withCredentials: true,
        });
    }
}
