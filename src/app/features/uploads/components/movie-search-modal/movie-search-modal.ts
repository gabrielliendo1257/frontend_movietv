import { Component, computed, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    EMPTY,
    filter,
    map,
    Subject,
    switchMap,
    tap,
} from 'rxjs';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { MovieSummary } from '@features/movies/models/the-movie-db';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const CACHE_MAX_ENTRIES = 100;
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const withPosterUrl = (movie: MovieSummary): MovieSummary =>
    movie.poster_path ? { ...movie, poster_path: `${TMDB_IMAGE_URL}${movie.poster_path}` } : movie;

@Component({
    selector: 'app-movie-search-modal',
    imports: [FormsModule],
    templateUrl: './movie-search-modal.html',
    styleUrl: './movie-search-modal.css',
})
export class MovieSearchModal {
    private readonly movieProviderService: MovieProviderService = inject(MovieProviderService);

    private readonly searchSubject = new Subject<string>();
    private readonly cache = new Map<string, MovieSummary[]>();

    isOpen = model(false);
    movieSelected = output<MovieMetadata>();

    readonly query = signal('');
    readonly results = signal<MovieSummary[]>([]);
    readonly searching = signal(false);

    readonly showNoResults = computed(
        () => !this.searching() && this.query().trim().length >= MIN_QUERY_LENGTH && !this.results().length,
    );

    constructor() {
        this.searchSubject
            .pipe(
                debounceTime(SEARCH_DEBOUNCE_MS),
                map((value) => value.trim()),
                filter((query) => query.length >= MIN_QUERY_LENGTH),
                distinctUntilChanged(),
                switchMap((query) => this.performSearch(query)),
            )
            .subscribe();
    }

    onSearchInput(value: string): void {
        this.query.set(value);
        this.searchSubject.next(value);
    }

    selectMovie(movie: MovieSummary): void {
        lastValueFrom(
            this.movieProviderService.enrichmentPreview(movie.id).pipe(
                map((details) => ({
                    id: details.id,
                    release_date: details.release_date,
                    genres: details.genres.map((genre) => genre.name),
                    originalTitle: details.original_title,
                    duration: `${details.runtime} min`,
                    awards: [],
                    cast: [],
                    country: '',
                    director: '',
                    language: details.original_language,
                    overview: details.overview,
                    popularity: details.popularity,
                    poster_path: details.poster_path
                        ? `${TMDB_IMAGE_URL}${details.poster_path}`
                        : null,
                    title: details.title,
                    year: new Date(details.release_date).getFullYear(),
                })),
            ),
        )
            .then((metadata) => this.movieSelected.emit(metadata))
            .catch((error) => console.error(error));
    }

    close(): void {
        this.isOpen.set(false);
        this.query.set('');
        this.results.set([]);
    }

    onBackdropClick(e: MouseEvent): void {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close();
        }
    }

    private performSearch(query: string) {
        const cached = this.cache.get(query);
        if (cached) {
            this.cache.delete(query);
            this.cache.set(query, cached);
            this.results.set(cached);
            this.searching.set(false);
            return EMPTY;
        }

        this.searching.set(true);

        return this.movieProviderService.enrichmentSearch(query).pipe(
            map((page) => page.results.map(withPosterUrl)),
            tap((movies) => {
                this.setCache(query, movies);
                this.results.set(movies);
                this.searching.set(false);
            }),
            catchError((error) => {
                console.error(error);
                this.searching.set(false);
                return EMPTY;
            }),
        );
    }

    private setCache(query: string, movies: MovieSummary[]): void {
        this.cache.set(query, movies);

        if (this.cache.size > CACHE_MAX_ENTRIES) {
            this.cache.delete(this.cache.keys().next().value as string);
        }
    }
}