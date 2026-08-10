import { Component, inject } from '@angular/core';
import { Footer } from '@core/layouts/footer/footer';
import { AuthService } from '@core/services/auth.service';
import { NavbarUi, NavUser } from '@core/layouts/navbar-ui/navbar-ui';
import { ToastContainer } from '@core/components/toast-container/toast-container';
import { TmdbService } from '@features/movies/services/tmdb.service';

@Component({
    selector: 'app-public-layout',
    imports: [Footer, NavbarUi, ToastContainer],
    templateUrl: './public-layout.html',
    styleUrl: './public-layout.css',
})
export class PublicLayout {
    readonly authService = inject(AuthService);
    private readonly tmdbService = inject(TmdbService);

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