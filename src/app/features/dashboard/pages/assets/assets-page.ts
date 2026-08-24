import { Component, inject, signal } from '@angular/core';
import { LibrariesApi } from '@features/libraries/data-access/libraries-api';
import { BytesPipe } from '@shared/pipes/bytes.pipe';
import { Library, MediaAsset } from '@features/libraries/models/library';

interface AssetRow extends MediaAsset {
    libraryId: number;
}

@Component({
    selector: 'app-assets-page',
    imports: [BytesPipe],
    templateUrl: './assets-page.html',
    styleUrl: './assets-page.css',
})
export class AssetsPage {
    private readonly librariesApi = inject(LibrariesApi);

    readonly loading = signal(true);
    readonly rows = signal<AssetRow[]>([]);

    constructor() {
        this.librariesApi.list().subscribe({
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
            this.librariesApi.scan(library.id, 0, 50).subscribe({
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

}
