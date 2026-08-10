import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieApiService } from '@features/movies/services/movie-api.service';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { RequestMedia } from '@features/movies/models/movie-models';
import { MovieDetails, MovieSummary } from '@features/movies/models/the-movie-db';
import { VideoPlayer } from '@features/player/components/video-player/video-player';
import { CardMovieUi } from '@features/movies/components/card-movie-ui/card-movie-ui';

const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

@Component({
    selector: 'app-watch-page',
    imports: [VideoPlayer, CardMovieUi, RouterLink],
    templateUrl: './watch-page.html',
    styleUrl: './watch-page.css',
})
export class WatchPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly movieApiService = inject(MovieApiService);
    private readonly tmdbService = inject(TmdbService);

    readonly movie = signal<RequestMedia | null>(null);
    readonly details = signal<MovieDetails | null>(null);
    readonly videoSrc = signal(SAMPLE_VIDEO_URL);
    readonly poster = signal('');
    readonly title = signal('');
    readonly year = signal('');
    readonly overview = signal('');
    readonly recommendations = signal<MovieSummary[]>([]);
    readonly loading = signal(true);

    readonly meta = computed(() => {
        const parts: string[] = [];
        if (this.year()) parts.push(this.year());
        const runtime = this.details()?.runtime;
        if (runtime) parts.push(this.formatRuntime(runtime));
        const rating = this.details()?.vote_average ?? this.movie()?.vote_average;
        if (rating != null) parts.push(`${rating.toFixed(1)} ★`);
        return parts.join(' · ');
    });

    readonly genreNames = computed(() => this.details()?.genres.map((genre) => genre.name).slice(0, 4) ?? []);

    ngOnInit(): void {
        this.route.paramMap.subscribe(() => {
            const id = Number(this.route.snapshot.paramMap.get('id'));
            if (Number.isNaN(id)) {
                this.router.navigate(['/movies']);
                return;
            }
            this.load(id);
        });
    }

    goBack(): void {
        this.router.navigate(['/movies']);
    }

    private load(id: number): void {
        this.loading.set(true);

        this.movieApiService.listAll().subscribe({
            next: (movies) => {
                const movie = movies.find((item) => item.id === id) ?? null;
                this.movie.set(movie);
                this.applyMedia(movie);
                this.loading.set(false);
            },
            error: () => {
                this.applyMedia(null);
                this.loading.set(false);
            },
        });

        this.tmdbService.findMovieDetails(id).subscribe({
            next: (details) => {
                this.details.set(details);
                if (details.title) this.title.set(details.title);
                if (details.release_date) this.year.set(details.release_date.slice(0, 4));
                if (details.overview) this.overview.set(details.overview);
                if (!this.poster()) this.poster.set(details.poster_path ?? '');
            },
            error: () => console.error('TMDB details unavailable'),
        });

        this.tmdbService.getPopularMovies().subscribe({
            next: (results) =>
                this.recommendations.set(
                    results
                        .filter((item) => item.id !== id)
                        .filter((item) => item.poster_path)
                        .slice(0, 5),
                ),
            error: () => console.error('TMDB popular unavailable'),
        });
    }

    private applyMedia(movie: RequestMedia | null): void {
        if (movie) {
            this.title.set(movie.title);
            this.year.set(movie.release_date?.slice(0, 4) ?? '');
            this.overview.set(movie.overview ?? '');
            this.poster.set(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
        }

        const firstFile = movie?.s3_data[0];
        if (firstFile?.object_key) {
            this.movieApiService.streamingSession(firstFile.object_key).subscribe({
                next: (session) => {
                    if (session.presigned_url) {
                        this.videoSrc.set(session.presigned_url);
                    }
                },
                error: () => console.error('streaming session unavailable'),
            });
        }
    }

    private formatRuntime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
}
