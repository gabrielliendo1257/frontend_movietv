import { Component, inject, input, output, signal } from '@angular/core';
import { ScrollLock } from '@shared/scroll-lock';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@core/ui/toast.service';
import { CatalogApi } from '@features/catalog/data-access/catalog-api';
import { CatalogJob } from '@features/catalog/models/catalog';
import { MovieVisibility } from '@features/movies/models/web-movie';
import { JobProgress } from '@features/movies/components/job-progress/job-progress';

const VISIBILITY_OPTIONS: { value: MovieVisibility; label: string }[] = [
    { value: 'PRIVATE', label: 'Privado' },
    { value: 'PUBLIC', label: 'Público' },
    { value: 'SHARED', label: 'Compartido' },
];

/**
 * Cambio de acceso de la experiencia Catalog:
 * - una sola media → PUT /web/media/{id}/access (atómico, sin job)
 * - selección masiva → POST /web/catalog/actions/change-visibility (202 + SSE)
 */
@Component({
    selector: 'app-visibility-modal',
    imports: [ ScrollLock,JobProgress],
    templateUrl: './visibility-modal.html',
    styleUrl: './visibility-modal.css',
})
export class VisibilityModal {
    private readonly catalogApi = inject(CatalogApi);
    private readonly toast = inject(ToastService);

    readonly label = input.required<string>();
    readonly movieIds = input<number[]>([]);
    readonly libraryIds = input<number[]>([]);
    readonly initialVisibility = input<MovieVisibility>('PRIVATE');

    readonly closed = output<void>();
    readonly done = output<CatalogJob>();

    readonly options = VISIBILITY_OPTIONS;
    readonly isOpen = signal(false);
    readonly visibility = signal<MovieVisibility>('PRIVATE');
    readonly usernames = signal<string[]>([]);
    readonly newUsername = signal('');
    readonly phase = signal<'form' | 'running'>('form');
    readonly job = signal<CatalogJob | null>(null);
    readonly submitting = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.isOpen.set(true);
        this.visibility.set(this.initialVisibility());
    }

    selectVisibility(value: MovieVisibility): void {
        this.visibility.set(value);
        this.error.set(null);
    }

    addUsername(): void {
        const value = this.newUsername().trim();
        if (!value) return;
        if (this.usernames().includes(value)) {
            this.newUsername.set('');
            return;
        }
        this.usernames.set([...this.usernames(), value]);
        this.newUsername.set('');
        this.error.set(null);
    }

    removeUsername(index: number): void {
        this.usernames.set(this.usernames().filter((_, i) => i !== index));
    }

    close(): void {
        this.isOpen.set(false);
        setTimeout(() => this.closed.emit(), 200);
    }

    submit(): void {
        if (this.visibility() === 'SHARED' && !this.usernames().length) {
            this.error.set('Añade al menos un usuario para compartir');
            return;
        }
        this.submitting.set(true);
        this.error.set(null);

        const movieIds = this.movieIds();
        const libraryIds = this.libraryIds();

        // Una sola media: acceso atómico directo, sin trabajo en background.
        if (movieIds.length === 1 && libraryIds.length === 0) {
            this.catalogApi
                .changeAccess(movieIds[0], this.visibility(), this.usernames())
                .subscribe({
                    next: () => this.finishSingle(movieIds[0]),
                    error: (error: unknown) => this.handleError(error),
                });
            return;
        }

        this.catalogApi
            .changeVisibilityBulk({
                movieIds: movieIds.length ? movieIds : undefined,
                libraryIds: libraryIds.length ? libraryIds : undefined,
                visibility: this.visibility(),
                sharedWith: this.usernames().length ? this.usernames() : undefined,
            })
            .subscribe({
                next: (job) => this.track(job),
                error: (error: unknown) => this.handleError(error),
            });
    }

    private finishSingle(_mediaId: number): void {
        this.toast.success('Visibilidad actualizada.');
        this.submitting.set(false);
        this.done.emit({ jobId: '', status: 'COMPLETED', total: 1, done: 1, failed: 0 });
        this.close();
    }

    private track(initial: CatalogJob): void {
        this.phase.set('running');
        this.job.set(initial);
        this.catalogApi.jobEvents(initial.jobId).subscribe({
            next: (job) => {
                this.job.set(job);
                if (job.status === 'COMPLETED' || job.status === 'FAILED') {
                    const message =
                        job.failed > 0
                            ? `${job.done} actualizadas, ${job.failed} fallidas`
                            : `${job.done} actualizadas`;
                    if (job.status === 'FAILED') {
                        this.toast.error(`La acción terminó con errores: ${message}`);
                    } else {
                        this.toast.success(message);
                    }
                    this.submitting.set(false);
                    this.done.emit(job);
                    this.close();
                }
            },
            error: () => {
                this.submitting.set(false);
                this.error.set('Se perdió la conexión con el progreso. Intenta de nuevo.');
            },
        });
    }

    private handleError(error: unknown): void {
        this.submitting.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401) {
            this.error.set('Tu sesión expiró; inicia sesión de nuevo.');
            return;
        }
        this.error.set('No se pudo cambiar la visibilidad. Intenta de nuevo.');
    }
}
