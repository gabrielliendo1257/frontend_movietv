import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { API_BASE_URL } from '@core/config/api-base-url';
import { MoviesApi } from '@features/movies/data-access/movies-api';
import { StreamingApi } from '@features/movies/data-access/streaming-api';
import { MovieStreamStore } from '@features/movies/data-access/movie-stream-store';
import { WebMovie } from '@features/movies/models/web-movie';

const SAMPLE_VIDEO_URL =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

/**
 * Estado de la experiencia de reproducción para una navegación.
 * Se provee por página: cada visita tiene su propia instancia.
 */
@Injectable()
export class WatchStore {
    private readonly moviesApi = inject(MoviesApi);
    private readonly streamingApi = inject(StreamingApi);
    private readonly movieStreamStore = inject(MovieStreamStore);
    private readonly baseUrl = inject(API_BASE_URL);

    readonly movie = signal<WebMovie | null>(null);
    readonly videoSrc = signal(SAMPLE_VIDEO_URL);
    readonly poster = signal('');
    readonly title = signal('');
    readonly year = signal('');
    readonly overview = signal('');
    readonly loading = signal(true);

    load(id: number): void {
        this.reset();
        this.loading.set(true);

        this.moviesApi.findById(id).subscribe({
            next: (movie) => {
                this.movie.set(movie);
                this.applyMedia(movie);
                this.loading.set(false);
            },
            error: (error: unknown) => {
                if (error instanceof HttpErrorResponse && error.status !== 404) {
                    console.error('Web movie unavailable', error);
                }
                this.loading.set(false);
            },
        });
    }

    /** Ticket del BFF y, si no está disponible, sesión directa por objectId. */
    private applyMedia(movie: WebMovie): void {
        this.title.set(movie.title);
        this.year.set(movie.release_date?.slice(0, 4) ?? '');
        this.overview.set(movie.overview ?? '');
        if (movie.poster_path) {
            this.poster.set(this.resolvePosterUrl(movie.poster_path));
        }
        this.resolveStreaming(movie);
    }

    private reset(): void {
        this.movie.set(null);
        this.videoSrc.set(SAMPLE_VIDEO_URL);
        this.poster.set('');
        this.title.set('');
        this.year.set('');
        this.overview.set('');
    }

    private resolvePosterUrl(posterPath: string): string {
        return posterPath.startsWith('http')
            ? posterPath
            : `https://image.tmdb.org/t/p/w500${posterPath}`;
    }

    private resolveStreaming(movie: WebMovie): void {
        this.streamingApi.getStreamTicket(movie.id).subscribe({
            next: (ticket) => {
                if (!ticket.url) {
                    this.fallbackStream(movie);
                    return;
                }
                this.videoSrc.set(
                    ticket.url.startsWith('http') ? ticket.url : this.baseUrl + ticket.url,
                );
            },
            error: (error: unknown) => {
                console.error('Stream ticket unavailable, falling back', error);
                this.fallbackStream(movie);
            },
        });
    }

    private fallbackStream(movie: WebMovie): void {
        const objectId = movie.objectId ?? this.movieStreamStore.getStorageId(movie.id);
        if (objectId == null) return;

        this.streamingApi.stream(String(objectId)).subscribe({
            next: (session) => {
                if (session.streamingUrl) this.videoSrc.set(session.streamingUrl);
            },
            error: (error: unknown) =>
                console.error('Streaming unavailable, using sample video', error),
        });
    }
}
