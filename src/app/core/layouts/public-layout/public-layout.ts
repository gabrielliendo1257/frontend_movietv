import { Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Footer } from '@core/layouts/footer/footer';
import { AuthService } from '@core/services/auth.service';
import { NavbarUi, NavUser } from '@core/layouts/navbar-ui/navbar-ui';
import { ToastContainer } from '@core/components/toast-container/toast-container';
import { ToastService } from '@core/services/toast.service';
import { UploadDrawer } from '@features/uploads/components/upload-drawer/upload-drawer';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { TmdbService } from '@features/movies/services/tmdb.service';
import { HomeService } from '@features/account/services/home.service';
import { HomeView } from '@features/account/models/home';

@Component({
    selector: 'app-public-layout',
    imports: [Footer, NavbarUi, ToastContainer, UploadDrawer],
    templateUrl: './public-layout.html',
    styleUrl: './public-layout.css',
})
export class PublicLayout {
    readonly authService = inject(AuthService);
    private readonly tmdbService = inject(TmdbService);
    private readonly uploadFacade = inject(UploadFacade);
    private readonly router = inject(Router);
    private readonly toastService = inject(ToastService);
    private readonly homeService = inject(HomeService);

    readonly uploadsDrawerOpen = signal(false);

    readonly activeUploads = computed(() => this.uploadFacade.activeCount());

    readonly home = signal<HomeView | null>(null);

    readonly navUser = computed<NavUser | null>(() => {
        const profile = this.home()?.profile;
        if (!profile) return null;
        return {
            username: profile.username,
            email: profile.email,
            picture: null,
        };
    });

    readonly activeRoute = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url),
        ),
        { initialValue: this.router.url },
    );

    constructor() {
        effect(() => {
            if (this.authService.isLogged()) {
                this.homeService.getHome().subscribe({
                    next: (home) => this.home.set(home),
                    error: () => this.home.set(null),
                });
            } else {
                this.home.set(null);
            }
        });
    }

    onNavClick(route: string): void {
        this.router.navigate([route]);
    }

    onNotificationsClick(): void {
        this.toastService.info('Las notificaciones llegan pronto.');
    }

    startLogin(): void {
        this.authService.startLoginFlow();
    }

    logout() {
        this.authService.logout();
    }

    onProfileClick(): void {
        this.router.navigate(['/account']);
    }

    onSearch(search: string): void {
        this.tmdbService.searchMovies(search).subscribe({
            next: (page) => console.log('Search results: ', page.results.length),
            error: (error) => console.error(error),
        });
    }
}