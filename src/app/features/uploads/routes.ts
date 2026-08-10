import {Routes} from '@angular/router';

export const UPLOAD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/upload-page/upload-page').then(m => m.UploadPage),
    },
]
