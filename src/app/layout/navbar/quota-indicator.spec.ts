import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { QuotaIndicator } from './quota-indicator';

describe('QuotaIndicator', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuotaIndicator],
            providers: [provideRouter([])],
        }).compileComponents();
    });

    it('sin dato disponible no renderiza nada (degradación independiente)', () => {
        const fixture = TestBed.createComponent(QuotaIndicator);
        fixture.componentRef.setInput('quota', null);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.quota'))).toBeNull();
    });

    it('muestra el porcentaje usado y el detalle en el tooltip', () => {
        const fixture = TestBed.createComponent(QuotaIndicator);
        fixture.componentRef.setInput('quota', {
            available: true,
            usedBytes: 2_500_000_000,
            limitBytes: 10_000_000_000,
            usedPercent: 25,
        });
        fixture.detectChanges();

        const link = fixture.debugElement.query(By.css('.quota'));
        expect(link).withContext('el indicador debe existir').toBeTruthy();
        expect(link.nativeElement.getAttribute('title'))
            .toContain('GB de');
        expect(link.nativeElement.textContent).toContain('25%');
    });

    it('marca peligro al acercarse al límite', () => {
        const fixture = TestBed.createComponent(QuotaIndicator);
        fixture.componentRef.setInput('quota', {
            available: true,
            usedBytes: 9_500_000_000,
            limitBytes: 10_000_000_000,
            usedPercent: 95,
        });
        fixture.detectChanges();

        const fill = fixture.debugElement.query(By.css('.quota-fill'));
        expect(fill.nativeElement.classList).toContain('danger');
    });
});
