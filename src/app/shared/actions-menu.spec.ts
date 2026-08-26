import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ActionsMenu } from './actions-menu';

describe('ActionsMenu', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActionsMenu],
        }).compileComponents();
    });

    function createWithItems() {
        const fixture = TestBed.createComponent(ActionsMenu);
        fixture.componentRef.setInput('label', 'Acciones de prueba');
        fixture.componentRef.setInput('items', [
            { label: 'Editar', action: () => undefined },
            { label: 'Eliminar', action: () => undefined, danger: true },
        ]);
        return { fixture };
    }

    it('al abrirse renderiza el menú fijo con las acciones y sus estilos', async () => {
        const { fixture } = createWithItems();
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

        const buttons = fixture.debugElement.queryAll(By.css('.item-btn'));
        expect(buttons.length).toBe(2);
        expect(buttons[0].nativeElement.textContent).toContain('Editar');
        expect(buttons[1].classes['danger']).toBeTrue();

        // estilos visibles: color de texto del tema (no el negro de botón UA)
        const styles = getComputedStyle(buttons[0].nativeElement);
        expect(styles.color).toBe('rgb(228, 228, 236)');
        expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('ejecuta la acción y cierra el menú', () => {
        const { fixture } = createWithItems();
        const details = fixture.nativeElement.querySelector('details');

        details.open = true;
        details.dispatchEvent(new Event('toggle'));
        fixture.detectChanges();

        let executed = '';
        fixture.componentRef.setInput('items', [
            { label: 'Editar', action: () => (executed = 'edit') },
        ]);
        fixture.detectChanges();

        fixture.debugElement.query(By.css('.item-btn')).nativeElement.click();
        fixture.detectChanges();

        expect(executed).toBe('edit');
        expect(details.open).toBeFalse();
    });

    it('cierra con Escape', () => {
        const { fixture } = createWithItems();
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
        const { fixture } = createWithItems();
        const details = fixture.nativeElement.querySelector('details');

        details.open = true;
        details.dispatchEvent(new Event('toggle'));
        fixture.detectChanges();

        document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(details.open).toBeFalse();
    });
});
