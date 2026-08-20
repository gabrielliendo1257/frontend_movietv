import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, Subject, switchMap } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LibrariesService } from '@features/libraries/services/libraries.service';
import { Library, MediaAsset } from '@features/libraries/models/library';
import { EnrichmentSearchResult } from '@features/movies/models/enrichment';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { VisibilityModal } from '@features/movies/components/visibility-modal/visibility-modal';
import { VisibilityJob } from '@features/movies/models/visibility';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

@Component({
    selector: 'app-libraries-page',
    imports: [FormsModule, VisibilityModal],
    templateUrl: './libraries-page.html',
    styleUrl: './libraries-page.css',
})
export class LibrariesPage {
    private readonly librariesService = inject(LibrariesService);
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly toast = inject(ToastService);
    private readonly authService = inject(AuthService);

    private readonly identifySearchSubject = new Subject<string>();

    readonly isLogged = this.authService.isLogged;

    readonly libraries = signal<Library[]>([]);
    readonly loading = signal(false);
    readonly rootPath = signal('');
    readonly registering = signal(false);

    readonly selected = signal<Library | null>(null);
    readonly assets = signal<MediaAsset[]>([]);
    readonly assetsTotal = signal(0);
    readonly assetsPage = signal(0);
    readonly assetsTotalPages = signal(0);
    readonly mode = signal<'scan' | 'unidentified'>('scan');
    readonly loadingAssets = signal(false);

    readonly identifyAssetId = signal<number | null>(null);
    readonly identifyQuery = signal('');
    readonly identifyResults = signal<EnrichmentSearchResult[]>([]);
    readonly identifying = signal(false);

    readonly movieTitles = signal<Record<number, string>>({});

    readonly visibilityTarget = signal<Library | null>(null);

    assetLabel(movieId: number | null, relativePath: string): string {
        const title = movieId != null ? this.movieTitles()[movieId] : undefined;
        return title ?? relativePath;
    }

    hasTitle(movieId: number | null): boolean {
        return movieId != null && !!this.movieTitles()[movieId];
    }

    readonly selectedName = computed(() => {
        const selected = this.selected();
        return selected ? `Biblioteca #${selected.id} (${selected.type})` : '';
    });

    constructor() {
        this.identifySearchSubject
            .pipe(
                debounceTime(SEARCH_DEBOUNCE_MS),
                map((value) => value.trim()),
                filter((query) => query.length >= MIN_QUERY_LENGTH),
                distinctUntilChanged(),
                switchMap((query) => this.movieProviderService.enrichmentSearch(query)),
            )
            .subscribe({
                next: (results) => this.identifyResults.set(results),
                error: () => this.identifyResults.set([]),
            });
    }

    ngOnInit(): void {
        this.loadLibraries();
    }

    loadLibraries(): void {
        this.loading.set(true);
        this.librariesService.list().subscribe({
            next: (libraries) => {
                this.libraries.set(libraries);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.toast.error('No se pudieron cargar las bibliotecas');
            },
        });
    }

    register(): void {
        const path = this.rootPath().trim();
        if (!path) {
            this.toast.warning('Escribe la ruta raíz de la biblioteca');
            return;
        }
        this.registering.set(true);
        this.librariesService.register(path).subscribe({
            next: (library) => {
                this.libraries.set([...this.libraries(), library]);
                this.rootPath.set('');
                this.registering.set(false);
                this.toast.success(`Biblioteca #${library.id} registrada`);
            },
            error: () => {
                this.registering.set(false);
                this.toast.error('No se pudo registrar la biblioteca');
            },
        });
    }

    delete(library: Library): void {
        this.librariesService.delete(library.id).subscribe({
            next: () => {
                this.libraries.set(this.libraries().filter((item) => item.id !== library.id));
                if (this.selected()?.id === library.id) this.selected.set(null);
                this.toast.success(`Biblioteca #${library.id} eliminada`);
            },
            error: () => this.toast.error('No se pudo eliminar la biblioteca'),
        });
    }

    openScan(library: Library): void {
        this.selected.set(library);
        this.mode.set('scan');
        this.loadAssets(library.id, 0);
    }

