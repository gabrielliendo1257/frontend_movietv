import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import {
    AddMediaPhase,
    AddMediaProcess,
    MovieCandidate,
    MovieCandidatePreview,
    MovieDraft,
    StartAddMediaCommand,
    UploadInstructions,
} from '@features/uploads/models/add-media';

/* ─── DTOs wire (snake_case tal como serializa el BFF) ─── */

interface CandidateWire {
    tmdb_id: number;
    title: string;
    year: number | null;
    poster_path: string | null;
    release_date: string;
    overview: string;
}

interface CandidatePreviewWire {
    title: string;
    originalTitle: string;
    year: number | null;
    genres: string[];
    duration: string;
    director: string;
    cast: string[];
    overview: string;
    poster_path: string | null;
    release_date: string;
    country: string;
    language: string;
    tmdb_id: number;
}

interface AddMediaProcessWire {
    addMediaId: string;
    phase: AddMediaPhase;
    movieId: number | null;
    uploadId: string | null;
    upload: {
        url: string;
        method: 'PUT' | 'POST';
        storageKey: string;
        expectedSizeBytes: number;
        expectedMimeType: string;
    } | null;
    failureCode: string | null;
}

export type UploadHttpEvent = HttpEvent<unknown>;

/**
 * Cliente de la experiencia "Añadir contenido": candidatos, proceso con
 * idempotencia, subida directa al storage y cierre. El BFF orquesta los
 * microservicios; aquí solo se expresa la intención del usuario.
 */
@Injectable({ providedIn: 'root' })
export class AddMediaApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL) + '/web/add-media';

    searchCandidates(query: string): Observable<MovieCandidate[]> {
        return this.http
            .get<CandidateWire[]>(`${this.baseUrl}/candidates`, { params: { query } })
            .pipe(map((items) => items.map(toCandidate)));
    }

    candidatePreview(providerId: number): Observable<MovieCandidatePreview> {
        return this.http
            .get<CandidatePreviewWire>(`${this.baseUrl}/candidates/${providerId}`)
            .pipe(map(toPreview));
    }

    /** Inicia el alta. Replays con el mismo idempotencyKey no duplican recursos. */
    start(command: StartAddMediaCommand): Observable<AddMediaProcess> {
        return this.http
            .post<AddMediaProcessWire>(this.baseUrl, command)
            .pipe(map(toProcess));
    }

    status(addMediaId: string): Observable<AddMediaProcess> {
        return this.http.get<AddMediaProcessWire>(`${this.baseUrl}/${addMediaId}`).pipe(map(toProcess));
    }

    /**
     * Cierre: 200 → READY, 202 → storage aún verifica, 409 → veredicto
     * definitivo con rollback ya ejecutado en el BFF.
     */
    complete(addMediaId: string, sizeBytes?: number): Observable<AddMediaProcess> {
        return this.http
            .post<AddMediaProcessWire>(`${this.baseUrl}/${addMediaId}/complete`,
                sizeBytes == null ? null : { sizeBytes })
            .pipe(map(toProcess));
    }

    cancel(addMediaId: string): Observable<AddMediaProcess> {
        return this.http.post<AddMediaProcessWire>(`${this.baseUrl}/${addMediaId}/cancel`, null).pipe(map(toProcess));
    }

    /**
     * Sube el archivo directo al storage con las instrucciones presigned.
     * No pasa por el BFF: no debe enviarse la cookie de sesión.
     */
    uploadToStorage(file: File, instructions: UploadInstructions): Observable<UploadHttpEvent> {
        if (instructions.method === 'POST') {
            const form = new FormData();
            form.append('file', file);

            return this.http.post<unknown>(instructions.url, form, {
                reportProgress: true,
                observe: 'events',
            });
        }

        return this.http.put<unknown>(instructions.url, file, {
            headers: { 'Content-Type': instructions.expectedMimeType },
            reportProgress: true,
            observe: 'events',
        });
    }
}

function toCandidate(wire: CandidateWire): MovieCandidate {
    return {
        providerId: wire.tmdb_id,
        title: wire.title,
        year: wire.year,
        posterPath: wire.poster_path,
        releaseDate: wire.release_date,
        overview: wire.overview,
    };
}

function toPreview(wire: CandidatePreviewWire): MovieCandidatePreview {
    return {
        providerId: wire.tmdb_id,
        title: wire.title,
        originalTitle: wire.originalTitle,
        year: wire.year,
        genres: wire.genres ?? [],
        duration: wire.duration,
        director: wire.director,
        cast: wire.cast ?? [],
        overview: wire.overview,
        posterPath: wire.poster_path,
        releaseDate: wire.release_date,
        country: wire.country,
        language: wire.language,
    };
}

function toProcess(wire: AddMediaProcessWire): AddMediaProcess {
    return {
        addMediaId: wire.addMediaId,
        phase: wire.phase,
        movieId: wire.movieId,
        uploadId: wire.uploadId,
        upload: wire.upload,
        failureCode: wire.failureCode,
    };
}
