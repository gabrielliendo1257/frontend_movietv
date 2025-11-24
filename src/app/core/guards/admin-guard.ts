import { CanActivateFn } from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {inject} from '@angular/core';

export const adminGuard: CanActivateFn = async (route, state) => {
    const auth: AuthService = inject(AuthService);
    const isLogged = await auth.isAdmin();
    console.log("Is logged: ", isLogged)

    if (isLogged) {
        console.log("Yes Administrator.");
        return true;
    } else {
        console.log("Starting flow authentication.")
        localStorage.setItem('redirect_to', window.location.pathname);
        auth.startLoginFlow();
        return false;
    }
};
