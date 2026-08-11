import { MovieMetadata } from '@features/uploads/models/movie-metadata';

export type MovieStatus = 'DRAFT' | 'PUBLISHED';

export interface WebMovie extends MovieMetadata {
    status: MovieStatus;
}

export type CreateMovieRequest = Omit<MovieMetadata, 'id'>;
