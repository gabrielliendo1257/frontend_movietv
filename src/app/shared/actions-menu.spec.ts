import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ActionsMenu } from './actions-menu';

describe('ActionsMenu', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActionsMenu],
        }).compileComponents();
    });

    function createWithContent() {
        const fixture = TestBed.createComponent(ActionsMenu);
        fixture.componentRef.setInput('label', 'Acciones de prueba');
        return { fixture, element: fixture.nativeElement as HTMLElement };
    }

    it('al abrirse renderiza el menú fijo con el contenido proyectado', async () => {
        const { fixture } = createWithContent();
        const details = fixture.nativeElement.querySelector('details');

        details.open = true;
        details.dispatchEvent(new Event('toggle'));
        fixture.detectChanges();

        await new Promise(r => requestAnimationFrame(r));
        fixture.detectChanges();

        const menu = fixture.debugElement.query(By.css('.menu'));
        expect(menu).withContext('el menú debe existir').toBeTruthy();
        expect(menu.classes['fixed']).toBeTrue();
        expect(menu.styles['top']).toContain('px');
        expect(fixture.componentInstance.label()).toBe('Acciones de prueba');
    });

    it('cierra con Escape', () => {
        const { fixture } = createWithContent();
        const details = fixture.nativeElement.querySelector('details');

        details.open = true;
        details.dispatchEvent(new Event('toggle'));
        fixture.detectChanges();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        fixture.detectChanges();

        expect(details.open).toBeFalse();
        expect(fixture.debugElement.query(By.css('.menu'))).toBeNull();
    });

    it('cierra al hacer click fuera', () => {
        const { fixture } = createWithContent();
        const details = fixture.nativeElement.querySelector('details');

        details.open = true;
        details.dispatchEvent(new Event('toggle'));
        fixture.detectChanges();

        document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(details.open).toBeFalse();
    });
});
