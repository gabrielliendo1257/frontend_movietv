import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { MovieVisibility, WebMovie } from '@features/movies/models/web-movie';
import { ToastService } from '@core/services/toast.service';

const VISIBILITY_LABELS: Record<MovieVisibility, string> = {
    PUBLIC: 'Pública',
    PRIVATE: 'Privada',
    SHARED: 'Compartida',
};

@Component({
    selector: 'app-movie-detail',
    imports: [FormsModule],
    templateUrl: './movie-detail.html',
    styleUrl: './movie-detail.css',
})
export class MovieDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly toast = inject(ToastService);

    readonly visibilityOptions: MovieVisibility[] = ['PRIVATE', 'PUBLIC', 'SHARED'];

    readonly movie = signal<WebMovie | null>(null);
    readonly loading = signal(true);
    readonly notFound = signal(false);
    readonly visibility = signal<MovieVisibility>('PRIVATE');
    readonly sharesInput = signal('');
    readonly saving = signal(false);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (Number.isNaN(id)) {
            this.notFound.set(true);
            this.loading.set(false);
            return;
        }
        this.load(id);
    }

    private load(id: number): void {
        this.loading.set(true);
        this.movieProviderService.findById(id).subscribe({
            next: (movie) => {
                this.movie.set(movie);
                this.visibility.set(movie.visibility ?? 'PRIVATE');
                this.loading.set(false);
            },
            error: (error: unknown) => {
                this.loading.set(false);
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    this.notFound.set(true);
                }
            },
        });
    }

    visibilityLabel(value: MovieVisibility): string {
        return VISIBILITY_LABELS[value];
    }

    onVisibilityChange(value: string): void {
        this.saveVisibility(value as MovieVisibility);
    }

    saveVisibility(value: MovieVisibility): void {
        const movie = this.movie();
        if (!movie) return;
        if (value === 'SHARED') {
            const usernames = this.parseUsernames();
            if (!usernames.length) {
                this.toast.warning('Escribe al menos un usuario para compartir');
                return;
            }
            this.applyVisibility(movie, 'SHARED', usernames);
            return;
        }
        this.applyVisibility(movie, value);
    }

    saveShares(): void {
        const movie = this.movie();
        if (!movie) return;
        const usernames = this.parseUsernames();
        if (!usernames.length) {
            this.toast.warning('Escribe al menos un usuario');
            return;
        }
        this.applyVisibility(movie, 'SHARED', usernames);
    }

    private parseUsernames(): string[] {
        return this.sharesInput()
            .split(',')
            .map((username) => username.trim())
            .filter(Boolean);
    }

    private applyVisibility(movie: WebMovie, value: MovieVisibility, usernames?: string[]): void {
        this.saving.set(true);
        this.movieProviderService.setVisibility(movie.id, value, usernames).subscribe({
            next: (updated) => {
                this.visibility.set(updated.visibility ?? value);
                this.saving.set(false);
                if (value === 'SHARED') {
                    this.sharesInput.set('');
                }
                this.toast.success(`Visibilidad: ${VISIBILITY_LABELS[updated.visibility ?? value]}`);
            },
            error: () => {
                this.visibility.set(movie.visibility ?? 'PRIVATE');
                this.saving.set(false);
                this.toast.error('Solo el dueño puede cambiar la visibilidad');
            },
        });
    }
}