import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { API_BASE_URL } from '@core/config/api-base-url';
import { ShellContext } from '@features/shell/models/shell-context';
import { MobileMenu } from './mobile-menu';

const flushMicrotasks = () => new Promise(resolve => setTimeout(resolve, 0));

function shellContext(partial: Partial<ShellContext> = {}): ShellContext {
    return {
        authenticated: true,
        user: {
            id: 'u1',
            username: 'pepe',
            displayName: 'Pepe Dev',
            email: 'pepe@mvflix.local',
            avatarUrl: null,
        },
        capabilities: {
            canAddMedia: true,
            canManageLibraries: true,
            canAccessAdmin: false,
            canManageAnyLibrary: false,
            canModerateCatalog: false,
            canViewAllActivity: false,
        },
        activity: { running: 0, failed: 0 },
        quota: {
            available: true,
            usedBytes: 2_500_000_000,
            limitBytes: 10_000_000_000,
            usedPercent: 25,
        },
        ...partial,
    };
}

describe('MobileMenu', () => {
    let http: HttpTestingController;
    let baseUrl: string;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MobileMenu],
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

    function create() {
        return TestBed.createComponent(MobileMenu);
    }

    it('anónimo: el drawer ofrece Sign in / Sign up en lugar de identidad', async () => {
        const fixture = create();
        // Sesión anónima
        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: false });
        await flushMicrotasks();

        fixture.detectChanges();
        const burger = fixture.debugElement.query(By.css('.burger')).nativeElement;
        burger.click();
        fixture.detectChanges();

        const text = fixture.debugElement.nativeElement.textContent;
        expect(text).toContain('Sign in');
        expect(text).toContain('Sign up');
        expect(text).not.toContain('Sign out');
    });

    it('autenticado: muestra identidad, cuota, destinos y Sign out', async () => {
        const fixture = create();
        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: true });
        await flushMicrotasks();
        http.expectOne(`${baseUrl}/web/shell`).flush(shellContext());
        await flushMicrotasks();

        fixture.detectChanges();
        fixture.debugElement.query(By.css('.burger')).nativeElement.click();
        fixture.detectChanges();

        const text = fixture.debugElement.nativeElement.textContent;
        expect(text).toContain('Pepe Dev');
        expect(text).toContain('25%');
        expect(text).toContain('Catalog');
        expect(text).toContain('Sign out');
        expect(text).not.toContain('Admin Dashboard');
    });

    it('admin: el drawer expone Admin Dashboard', async () => {
        const fixture = create();
        http.expectOne(`${baseUrl}/web/session`).flush({ authenticated: true });
        await flushMicrotasks();
        const ctx = shellContext();
        ctx.capabilities = { ...ctx.capabilities, canAccessAdmin: true };
        http.expectOne(`${baseUrl}/web/shell`).flush(ctx);
        await flushMicrotasks();

        fixture.detectChanges();
        fixture.debugElement.query(By.css('.burger')).nativeElement.click();
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.textContent).toContain('Admin Dashboard');
    });
});