    openUnidentified(library: Library): void {
        this.selected.set(library);
        this.mode.set('unidentified');
        this.loadUnidentified(library.id, 0);
    }

    openVisibility(library: Library): void {
        this.visibilityTarget.set(library);
    }

    onVisibilityClosed(): void {
        this.visibilityTarget.set(null);
    }

    onVisibilityDone(_job: VisibilityJob): void {
        this.visibilityTarget.set(null);
        this.loadLibraries();
    }

    loadAssets(libraryId: number, page: number): void {
        this.loadingAssets.set(true);
        this.librariesService.scan(libraryId, page, PAGE_SIZE).subscribe({
            next: (result) => {
                this.assets.set(result.items);
                this.assetsTotal.set(result.total);
                this.assetsPage.set(result.page);
                this.assetsTotalPages.set(result.totalPages);
                this.loadingAssets.set(false);
                this.loadMovieTitles(result.items);
            },
            error: () => {
                this.loadingAssets.set(false);
                this.toast.error('No se pudo escanear la biblioteca');
            },
        });
    }

    loadUnidentified(libraryId: number, page: number): void {
        this.loadingAssets.set(true);
        this.librariesService.unidentified(libraryId, page, PAGE_SIZE).subscribe({
            next: (result) => {
                this.assets.set(result.items);
                this.assetsTotal.set(result.total);
                this.assetsPage.set(result.page);
                this.assetsTotalPages.set(result.totalPages);
                this.loadingAssets.set(false);
                this.loadMovieTitles(result.items);
            },
            error: () => {
                this.loadingAssets.set(false);
                this.toast.error('No se pudieron cargar los assets sin identificar');
            },
        });
    }

    changePage(offset: number): void {
        const selected = this.selected();
        if (!selected) return;
        const nextPage = this.assetsPage() + offset;
        if (nextPage < 0 || nextPage >= this.assetsTotalPages()) return;
        if (this.mode() === 'scan') {
            this.loadAssets(selected.id, nextPage);
        } else {
            this.loadUnidentified(selected.id, nextPage);
        }
    }

    onIdentifyQuery(value: string): void {
        this.identifyQuery.set(value);
        this.identifySearchSubject.next(value);
    }

    identifyWithTitle(asset: MediaAsset): void {
        const title = this.identifyQuery().trim();
        if (!title) {
            this.toast.warning('Escribe un título o selecciona un resultado');
            return;
        }
        this.runIdentify(asset, { title });
    }

    identifyWithResult(asset: MediaAsset, result: EnrichmentSearchResult): void {
        this.identifyQuery.set(result.title);
        this.runIdentify(asset, { tmdbId: result.tmdb_id });
    }

    private runIdentify(asset: MediaAsset, request: { title?: string; tmdbId?: number }): void {
        this.identifying.set(true);
        this.librariesService.identify(asset.id, request).subscribe({
            next: () => {
                this.identifying.set(false);
                this.identifyAssetId.set(null);
                this.identifyQuery.set('');
                this.identifyResults.set([]);
                this.toast.success(`Asset identificado (movie ${request.tmdbId ?? 'por título'})`);
                const selected = this.selected();
                if (selected) {
                    if (this.mode() === 'scan') {
                        this.loadAssets(selected.id, this.assetsPage());
                    } else {
                        this.loadUnidentified(selected.id, this.assetsPage());
                    }
                }
            },
            error: () => {
                this.identifying.set(false);
                this.toast.error('No se pudo identificar el asset');
            },
        });
    }

    private loadMovieTitles(assets: MediaAsset[]): void {
        const known = this.movieTitles();
        const missing = new Set<number>();
        for (const asset of assets) {
            if (asset.movieId != null && !known[asset.movieId]) missing.add(asset.movieId);
        }
        for (const movieId of missing) {
            this.movieProviderService.findById(movieId).subscribe({
                next: (movie) =>
                    this.movieTitles.set({ ...this.movieTitles(), [movieId]: movie.title }),
                error: () => undefined,
            });
        }
    }

    formatSize(bytes: number): string {
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${bytes} B`;
    }
}