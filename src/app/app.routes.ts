import {Routes} from '@angular/router';
import {MainLayout} from '@core/layouts/main-layout/main-layout';
import {AuthCallback} from '@shared/components/auth-callback/auth-callback';
import {PersonalMovies} from '@features/movies/pages/personal-movies/personal-movies';

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
                path: 'home',
                loadChildren: () => import('./features/movies/movies.routes').then(u => u.routes)
            }
        ]
    }
];
