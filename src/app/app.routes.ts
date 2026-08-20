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
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
                canMatch: [authGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        loadComponent: () =>
                            import('./features/dashboard/pages/dashboard-overview/dashboard-overview').then(m => m.DashboardOverview),
                    },
                    {
                        path: 'libraries',
                        loadComponent: () =>
                            import('./features/libraries/pages/libraries-page/libraries-page').then(m => m.LibrariesPage),
                    },
                    {
                        path: 'catalog',
                        loadComponent: () =>
                            import('./features/dashboard/pages/catalog/catalog-page').then(m => m.CatalogPage),
                    },
                    {
                        path: 'assets',
                        loadComponent: () =>
                            import('./features/dashboard/pages/assets/assets-page').then(m => m.AssetsPage),
                    },
                    {
                        path: 'activity',
                        loadComponent: () =>
                            import('./features/dashboard/pages/activity/activity-page').then(m => m.ActivityPage),
                    },
                    {
                        path: 'settings',
                        loadComponent: () =>
                            import('./features/dashboard/pages/settings/settings-page').then(m => m.SettingsPage),
                    },
                ]
            }
        ]
    },
    {
        path: 'watch/:id',
        loadComponent: () =>
            import('./features/movies/pages/watch-page/watch-page').then(m => m.WatchPage),
    }
];
