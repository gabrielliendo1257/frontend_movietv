import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '@core/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const auth: AuthService = inject(AuthService);
    const isLogged = await auth.isAdmin();
    console.log("Is logged: ", isLogged)

    if (isLogged) {
        console.log("Yes Administrator.");
        return true;
    } else {
        //console.log("Not Admin, starting redirect to home.");
        //window.location.href = "http://localhost:4200/home"
        console.log("Starting flow authentication.")
        localStorage.setItem('redirect_to', window.location.pathname);
        auth.startLoginFlow();
        return false;
    }
};
