import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    _isLogged = signal(false);

    constructor(private httpClient: HttpClient) {
    }

    startLoginFlow() {
        window.location.href =
            `http://192.168.1.103:8080/oauth2/authorize` +
            `?response_type=code` +
            `&client_id=app-movie` +
            `&redirect_uri=http://192.168.1.103:4200/callback` +
            `&scope=profile`;
    }

    async handleCallback(code: string) {
        const result = await lastValueFrom(
            this.httpClient.post<{ok: boolean}>('http://192.168.1.103:8080/api/v1/movie/auth/exchange', {
                'code': code,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        );
        console.log("Result: ", result);
        return result;
    }

    async checkSession(): Promise<boolean> {
        try {
            await lastValueFrom(
                this.httpClient.get('http://192.168.1.103:8080/api/v1/movie/auth/me', {
                    withCredentials: true, headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );
            console.log("Account autenticado.");
            this._isLogged.set(true);
            return true;
        } catch {
            console.log("No autenticado.");
            this._isLogged.set(false);
            return false;
        }
    }

    async isAdmin() {
        try {
            const result = await lastValueFrom(
                this.httpClient.get('http://192.168.1.103:8080/api/v1/movie/auth/admin', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );
            console.log("Account is admin: ", result);
            this._isLogged.set(true);
            return true;
        } catch {
            console.log("Not admin.");
            this._isLogged.set(false);
            return false;
        }
    }
}
