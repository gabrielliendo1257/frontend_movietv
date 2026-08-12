import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StreamingSession } from '@features/movies/models/streaming-session';

@Injectable({
    providedIn: 'root',
})
export class StreamingService {
    private readonly http = inject(HttpClient);
    private readonly streamingUrl = environment.backendAddress + '/web/uploads/streaming';

    stream(objectId: string): Observable<StreamingSession> {
        return this.http.post<StreamingSession>(this.streamingUrl, { objectId }, { withCredentials: true });
    }
}