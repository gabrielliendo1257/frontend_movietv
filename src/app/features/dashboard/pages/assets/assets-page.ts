import { Component, inject, signal } from '@angular/core';
import { LibrariesService } from '@features/libraries/services/libraries.service';
import { Library, MediaAsset } from '@features/libraries/models/library';

interface AssetRow extends MediaAsset {
    libraryId: number;
}

@Component({
    selector: 'app-assets-page',
    imports: [],
    templateUrl: './assets-page.html',
    styleUrl: './assets-page.css',
})
export class AssetsPage {
    private readonly librariesService = inject(LibrariesService);

    readonly loading = signal(true);
    readonly rows = signal<AssetRow[]>([]);

    constructor() {
        this.librariesService.list().subscribe({
            next: (libraries) => this.loadAll(libraries),
            error: () => this.loading.set(false),
        });
    }

    private loadAll(libraries: Library[]): void {
        if (!libraries.length) {
            this.loading.set(false);
            return;
        }
        let remaining = libraries.length;
        for (const library of libraries) {
            this.librariesService.scan(library.id, 0, 50).subscribe({
                next: (page) => {
                    this.rows.update((current) => [
                        ...current,
                        ...page.items.map((asset) => ({ ...asset, libraryId: library.id })),
                    ]);
                    if (--remaining === 0) this.loading.set(false);
                },
                error: () => {
                    if (--remaining === 0) this.loading.set(false);
                },
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
