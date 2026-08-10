import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Footer } from '@core/layouts/footer/footer';
import { AuthService } from '@core/services/auth.service';
import { NavbarUi, NavUser } from '@core/layouts/navbar-ui/navbar-ui';
import { ToastContainer } from '@core/components/toast-container/toast-container';
import { UploadDrawer } from '@features/uploads/components/upload-drawer/upload-drawer';
import { UploadFacade } from '@features/uploads/services/upload-facade';
import { TmdbService } from '@features/movies/services/tmdb.service';

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

    readonly uploadsDrawerOpen = signal(false);

    readonly activeUploads = computed(() => this.uploadFacade.activeCount());

    readonly activeRoute = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url),
        ),
        { initialValue: this.router.url },
    );

    onNavClick(route: string): void {
        this.router.navigate([route]);
    }

    // TODO(BFF): reemplazar por el perfil de GET /web/home (profile: {id, username, email, plan, enabled})
    // cuando la feature home del BFF se consuma desde el frontend.
    navUser: NavUser | null = {
        username: 'Admin',
        picture: 'https://cdn.pixabay.com/photo/2017/03/24/07/28/facebook-2170419_1280.png',
        email: 'admin@gmail.com',
    };

    startLogin(): void {
        this.authService.startLoginFlow();
    }

    logout() {
        this.authService.logout();
    }

    onSearch(search: string): void {
        this.tmdbService.searchMovies(search).subscribe({
            next: (page) => console.log('Search results: ', page.results.length),
            error: (error) => console.error(error),
        });
    }
}