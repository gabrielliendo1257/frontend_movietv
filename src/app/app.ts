import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PublicLayout} from '@core/layouts/public-layout/public-layout';
import {AuthService} from '@core/services/auth.service';
import {AuthLayout} from '@core/layouts/auth-layout/auth-layout';
import {AdminLayout} from '@core/layouts/admin-layout/admin-layout';

@Component({
    selector: 'app-root',
    imports: [PublicLayout,
        AuthLayout,
        AdminLayout,
        RouterOutlet
    ],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App implements OnInit {
    authService: AuthService = inject(AuthService);

    isAuth: boolean = false;
    isAdmin: boolean = false;

    ngOnInit() {
        this.authService.isAdmin()
            .then(isAdminResult => {
                this.isAdmin = isAdminResult;
            })
            .catch(error => {
                console.log(error);
                this.isAdmin = false;
            })

        this.authService.checkSession()
            .then((isAuthResponse) => {
                this.isAuth = isAuthResponse;
            })
            .catch(() => {
                this.isAuth = false;
            })
    }
}
