import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { WebMovie } from '@features/movies/models/web-movie';
import { MovieSummary } from '@features/movies/models/the-movie-db';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';
import { FeaturedMovieCard } from '@features/movies/components/featured-movie-card/featured-movie-card';

const GENRE_NAMES: Record<number, string> = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    18: 'Drama',
    80: 'Crimen',
    99: 'Documental',
    10751: 'Familia',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia ficción',
    10770: 'TV Movie',
    53: 'Suspense',
    10752: 'Bélica',
    37: 'Western',
};

@Component({
    selector: 'app-personal-movies',
    imports: [CardMovieUi, FeaturedMovieCard],
    templateUrl: './personal-movies.html',
    styleUrl: './personal-movies.css',
})
export class PersonalMovies implements OnInit {
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly tmdbService = inject(TmdbService);

    movies: WebMovie[] | null = null;

    readonly trending = signal<MovieSummary[]>([]);
    readonly popular = signal<MovieSummary[]>([]);
    readonly nowPlaying = signal<MovieSummary[]>([]);

    readonly hero = computed(() => this.trending()[0] ?? null);

    readonly trendingRow = computed(() => this.trending().slice(1, 11));
    readonly latestRow = computed(() => this.nowPlaying().slice(0, 10));

    readonly featured = computed(() =>
        this.popular()
            .filter((movie) => movie.backdrop_path)
            .slice(0, 2),
    );

    ngOnInit(): void {
        this.loadCatalogRows();
        this.listMedias();
    }

    heroGenres(genreIds: number[]): string {
        return genreIds
            .map((id) => GENRE_NAMES[id])
            .filter((name): name is string => !!name)
            .slice(0, 2)
            .join(' · ');
    }

    posterUrl(movie: WebMovie): string {
        if (!movie.poster_path) return '';
        return movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }

    private loadCatalogRows(): void {
        this.tmdbService.getTrendingMovies().subscribe({
            next: (results) => this.trending.set(results),
            error: () => console.error('TMDB trending unavailable'),
        });

        this.tmdbService.getPopularMovies().subscribe({
            next: (results) => this.popular.set(results),
            error: () => console.error('TMDB popular unavailable'),
        });

        this.tmdbService.getNowPlayingMovies().subscribe({
            next: (results) => this.nowPlaying.set(results),
            error: () => console.error('TMDB now playing unavailable'),
        });
    }

    private listMedias(): void {
        this.movieProviderService.list(50).subscribe({
            next: (movies) => {
                this.movies = movies;
            },
            error: (error) => {
                console.error('Web movies unavailable', error);
                this.movies = [];
            },
        });
    }
}