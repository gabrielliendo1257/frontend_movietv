import { MediaKind } from '@features/movies/models/media-kind';

/** Fases visibles del proceso Add Media (espejo de AddMediaPhase del BFF). */
export type AddMediaPhase =
    | 'STARTING'
    | 'PREPARING'
    | 'WAITING_FOR_UPLOAD'
    | 'VERIFYING_UPLOAD'
    | 'FINALIZING'
    | 'READY'
    | 'FAILED'
    | 'CANCELLING'
    | 'CANCELLED';

/** Resultado de búsqueda de candidatos (GET /web/add-media/candidates). */
export interface MovieCandidate {
    providerId: number;
    title: string;
    year: number | null;
    posterPath: string | null;
    releaseDate: string;
    overview: string;
}

/** Detalle del candidato elegido (GET /web/add-media/candidates/{providerId}). */
export interface MovieCandidatePreview {
    providerId: number;
    title: string;
    originalTitle: string;
    year: number | null;
    genres: string[];
    duration: string;
    director: string;
    cast: string[];
    overview: string;
    posterPath: string | null;
    releaseDate: string;
    country: string;
    language: string;
}

/** Draft que el front ya resolvió desde el preview (CreateMovieRequest del BFF). */
export interface MovieDraft {
    title: string;
    originalTitle?: string;
    genres?: string[];
    duration?: string;
    director?: string;
    cast?: string[];
    overview?: string;
    poster_path?: string | null;
    release_date?: string;
    country?: string;
    language?: string;
    awards?: string[];
    kind?: MediaKind;
}

export interface StartAddMediaCommand {
    file: {
        filename: string;
        sizeBytes: number;
        mimeType: string;
    };
    movie: {
        providerId: number;
        draft: MovieDraft;
    };
    access?: {
        visibility: string;
        sharedWith?: string[];
    };
    idempotencyKey: string;
}

export interface UploadInstructions {
    url: string;
    method: 'PUT' | 'POST';
    storageKey: string;
    expectedSizeBytes: number;
    expectedMimeType: string;
}

/** Vista del proceso de alta (AddMediaResponse del BFF). */
export interface AddMediaProcess {
    addMediaId: string;
    phase: AddMediaPhase;
    movieId: number | null;
    uploadId: string | null;
    upload: UploadInstructions | null;
    failureCode: string | null;
}
