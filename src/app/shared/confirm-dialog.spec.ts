import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmDialog],
        }).compileComponents();
    });

    it('no renderiza nada mientras está cerrado', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.modal'))).toBeNull();
    });

    it('abierto: emite confirmed y se cierra al confirmar', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        const dialog = fixture.componentInstance;
        dialog.open.set(true);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.modal'))).withContext('el diálogo debe verse').toBeTruthy();

        let confirmed = false;
        dialog.confirmed.subscribe(() => (confirmed = true));
        fixture.debugElement.query(By.css('.btn-danger')).nativeElement.click();

        expect(confirmed).toBeTrue();
        expect(dialog.open()).toBeFalse();
    });

    it('emite cancelled con Escape', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        const dialog = fixture.componentInstance;
        dialog.open.set(true);
        fixture.detectChanges();

        let cancelled = false;
        dialog.cancelled.subscribe(() => (cancelled = true));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(cancelled).toBeTrue();
        expect(dialog.open()).toBeFalse();
    });
});
