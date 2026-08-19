import {Routes} from '@angular/router';
import {PersonalMovies} from '@features/movies/pages/personal-movies/personal-movies';
import { authGuard } from '@core/auth/auth-guard';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'movies',
                pathMatch: 'full'
            },
            {
                path: 'movies',
                component: PersonalMovies
            },
            {
                path: 'movies/:id',
                loadComponent: () =>
                    import('./features/movies/pages/movie-detail/movie-detail').then(m => m.MovieDetail),
                canMatch: [authGuard]
            },
            {
                path: 'home',
                loadChildren: () => import('./features/movies/movies.routes').then(u => u.routes)
            },
            {
                path: 'uploads',
                loadChildren: () => import('./features/uploads/routes').then(m => m.UPLOAD_ROUTES),
            },
            {
                path: 'libraries',
                loadComponent: () =>
                    import('./features/libraries/pages/libraries-page/libraries-page').then(m => m.LibrariesPage),
            },
            {
                path: 'account',
                loadComponent: () =>
                    import('./features/account/pages/account-page/account-page').then(m => m.AccountPage),
            }
        ]
    },
    {
        path: 'watch/:id',
        loadComponent: () =>
            import('./features/movies/pages/watch-page/watch-page').then(m => m.WatchPage),
    }
];
