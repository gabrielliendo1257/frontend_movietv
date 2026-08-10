import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MovieDetails, MovieSummary, Pagination } from '@features/movies/models/the-movie-db';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';

const withPosterUrl = <T extends { poster_path: string | null }>(movie: T): T =>
    movie.poster_path ? { ...movie, poster_path: `${TMDB_IMAGE_URL}${movie.poster_path}` } : movie;

const withBackdropUrl = <T extends { backdrop_path: string | null }>(movie: T): T =>
    movie.backdrop_path ? { ...movie, backdrop_path: `${TMDB_BACKDROP_URL}${movie.backdrop_path}` } : movie;

@Injectable({
    providedIn: 'root',
})
export class TmdbService {
    // TODO Seguridad: mover búsqueda de metadata al backend o a un servicio intermedio.
    // El token no debe viajar en el bundle del cliente.
    private readonly apiToken =
        'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MzBjNDA4ZjQ0MmY2N2MwM2I4ODliNThmNGEwYzUzMCIsIm5iZiI6MTc2Mjk4OTgwMi4zNTEsInN1YiI6IjY5MTUxNmVhYTMzNDQ5YzA2NjljNGRlMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qLE518W4bDDVaMRYMp93S-Al9Yu1Pe48DT0ABf8Xsug';

    private readonly http = inject(HttpClient);

    searchMovies(query: string): Observable<Pagination<MovieSummary>> {
        return this.http
            .get<Pagination<MovieSummary>>(`${TMDB_API_URL}/search/movie`, {
                headers: this.authHeaders(),
                params: {
                    include_adult: 'false',
                    language: 'es-ES',
                    page: '1',
                    query,
                },
            })
            .pipe(map((page) => ({ ...page, results: page.results.map(withPosterUrl) })));
    }

    getTrendingMovies(): Observable<MovieSummary[]> {
        return this.http
            .get<Pagination<MovieSummary>>(`${TMDB_API_URL}/trending/movie/week`, {
                headers: this.authHeaders(),
                params: { language: 'es-ES' },
            })
            .pipe(map((page) => page.results.map(withPosterUrl).map(withBackdropUrl)));
    }

    getPopularMovies(): Observable<MovieSummary[]> {
        return this.http
            .get<Pagination<MovieSummary>>(`${TMDB_API_URL}/movie/popular`, {
                headers: this.authHeaders(),
                params: { language: 'es-ES' },
            })
            .pipe(map((page) => page.results.map(withPosterUrl).map(withBackdropUrl)));
    }

    getNowPlayingMovies(): Observable<MovieSummary[]> {
        return this.http
            .get<Pagination<MovieSummary>>(`${TMDB_API_URL}/movie/now_playing`, {
                headers: this.authHeaders(),
                params: { language: 'es-ES' },
            })
            .pipe(map((page) => page.results.map(withPosterUrl).map(withBackdropUrl)));
    }

    findMovieDetails(movieId: number): Observable<MovieDetails> {
        return this.http
            .get<MovieDetails>(`${TMDB_API_URL}/movie/${movieId}`, {
                headers: this.authHeaders(),
            })
            .pipe(map(withPosterUrl));
    }

    private authHeaders(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.apiToken}`,
            accept: 'application/json',
        };
    }
}