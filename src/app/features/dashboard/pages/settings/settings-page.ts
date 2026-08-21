import { Component, inject, signal } from '@angular/core';
import { HomeService } from '@features/account/services/home.service';
import { HomeView } from '@features/account/models/home';

@Component({
    selector: 'app-settings-page',
    imports: [],
    templateUrl: './settings-page.html',
    styleUrl: './settings-page.css',
})
export class SettingsPage {
    private readonly homeService = inject(HomeService);

    readonly home = signal<HomeView | null>(null);

    constructor() {
        this.homeService.getHome().subscribe({
            next: (home) => this.home.set(home),
            error: () => this.home.set(null),
        });
    }

    formatBytes(bytes: number): string {
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${bytes} B`;
    }

    quotaPercent(quota: { quotaBytes: number; usedBytes: number }): number {
        if (!quota.quotaBytes) return 0;
        return Math.min(100, Math.round((quota.usedBytes / quota.quotaBytes) * 100));
    }
}
