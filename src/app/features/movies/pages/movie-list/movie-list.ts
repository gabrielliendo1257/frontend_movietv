import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputSearch } from '@features/movies/components/input-search/input-search';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';
import { CardMovieSkeleton } from '@features/movies/components/card-movie-skeleton/card-movie-skeleton';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { MovieSummary } from '@features/movies/models/the-movie-db';

export type StatusSearch = 'IDLE' | 'SEARCHING' | 'EMPTY_LIST' | 'ERROR_SEARCH' | 'SUCCESS_SEARCH';

@Component({
    selector: 'app-movie-list',
    imports: [FormsModule, InputSearch, CardMovieUi, CardMovieSkeleton],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.css',
})
export class MovieList {
    private readonly tmdbService = inject(TmdbService);

    readonly movies = signal<MovieSummary[]>([]);
    readonly status = signal<StatusSearch>('IDLE');

    searchMovies(textQuery: string): void {
        if (!textQuery.trim()) return;

        this.status.set('SEARCHING');
        this.tmdbService.searchMovies(textQuery).subscribe({
            next: (page) => {
                this.movies.set(page.results);
                this.status.set(page.results.length > 0 ? 'SUCCESS_SEARCH' : 'EMPTY_LIST');
            },
            error: () => this.status.set('ERROR_SEARCH'),
        });
    }
}