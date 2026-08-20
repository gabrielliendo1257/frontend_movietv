import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BulkVisibilityRequest, VisibilityJob } from '@features/movies/models/visibility';

/**
 * Visibilidad en lote: dispara el trabajo (POST 202) y sigue su progreso por
 * SSE. El endpoint de eventos es un GET, por lo que se usa EventSource con
 * credenciales (la sesión viaja por cookie).
 */
@Injectable({
    providedIn: 'root',
})
export class VisibilityJobService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress + '/web/movies';

    bulk(request: BulkVisibilityRequest): Observable<VisibilityJob> {
        return this.http.post<VisibilityJob>(`${this.baseUrl}/visibility`, request, {
            withCredentials: true,
        });
    }

    events(jobId: string): Observable<VisibilityJob> {
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
