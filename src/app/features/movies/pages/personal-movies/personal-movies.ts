import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MovieApiService } from '@features/movies/services/movie-api.service';
import { RequestMedia } from '@features/movies/models/movie-models';
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
    private readonly movieApiService = inject(MovieApiService);
    private readonly tmdbService = inject(TmdbService);

    movies: RequestMedia[] | null = null;

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
        this.movieApiService.listAll().subscribe({
            next: (movies) => {
                this.movies = movies;
            },
            error: () => {
                this.movies = this.mockMovies;
            },
        });
    }

    private readonly mockMovies: RequestMedia[] = [
        { id: 1, title: 'Inception', overview: '', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', release_date: '2010-07-16', vote_average: 8.4, popularity: 85, s3_data: [] },
        { id: 2, title: 'The Dark Knight', overview: '', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', release_date: '2008-07-18', vote_average: 9.0, popularity: 92, s3_data: [] },
        { id: 3, title: 'Interstellar', overview: '', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', release_date: '2014-11-07', vote_average: 8.7, popularity: 88, s3_data: [] },
        { id: 4, title: 'Pulp Fiction', overview: '', poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', release_date: '1994-10-14', vote_average: 8.5, popularity: 80, s3_data: [] },
        { id: 5, title: 'The Matrix', overview: '', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', release_date: '1999-03-31', vote_average: 8.2, popularity: 78, s3_data: [] },
        { id: 6, title: 'Gladiator', overview: '', poster_path: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', release_date: '2000-05-05', vote_average: 8.2, popularity: 75, s3_data: [] },
        { id: 7, title: 'Parasite', overview: '', poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', release_date: '2019-05-30', vote_average: 8.5, popularity: 90, s3_data: [] },
        { id: 8, title: 'Spirited Away', overview: '', poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', release_date: '2001-07-20', vote_average: 8.6, popularity: 82, s3_data: [] },
        { id: 9, title: 'The Shawshank Redemption', overview: '', poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', release_date: '1994-09-23', vote_average: 8.7, popularity: 95, s3_data: [] },
        { id: 10, title: 'Blade Runner 2049', overview: '', poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', release_date: '2017-10-06', vote_average: 8.0, popularity: 74, s3_data: [] },
        { id: 11, title: 'Dune', overview: '', poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', release_date: '2021-10-22', vote_average: 8.0, popularity: 87, s3_data: [] },
        { id: 12, title: 'The Godfather', overview: '', poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', release_date: '1972-03-24', vote_average: 8.7, popularity: 84, s3_data: [] },
        { id: 13, title: 'Oppenheimer', overview: '', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', release_date: '2023-07-21', vote_average: 8.1, popularity: 89, s3_data: [] },
        { id: 14, title: 'Joker', overview: '', poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', release_date: '2019-10-04', vote_average: 8.2, popularity: 86, s3_data: [] },
        { id: 15, title: 'Spider-Man: Into the Spider-Verse', overview: '', poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', release_date: '2018-12-14', vote_average: 8.4, popularity: 83, s3_data: [] },
        { id: 16, title: 'The Grand Budapest Hotel', overview: '', poster_path: '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', release_date: '2014-03-28', vote_average: 8.1, popularity: 77, s3_data: [] },
    ];

    selectMovie(currentMovie: RequestMedia): void {
        const firstFile = currentMovie.s3_data[0];
        if (!firstFile) return;

        this.movieApiService.streamingSession(firstFile.object_key).subscribe({
            next: (session) => {
                if (session.presigned_url) {
                    window.location.href = session.presigned_url;
                }
            },
            error: (error) => console.error(error),
        });
    }
}