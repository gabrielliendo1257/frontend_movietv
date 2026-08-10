import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService, AuthStatus } from '@core/services/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    function configureWith(status: AuthStatus) {
        TestBed.configureTestingModule({
            providers: [provideRouter([])],
        });
        TestBed.overrideProvider(AuthService, {
            useValue: { status: signal<AuthStatus>(status) },
        });
    }

    it('allows navigation when authenticated', () => {
        configureWith('authenticated');

        const result = TestBed.runInInjectionContext(() => authGuard(route, state));

        expect(result).toBe(true);
    });

    it('redirects to home when unauthenticated', () => {
        configureWith('unauthenticated');

        const result = TestBed.runInInjectionContext(() => authGuard(route, state));

        expect(result).toBeInstanceOf(UrlTree);
    });
});