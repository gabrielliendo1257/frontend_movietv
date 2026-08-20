import { MovieMetadata } from '@features/uploads/models/movie-metadata';

export type MovieStatus = 'DRAFT' | 'READY';

export type MovieVisibility = 'PUBLIC' | 'PRIVATE' | 'SHARED';

export interface WebMovie extends MovieMetadata {
    status: MovieStatus;
    visibility?: MovieVisibility;
    objectId?: number | null;
}

export type CreateMovieRequest = Omit<MovieMetadata, 'id'>;
