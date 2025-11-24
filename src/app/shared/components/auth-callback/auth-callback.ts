import { Component } from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallback {

    constructor(private auth: AuthService, private router: Router) {
        const code = new URLSearchParams(location.search).get('code');

        if (code) {
            this.auth.handleCallback(code)
                .then((ok) => {
                    let redirectTo = localStorage.getItem('redirect_to') || '/home';
                    if (!redirectTo) {
                        redirectTo = '/home';
                    }
                    console.log("Redirect to: ", redirectTo);
                    this.router.navigate([redirectTo]).then((data) => {
                        console.log("Success redirect.");
                    })
                })
                .catch(() => {
                    console.log("Reject Authentication.")
                })
        }
    }
}
