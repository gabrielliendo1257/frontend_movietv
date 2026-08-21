import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { WebMovie } from '@features/movies/models/web-movie';
import { MovieVisibility } from '@features/movies/models/web-movie';
import { VisibilityModal } from '@features/movies/components/visibility-modal/visibility-modal';
import { VisibilityJob } from '@features/movies/models/visibility';
import { MediaEditModal } from '@features/dashboard/components/media-edit-modal/media-edit-modal';
import { ToastService } from '@core/services/toast.service';

type StatusFilter = 'ALL' | 'DRAFT' | 'READY';
type SourceFilter = 'ALL' | 'LOCAL' | 'S3';

@Component({
    selector: 'app-catalog-page',
    imports: [FormsModule, VisibilityModal, MediaEditModal],
    templateUrl: './catalog-page.html',
    styleUrl: './catalog-page.css',
})
export class CatalogPage {
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly toast = inject(ToastService);

    readonly movies = signal<WebMovie[]>([]);
    readonly query = signal('');
    readonly statusFilter = signal<StatusFilter>('ALL');
    readonly sourceFilter = signal<SourceFilter>('ALL');
    readonly selectedIds = signal<number[]>([]);
    readonly visibilityTarget = signal<{ label: string; movieIds: number[]; initialVisibility: MovieVisibility } | null>(null);
    readonly editOpen = signal(false);
    readonly editingMovie = signal<WebMovie | null>(null);

    readonly kindOf = (_movie: WebMovie): string => 'MOVIE';

    readonly sourceOf = (movie: WebMovie): string => (movie.objectId != null ? 'S3' : 'LOCAL');

    readonly filtered = computed(() => {
        const q = this.query().trim().toLowerCase();
        const status = this.statusFilter();
        const source = this.sourceFilter();
        return this.movies().filter((movie) => {
            if (q && !movie.title.toLowerCase().includes(q)) return false;
            if (status !== 'ALL' && movie.status !== status) return false;
            if (source !== 'ALL' && this.sourceOf(movie) !== source) return false;
            return true;
        });
    });

    readonly selectedCount = computed(() => this.selectedIds().length);

    readonly allSelected = computed(
        () =>
            this.filtered().length > 0 &&
            this.filtered().every((movie) => this.selectedIds().includes(movie.id)),
    );

    readonly someSelected = computed(() =>
        this.filtered().some((movie) => this.selectedIds().includes(movie.id)),
    );

    constructor() {
        this.movieProviderService.list().subscribe({
            next: (movies) => this.movies.set(movies),
            error: () => undefined,
        });
    }

    toggle(movie: WebMovie): void {
        const current = this.selectedIds();
        this.selectedIds.set(
            current.includes(movie.id) ? current.filter((id) => id !== movie.id) : [...current, movie.id],
        );
    }

    toggleSelectAll(): void {
        this.selectedIds.set(
            this.allSelected() ? [] : this.filtered().map((movie) => movie.id),
        );
    }

    isSelected(movie: WebMovie): boolean {
        return this.selectedIds().includes(movie.id);
    }

    openBulkVisibility(visibility: MovieVisibility): void {
        this.closeMenus();
        const movieIds = this.selectedIds();
        if (!movieIds.length) return;
        this.visibilityTarget.set({
            label: `${movieIds.length} media seleccionada`,
            movieIds,
            initialVisibility: visibility,
        });
    }

    openRowVisibility(movie: WebMovie): void {
        this.closeMenus();
        this.visibilityTarget.set({
            label: movie.title,
            movieIds: [movie.id],
            initialVisibility: movie.visibility ?? 'PRIVATE',
        });
    }

    editMovie(movie: WebMovie): void {
        this.closeMenus();
        this.editingMovie.set(movie);
        this.editOpen.set(true);
    }

    unlinkProvider(movie: WebMovie): void {
        this.closeMenus();
        this.movieProviderService.unlinkEnrichment(movie.id).subscribe({
            next: () => {
                this.toast.success('Proveedor desvinculado.');
                this.reload();
            },
            error: () => this.toast.error('No se pudo desvincular el proveedor.'),
        });
    }

    onEdited(): void {
        this.reload();
    }

    private reload(): void {
        this.movieProviderService.list().subscribe({
            next: (movies) => this.movies.set(movies),
            error: () => undefined,
        });
    }

    onVisibilityClosed(): void {
        this.visibilityTarget.set(null);
    }

    onVisibilityDone(_job: VisibilityJob): void {
        this.visibilityTarget.set(null);
        this.selectedIds.set([]);
        this.reload();
    }

    private closeMenus(): void {
        document.querySelectorAll<HTMLDetailsElement>('details.dropdown[open]').forEach((d) => {
            d.removeAttribute('open');
        });
    }
}
