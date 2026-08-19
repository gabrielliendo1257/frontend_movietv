import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { filter, map, take } from 'rxjs';


export const authGuard: CanMatchFn = (_route, segments) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const attemptedUrl = `/${segments.map((segment) => segment.path).join('/')}`;
    const status = authService.status();
    console.log("Executing authGuard (status): ", status)

    if (status === 'loading') {
        return toObservable(authService.status).pipe(
            filter(s => s !== 'loading'),
            take(1),
            map(s => s === 'authenticated' ? true : (authService.rememberReturnUrl(attemptedUrl), router.createUrlTree(['/'])))
        )
    }

    return status === 'authenticated'
        ? true
        : (authService.rememberReturnUrl(attemptedUrl), router.createUrlTree(['/']))
}
