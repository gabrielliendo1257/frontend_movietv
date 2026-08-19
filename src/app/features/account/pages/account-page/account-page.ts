import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { HomeService } from '@features/account/services/home.service';
import { HomeView } from '@features/account/models/home';

@Component({
    selector: 'app-account-page',
    imports: [],
    templateUrl: './account-page.html',
    styleUrl: './account-page.css',
})
export class AccountPage implements OnInit {
    private readonly homeService = inject(HomeService);
    private readonly authService = inject(AuthService);

    readonly isLogged = this.authService.isLogged;

    readonly home = signal<HomeView | null>(null);
    readonly loading = signal(true);
    readonly error = signal(false);

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set(false);
        this.homeService.getHome().subscribe({
            next: (home) => {
                this.home.set(home);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.error.set(true);
            },
        });
    }

    formatBytes(bytes: number): string {
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${bytes} B`;
    }

    quotaPercent(used: number, quota: number): number {
        if (!quota) return 0;
        return Math.min(100, Math.round((used / quota) * 100));
    }
}