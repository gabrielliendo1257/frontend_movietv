import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '@core/config/api-base-url';
import { Navbar } from './navbar';

describe('Navbar', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Navbar],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    });

    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('should create', () => {
        const fixture = TestBed.createComponent(Navbar);
        const baseUrl = TestBed.inject(API_BASE_URL);

        // Crear el navbar dispara la sesión; anónimo → el shell no consulta más.
        TestBed.inject(HttpTestingController)
            .expectOne(`${baseUrl}/web/session`)
            .flush({ authenticated: false });

        expect(fixture.componentInstance).toBeTruthy();
    });
});
