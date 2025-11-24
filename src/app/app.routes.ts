import {Routes} from '@angular/router';
import {AuthCallback} from '@shared/components/auth-callback/auth-callback';
import {PersonalMovies} from '@features/movies/pages/personal-movies/personal-movies';
import {MovieDetail} from '@features/movies/pages/movie-detail/movie-detail';
import {authGuard} from '@core/guards/auth-guard';

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
                path: 'callback',
                component: AuthCallback
            },
            {
                path: 'movies',
                component: PersonalMovies
            },
            {
                path: 'movies/:id',
                component: MovieDetail,
                canMatch: [authGuard]
            },
            {
                path: 'home',
                loadChildren: () => import('./features/movies/movies.routes').then(u => u.routes)
            }
        ]
    }
];
