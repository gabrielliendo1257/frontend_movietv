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

    it('abierto: el panel vive dentro del backdrop (visible sobre el blur)', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        const dialog = fixture.componentInstance;
        dialog.open.set(true);
        fixture.detectChanges();

        const modal = fixture.debugElement.query(By.css('.modal'));
        const backdrop = fixture.debugElement.query(By.css('.backdrop'));
        expect(modal).withContext('el diálogo debe verse').toBeTruthy();
        expect(backdrop).toBeTruthy();

        // El panel es hijo del backdrop, no un hermano cubierto por él.
        expect(backdrop.nativeElement.contains(modal.nativeElement)).toBeTrue();
    });

    it('abierto: bloquea el scroll del body y lo restaura al cerrar', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        const dialog = fixture.componentInstance;
        dialog.open.set(true);
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('hidden');

        dialog.open.set(false);
        fixture.detectChanges();
        fixture.destroy();

        expect(document.body.style.overflow).toBe('');
    });

    it('emite confirmed y se cierra al confirmar', () => {
        const fixture = TestBed.createComponent(ConfirmDialog);
        const dialog = fixture.componentInstance;
        dialog.open.set(true);
        fixture.detectChanges();

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
