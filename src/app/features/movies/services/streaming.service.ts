import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StreamingSession } from '@features/movies/models/streaming-session';

export interface StreamTicket {
    url: string;
}

@Injectable({
    providedIn: 'root',
})
export class StreamingService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress;
    private readonly streamingUrl = this.baseUrl + '/web/uploads/streaming';

    stream(objectId: string): Observable<StreamingSession> {
        return this.http.post<StreamingSession>(this.streamingUrl, { objectId }, { withCredentials: true });
    }

    getStreamTicket(movieId: number): Observable<StreamTicket> {
        return this.http.post<StreamTicket>(
            `${this.baseUrl}/web/movies/${movieId}/stream-ticket`,
            null,
            { withCredentials: true },
        );
    }
}