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
import { EnrichmentSearchResult } from '@features/movies/models/enrichment';
import { MovieMetadata } from '@features/uploads/models/movie-metadata';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const CACHE_MAX_ENTRIES = 100;

@Component({
    selector: 'app-movie-search-modal',
    imports: [FormsModule],
    templateUrl: './movie-search-modal.html',
    styleUrl: './movie-search-modal.css',
})
export class MovieSearchModal {
    private readonly movieProviderService: MovieProviderService = inject(MovieProviderService);

    private readonly searchSubject = new Subject<string>();
    private readonly cache = new Map<string, EnrichmentSearchResult[]>();

    isOpen = model(false);
    movieSelected = output<MovieMetadata>();

    readonly query = signal('');
    readonly results = signal<EnrichmentSearchResult[]>([]);
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

    selectMovie(movie: EnrichmentSearchResult): void {
        lastValueFrom(
            this.movieProviderService.enrichmentPreview(movie.tmdb_id).pipe(
                map((preview) => ({
                    id: preview.tmdb_id,
                    title: preview.title,
                    originalTitle: preview.originalTitle,
                    year: preview.year,
                    genres: preview.genres,
                    popularity: preview.popularity,
                    duration: preview.duration,
                    director: preview.director,
                    cast: preview.cast,
                    overview: preview.overview,
                    poster_path: preview.poster_path,
                    release_date: preview.release_date,
                    country: preview.country,
                    language: preview.language,
                    awards: [],
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

    private setCache(query: string, movies: EnrichmentSearchResult[]): void {
        this.cache.set(query, movies);

        if (this.cache.size > CACHE_MAX_ENTRIES) {
            this.cache.delete(this.cache.keys().next().value as string);
        }
    }
}