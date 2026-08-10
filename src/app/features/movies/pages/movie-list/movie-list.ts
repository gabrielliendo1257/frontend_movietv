import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { InputSearch } from '@features/movies/components/input-search/input-search';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';
import { CardMovieSkeleton } from '@features/movies/components/card-movie-skeleton/card-movie-skeleton';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { MovieSummary, Pagination } from '@features/movies/models/the-movie-db';

export type StatusSearch = 'IDLE' | 'SEARCHING' | 'EMPTY_LIST' | 'ERROR_SEARCH' | 'SUCCESS_SEARCH';

const MIN_QUERY_LENGTH = 3;

@Component({
    selector: 'app-movie-list',
    imports: [FormsModule, InputSearch, CardMovieUi, CardMovieSkeleton],
    templateUrl: './movie-list.html',
    styleUrl: './movie-list.css',
})
export class MovieList {
    private readonly tmdbService = inject(TmdbService);

    private readonly query = signal('');
    private readonly canSearch = computed(() => this.query().trim().length >= MIN_QUERY_LENGTH);

    private readonly searchResults = resource<Pagination<MovieSummary>, string | undefined>({
        params: () => (this.canSearch() ? this.query() : undefined),
        loader: ({ params }) => lastValueFrom(this.tmdbService.searchMovies(params)),
    });

    readonly movies = computed<MovieSummary[]>(() =>
        this.canSearch() ? (this.searchResults.value()?.results ?? []) : [],
    );

    readonly status = computed<StatusSearch>(() => {
        if (!this.canSearch()) return 'IDLE';
        if (this.searchResults.isLoading()) return 'SEARCHING';
        if (this.searchResults.error()) return 'ERROR_SEARCH';

        const results = this.searchResults.value()?.results;
        if (!results) return 'IDLE';

        return results.length > 0 ? 'SUCCESS_SEARCH' : 'EMPTY_LIST';
    });

    searchMovies(textQuery: string): void {
        this.query.set(textQuery);
    }
}