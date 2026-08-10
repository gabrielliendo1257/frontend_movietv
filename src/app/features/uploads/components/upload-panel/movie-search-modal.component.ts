import { Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { MovieSummary } from '@features/movies/models/the-movie-db';
import { MovieMetadata } from './movie-data';

@Component({
    selector: 'app-movie-search-modal',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './movie-search-modal.component.html',
    styleUrls: ['./movie-search-modal.component.css'],
})
export class MovieSearchModalComponent {
    private readonly tmdbService: TmdbService = inject(TmdbService);

    isOpen = model(false);
    movieSelected = output<MovieMetadata>();

    query = signal('');
    results = signal<MovieSummary[]>([]);
    searching = signal(false);

    onSearchInput(value: string): void {
        this.query.set(value);
        if (value.trim().length < 2) {
            this.results.set([]);
            return;
        }
        this.searching.set(true);

        this.tmdbService
            .searchMovies(value)
            .pipe(
                map((pag) => {
                    if (pag.results.length == 0) {
                        console.log('Empty results.');
                    } else {
                        console.log('Page results: ', pag.results);
                        this.results.set(pag.results);
                        this.searching.set(false);
                    }
                }),

                catchError((error) => {
                    console.error(error);
                    //this.handleError('Upload failed.');
                    this.searching.set(false);

                    return EMPTY;
                }),
            )
            .subscribe();
    }

    selectMovie(movie: MovieSummary): void {
        this.tmdbService
            .findMovieDetails(movie.id)
            .pipe(
                tap((mov) => {
                    console.log('Movie Details for movie : ', mov);
                    this.movieSelected.emit({
                        id: mov.id,
                        release_date: mov.release_date,
                        genres: mov.genres.map((genre) => genre.name),
                        originalTitle: mov.original_title,
                        duration: `${mov.runtime} min`,
                        awards: [],
                        cast: [],
                        country: '',
                        director: '',
                        language: mov.original_language,
                        overview: mov.overview,
                        popularity: mov.popularity,
                        poster_path: mov.poster_path,
                        title: mov.title,
                        year: new Date(mov.release_date).getFullYear(),
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
        this.results.set([]);
    }

    onBackdropClick(e: MouseEvent): void {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close();
        }
    }
}
