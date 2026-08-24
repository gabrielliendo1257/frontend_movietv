import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { BulkVisibilityRequest, VisibilityJob } from '@features/movies/models/visibility';
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

    /** Visibilidad en lote: dispara el trabajo (POST 202). */
    bulk(request: BulkVisibilityRequest): Observable<VisibilityJob> {
        return this.http.post<VisibilityJob>(`${this.baseUrl}/visibility`, request);
    }

    /**
     * Progreso del trabajo por SSE. El endpoint de eventos es un GET, por lo que
     * se usa EventSource con credenciales (la sesión viaja por cookie).
     */
    jobEvents(jobId: string): Observable<VisibilityJob> {
        return new Observable<VisibilityJob>((subscriber) => {
            const source = new EventSource(
                `${this.baseUrl}/visibility/jobs/${jobId}/events`,
                { withCredentials: true },
            );

            source.addEventListener('progress', (event) => {
                const job = JSON.parse((event as MessageEvent).data) as VisibilityJob;
                subscriber.next(job);
                if (job.status === 'DONE') {
                    source.close();
                    subscriber.complete();
                }
            });

            source.onerror = () => {
                source.close();
                subscriber.error(new Error('Conexión del progreso perdida'));
            };

            return () => source.close();
        });
    }
}
