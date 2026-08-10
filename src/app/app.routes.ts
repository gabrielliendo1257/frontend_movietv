import {Routes} from '@angular/router';
import {PersonalMovies} from '@features/movies/pages/personal-movies/personal-movies';
import { authGuard } from '@core/auth/auth-guard';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'home',
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
            }
        ]
    },
    {
        path: 'uploads',
        loadChildren: () => import('./features/uploads/routes').then(m => m.UPLOAD_ROUTES),
    }
];
