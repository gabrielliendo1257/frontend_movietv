import { Component, computed, inject, model, output, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { catchError, EMPTY, tap } from 'rxjs';
import { MovieSummary, Pagination } from '@features/movies/models/the-movie-db';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';

const MIN_QUERY_LENGTH = 2;

@Component({
    selector: 'app-movie-search-modal',
    imports: [FormsModule],
    templateUrl: './movie-search-modal.html',
    styleUrl: './movie-search-modal.css',
})
export class MovieSearchModal {
    private readonly tmdbService: TmdbService = inject(TmdbService);

    isOpen = model(false);
    movieSelected = output<MovieMetadata>();

    readonly query = signal('');

    private readonly searchResults = resource<Pagination<MovieSummary>, string | undefined>({
        params: () => (this.query().trim().length >= MIN_QUERY_LENGTH ? this.query() : undefined),
        loader: ({ params }) => lastValueFrom(this.tmdbService.searchMovies(params)),
    });

    readonly searching = computed(() => this.searchResults.isLoading());

    readonly results = computed<MovieSummary[]>(() =>
        this.query().trim().length >= MIN_QUERY_LENGTH
            ? (this.searchResults.value()?.results ?? [])
            : [],
    );

    onSearchInput(value: string): void {
        this.query.set(value);
    }

    selectMovie(movie: MovieSummary): void {
        this.tmdbService
            .findMovieDetails(movie.id)
            .pipe(
                tap((movieDetails) => {
                    this.movieSelected.emit({
                        id: movieDetails.id,
                        release_date: movieDetails.release_date,
                        genres: movieDetails.genres.map((genre) => genre.name),
                        originalTitle: movieDetails.original_title,
                        duration: `${movieDetails.runtime} min`,
                        awards: [],
                        cast: [],
                        country: '',
                        director: '',
                        language: movieDetails.original_language,
                        overview: movieDetails.overview,
                        popularity: movieDetails.popularity,
                        poster_path: movieDetails.poster_path,
                        title: movieDetails.title,
                        year: new Date(movieDetails.release_date).getFullYear(),
                    });
                }),

                catchError((error) => {
                    console.error(error);

                    return EMPTY;
                }),
            )
            .subscribe();
    }

    close(): void {
        this.isOpen.set(false);
        this.query.set('');
    }

    onBackdropClick(e: MouseEvent): void {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close();
        }
    }
}