import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { StreamingSession } from '@features/movies/models/streaming-session';

export interface StreamTicket {
    url: string;
}

@Injectable({ providedIn: 'root' })
export class StreamingApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    /** Sesión directa de streaming para un objeto de storage ya publicado. */
    stream(objectId: string): Observable<StreamingSession> {
        return this.http.post<StreamingSession>(
            `${this.baseUrl}/web/uploads/streaming`,
            { objectId },
        );
    }

    /** Ticket efímero para reproducir una película publicada. */
    getStreamTicket(movieId: number): Observable<StreamTicket> {
        return this.http.post<StreamTicket>(
            `${this.baseUrl}/web/movies/${movieId}/stream-ticket`,
            null,
        );
    }
}
