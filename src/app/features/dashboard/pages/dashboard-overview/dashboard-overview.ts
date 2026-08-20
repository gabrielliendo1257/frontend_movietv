import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MovieProviderService } from '@features/movies/services/movie-provider.service';
import { LibrariesService } from '@features/libraries/services/libraries.service';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { ToastService } from '@core/services/toast.service';
import { Library } from '@features/libraries/models/library';
import { AddMediaModal, AddMediaSource } from '@features/dashboard/components/add-media-modal/add-media-modal';

interface ActivityEntry {
    text: string;
    when: string;
    state: 'done' | 'running' | 'failed';
}

@Component({
    selector: 'app-dashboard-overview',
    imports: [AddMediaModal],
    templateUrl: './dashboard-overview.html',
    styleUrl: './dashboard-overview.css',
})
export class DashboardOverview {
    private readonly movieProviderService = inject(MovieProviderService);
    private readonly librariesService = inject(LibrariesService);
    private readonly uploadFacade = inject(UploadFacade);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    readonly addMediaOpen = signal(false);

    readonly mediaTotal = signal(0);
    readonly identified = signal(0);
    readonly pending = signal(0);
    readonly libraries = signal<Library[]>([]);

    readonly processing = computed(() => this.uploadFacade.activeCount());

    readonly recentActivity: ActivityEntry[] = [
        { text: 'Imported 12 assets from Local Library', when: '2 min ago', state: 'done' },
        { text: 'Identified "Furia Oriental"', when: '5 min ago', state: 'done' },
        { text: 'Uploaded movie to S3', when: '8 min ago', state: 'done' },
        { text: 'TMDB enrichment', when: '11 min ago', state: 'failed' },
    ];

    constructor() {
        this.movieProviderService.list().subscribe({
            next: (movies) => {
                this.mediaTotal.set(movies.length);
                this.identified.set(movies.filter((m) => m.status === 'READY').length);
                this.pending.set(movies.filter((m) => m.status !== 'READY').length);
            },
            error: () => undefined,
        });

        this.librariesService.list().subscribe({
            next: (libraries) => this.libraries.set(libraries),
            error: () => undefined,
        });
    }

    onSourceSelected(source: AddMediaSource): void {
        if (source === 'upload') {
            this.router.navigate(['/uploads']);
        } else if (source === 'local') {
            this.router.navigate(['/dashboard/libraries']);
        } else {
            this.toast.info('S3 / Storage llegará pronto.');
        }
    }

    openLibrary(library: Library): void {
        this.router.navigate(['/dashboard/libraries'], { queryParams: { library: library.id } });
    }
}
