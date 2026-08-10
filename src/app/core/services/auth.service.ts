import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SessionResponse } from '@core/models/SessionResponse';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.backendAddress;

    private readonly _status = signal<AuthStatus>('loading');

    readonly status = this._status.asReadonly();
    readonly isLogged = computed(() => this._status() === 'authenticated');

    constructor() {
        this.checkSession();
    }

    checkSession(): void {
        this._status.set('loading');
        this.http
            .get<SessionResponse>(`${this.baseUrl}/web/session`, {
                withCredentials: true,
            })
            .subscribe({
                next: (session) => {
                    this._status.set(session.authenticated ? 'authenticated' : 'unauthenticated');
                },
                error: () => {
                    this._status.set('unauthenticated');
                },
            });
    }

    startLoginFlow(): void {
        window.location.href = `${this.baseUrl}/oauth2/authorization/movie-app`;
    }

    logout(): void {
        this.http.post(`${this.baseUrl}/web/logout`, null, { withCredentials: true }).subscribe({
            next: () => {
                this._status.set('unauthenticated');
                window.location.href = '/';
            },
            error: () => {
                window.location.href = '/';
            },
        });
    }
}
