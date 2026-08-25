import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '@core/config/api-base-url';
import { AuthService } from '@core/session/auth.service';
import { ShellContext } from '@features/shell/models/shell-context';
import { ShellAccess } from './access';

const flushMicrotasks = () => new Promise(resolve => setTimeout(resolve, 0));

function contextWith(partial: Partial<ShellContext>): ShellContext {
    return {
        authenticated: true,
        user: null,
        capabilities: {
            canAddMedia: false,
            canManageLibraries: false,
            canAccessAdmin: false,
            canManageAnyLibrary: false,
            canModerateCatalog: false,
            canViewAllActivity: false,
        },
        activity: null,
        quota: null,
        ...partial,
    };
}

describe('ShellAccess', () => {
    let http: HttpTestingController;
    let baseUrl: string;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        http = TestBed.inject(HttpTestingController);
        baseUrl = TestBed.inject(API_BASE_URL);
    });

    afterEach(() => http.verify());

    async function loginAndServe(shell: ShellContext): Promise<ShellAccess> {
        // Inyectar AuthService dispara GET /web/session desde su constructor.
        const access = TestBed.inject(ShellAccess);
        TestBed.inject(AuthService);

        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: true });
        await flushMicrotasks();
        http.expectOne(`${baseUrl}/web/shell`).flush(shell);
        await flushMicrotasks();

        return access;
    }

    it('mientras el contexto carga, las caps de producto heredan la sesión y admin arranca en false', async () => {
        const access = TestBed.inject(ShellAccess);
        TestBed.inject(AuthService);

        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: true });
        await flushMicrotasks();

        expect(access.isAuthenticated()).toBe(true);
        expect(access.canAddMedia()).toBe(true);
        expect(access.canManageLibraries()).toBe(true);
        expect(access.canAccessAdmin()).toBe(false);

        // Cleanup: el bootstrap sigue "en vuelo"; se descarga para verify().
        http.expectOne(`${baseUrl}/web/shell`).flush(contextWith({}));
    });

    it('un usuario normal no obtiene capacidades de administración', async () => {
        const access = await loginAndServe(contextWith({
            capabilities: {
                canAddMedia: true,
                canManageLibraries: true,
                canAccessAdmin: false,
                canManageAnyLibrary: false,
                canModerateCatalog: false,
                canViewAllActivity: false,
            },
        }));

        expect(access.canAddMedia()).toBe(true);
        expect(access.canAccessAdmin()).toBe(false);
        expect(access.canModerateCatalog()).toBe(false);
        expect(access.canViewAllActivity()).toBe(false);
    });

    it('ROLE_ADMIN obtiene el set completo de capacidades', async () => {
        const access = await loginAndServe(contextWith({
            capabilities: {
                canAddMedia: true,
                canManageLibraries: true,
                canAccessAdmin: true,
                canManageAnyLibrary: true,
                canModerateCatalog: true,
                canViewAllActivity: true,
            },
        }));

        expect(access.canAccessAdmin()).toBe(true);
        expect(access.canManageAnyLibrary()).toBe(true);
        expect(access.canModerateCatalog()).toBe(true);
        expect(access.canViewAllActivity()).toBe(true);
    });

    it('una cuenta bloqueada pierde las capacidades de producto aunque tenga sesión', async () => {
        const access = await loginAndServe(contextWith({
            capabilities: {
                canAddMedia: false,
                canManageLibraries: false,
                canAccessAdmin: false,
                canManageAnyLibrary: false,
                canModerateCatalog: false,
                canViewAllActivity: false,
            },
        }));

        expect(access.isAuthenticated()).toBe(true);
        expect(access.canAddMedia()).toBe(false);
        expect(access.canManageLibraries()).toBe(false);
    });

    it('si el BFF falla, el shell degrada a conservador sin romper la sesión', async () => {
        const access = TestBed.inject(ShellAccess);
        TestBed.inject(AuthService);

        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: true });
        await flushMicrotasks();
        http.expectOne(`${baseUrl}/web/shell`).flush(null, { status: 503, statusText: 'Service Unavailable' });
        await flushMicrotasks();

        expect(access.isAuthenticated()).toBe(true);
        // Conservador: nada que requiera confirmación del BFF.
        expect(access.canAccessAdmin()).toBe(false);
    });
});
