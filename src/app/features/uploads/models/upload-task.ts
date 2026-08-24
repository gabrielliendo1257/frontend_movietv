import { MediaKind } from '@features/movies/models/media-kind';
import { MovieMetadata } from '@features/movies/models/movie-metadata';

/** Estados que le interesan a la UX; el detalle fino vive en AddMediaPhase del BFF. */
export type UploadState =
    | 'starting'
    | 'uploading'
    | 'verifying'
    | 'completed'
    | 'failed'
    | 'cancelled';

export const ACTIVE_UPLOAD_STATES: ReadonlySet<UploadState> = new Set<UploadState>([
    'starting',
    'uploading',
    'verifying',
]);

export interface UploadTask {
    /** Clave local de la tarea; es el idempotencyKey del proceso en el BFF. */
    readonly uploadId: string;
    readonly addMediaId: string | null;
    readonly movieId: number | null;
    readonly file: File | null;
    readonly fileName: string;
    readonly progress: number;
    readonly state: UploadState;
    readonly metadata: MovieMetadata;
    readonly kind: MediaKind;
    readonly error?: string | null;
}
