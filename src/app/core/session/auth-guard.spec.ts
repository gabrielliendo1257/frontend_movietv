import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, UrlSegment, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService, AuthStatus } from '@core/session/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
    const route = {} as Route;
    const segments: UrlSegment[] = [];

    function configureWith(status: AuthStatus) {
        TestBed.configureTestingModule({
            providers: [provideRouter([])],
        });
        TestBed.overrideProvider(AuthService, {
            useValue: { status: signal<AuthStatus>(status), rememberReturnUrl: () => {} },
        });
    }

    it('allows navigation when authenticated', () => {
        configureWith('authenticated');

        const result = TestBed.runInInjectionContext(() => authGuard(route, segments));

        expect(result).toBe(true);
    });

    it('redirects to home when unauthenticated', () => {
        configureWith('unauthenticated');

        const result = TestBed.runInInjectionContext(() => authGuard(route, segments));

        expect(result).toBeInstanceOf(UrlTree);
    });
});