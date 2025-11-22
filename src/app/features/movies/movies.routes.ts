import {Routes} from '@angular/router';
import {MovieList} from '@features/movies/pages/movie-list/movie-list';
import {Upload} from '@features/movies/pages/upload/upload';
import {authGuard} from '@core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: MovieList
    },
    {
        path: 'upload',
        canMatch: [authGuard],
        component: Upload
    }
];
