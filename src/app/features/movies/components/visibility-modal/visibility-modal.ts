import { Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@core/ui/toast.service';
import { VisibilityApi } from '@features/movies/data-access/visibility-api';
import { VisibilityJob } from '@features/movies/models/visibility';
import { MovieVisibility } from '@features/movies/models/web-movie';
import { JobProgress } from '@features/movies/components/job-progress/job-progress';

const VISIBILITY_OPTIONS: { value: MovieVisibility; label: string }[] = [
    { value: 'PRIVATE', label: 'Privado' },
    { value: 'PUBLIC', label: 'Público' },
    { value: 'SHARED', label: 'Compartido' },
];

@Component({
    selector: 'app-visibility-modal',
    imports: [JobProgress],
    templateUrl: './visibility-modal.html',
    styleUrl: './visibility-modal.css',
})
export class VisibilityModal {
    private readonly visibilityApi = inject(VisibilityApi);
    private readonly toast = inject(ToastService);

    readonly label = input.required<string>();
    readonly movieIds = input<number[]>([]);
    readonly libraryIds = input<number[]>([]);
    readonly initialVisibility = input<MovieVisibility>('PRIVATE');

    readonly closed = output<void>();
    readonly done = output<VisibilityJob>();

    readonly options = VISIBILITY_OPTIONS;
    readonly isOpen = signal(false);
    readonly visibility = signal<MovieVisibility>('PRIVATE');
    readonly usernames = signal<string[]>([]);
    readonly newUsername = signal('');
    readonly phase = signal<'form' | 'running'>('form');
    readonly job = signal<VisibilityJob | null>(null);
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

        const request = {
            movieIds: this.movieIds().length ? this.movieIds() : undefined,
            libraryIds: this.libraryIds().length ? this.libraryIds() : undefined,
            visibility: this.visibility(),
            usernames: this.usernames().length ? this.usernames() : undefined,
        };

        this.visibilityApi.bulk(request).subscribe({
            next: (job) => this.track(job),
            error: (error: unknown) => this.handleError(error),
        });
    }

    private track(initial: VisibilityJob): void {
        this.phase.set('running');
        this.job.set(initial);
        this.visibilityApi.jobEvents(initial.jobId).subscribe({
            next: (job) => {
                this.job.set(job);
                if (job.status === 'DONE') {
                    const message =
                        job.failed > 0
                            ? `${job.done} actualizadas, ${job.failed} fallidas`
                            : `${job.done} películas actualizadas`;
                    this.toast.success(message);
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
        if (error instanceof HttpErrorResponse) {
            if (error.status === 403) {
                this.error.set('Solo el dueño puede cambiar la visibilidad');
                return;
            }
            if (error.status === 400) {
                this.error.set('Para compartir hay que indicar los usuarios');
                return;
            }
        }
        this.error.set('No se pudo aplicar la visibilidad');
    }
}
