import { MovieVisibility } from '@features/movies/models/web-movie';

export type VisibilityJobStatus = 'RUNNING' | 'DONE';

/** Cambio de visibilidad en lote: ids directos y/o librerías enteras. */
export interface BulkVisibilityRequest {
    movieIds?: number[];
    libraryIds?: number[];
    visibility: MovieVisibility;
    usernames?: string[];
}

/** Estado de un trabajo de visibilidad en lote (viene del SSE). */
export interface VisibilityJob {
    jobId: string;
    status: VisibilityJobStatus;
    total: number;
    done: number;
    failed: number;
}
