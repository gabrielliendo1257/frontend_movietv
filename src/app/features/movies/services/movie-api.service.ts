import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Movie, RequestMedia, S3Data, SignatureData } from '@features/movies/models/movie-models';

// TODO(BFF): el BFF expondrá el catálogo de películas con metadata y la búsqueda TMDB
// (DTOs pendientes de definir). Estos métodos apuntan a endpoints que aún no existen en
// el BFF y se reescribirán contra /web/movies... cuando el backend los sirva.
@Injectable({
    providedIn: 'root',
})
export class MovieApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.backendAddress + '/api/v1/movie';

    listAll(): Observable<RequestMedia[]> {
        return this.http.get<RequestMedia[]>(`${this.apiUrl}/all`, {
            withCredentials: true,
        });
    }

    createUploadSession(filename: string): Observable<S3Data> {
        return this.http.post<S3Data>(
            `${this.apiUrl}/upload-session`,
            { filename },
            { withCredentials: true },
        );
    }

    saveMovie(movie: Movie, objectKey: string): Observable<unknown> {
        return this.http.post(
            `${this.apiUrl}/save`,
            {
                file: { filename: objectKey },
                media: { ...movie },
            },
            { withCredentials: true },
        );
    }

    streamingSession(objectKey: string): Observable<SignatureData> {
        return this.http.post<SignatureData>(
            `${this.apiUrl}/streaming-session`,
            { filename: objectKey },
            { withCredentials: true },
        );
    }
}