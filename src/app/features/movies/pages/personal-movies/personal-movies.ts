import { Component, inject, signal } from '@angular/core';
import { MoviesApi } from '@features/movies/data-access/movies-api';
import { WebMovie } from '@features/movies/models/web-movie';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';

@Component({
    selector: 'app-personal-movies',
    imports: [CardMovieUi],
    templateUrl: './personal-movies.html',
    styleUrl: './personal-movies.css',
})
export class PersonalMovies {
    private readonly moviesApi = inject(MoviesApi);

    readonly movies = signal<WebMovie[] | null>(null);
    readonly loading = signal(true);
    readonly error = signal(false);

    constructor() {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set(false);
        this.moviesApi.list().subscribe({
            next: (movies) => {
                this.movies.set(movies);
                this.loading.set(false);
            },
            error: () => {
                // El fallo no se enmascara como catálogo vacío.
                this.error.set(true);
                this.loading.set(false);
            },
        });
    }

    posterUrl(movie: WebMovie): string {
        if (!movie.poster_path) return '';
        return movie.poster_path.startsWith('http')
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }
}
