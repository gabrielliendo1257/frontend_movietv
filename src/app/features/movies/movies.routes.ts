import {Routes} from '@angular/router';
import {MovieList} from '@features/movies/pages/movie-list/movie-list';
import {Upload} from '@features/movies/pages/upload/upload';
import {adminGuard} from '@core/guards/admin-guard';

export const routes: Routes = [
    {
        path: '',
        component: MovieList
    },
    {
        path: 'upload',
        canMatch: [adminGuard],
        component: Upload
    }
];
