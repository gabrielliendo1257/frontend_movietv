import { MovieMetadata } from '@features/uploads/models/movie-metadata';
import { MediaKind } from '@features/movies/models/media-kind';

export type MovieStatus = 'DRAFT' | 'READY';

export type MovieVisibility = 'PUBLIC' | 'PRIVATE' | 'SHARED';

export interface WebMovie extends MovieMetadata {
    status: MovieStatus;
    visibility?: MovieVisibility;
    objectId?: number | null;
    kind?: MediaKind;
    enrichmentStatus?: string;
}

export type CreateMovieRequest = Omit<MovieMetadata, 'id'>;
