import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionResponse } from '@core/models/SessionResponse';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private static readonly RETURN_URL_KEY = 'mvflix-return-url';

    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
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
                    if (session.authenticated) {
                        this.restoreReturnUrl();
                    }
                },
                error: () => {
                    this._status.set('unauthenticated');
                },
            });
    }

    rememberReturnUrl(url: string): void {
        const normalized = url.startsWith('/') ? url : `/${url}`;
        if (normalized === '/' || normalized === '/home') return;
        if (sessionStorage.getItem(AuthService.RETURN_URL_KEY)) return;
        sessionStorage.setItem(AuthService.RETURN_URL_KEY, normalized);
    }

    startLoginFlow(): void {
        this.rememberReturnUrl(location.pathname + location.search);
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

    private restoreReturnUrl(): void {
        const returnUrl = sessionStorage.getItem(AuthService.RETURN_URL_KEY);
        sessionStorage.removeItem(AuthService.RETURN_URL_KEY);
        if (!returnUrl || !returnUrl.startsWith('/')) return;
        if (location.pathname === returnUrl) return;
        this.router.navigateByUrl(returnUrl);
    }
}
