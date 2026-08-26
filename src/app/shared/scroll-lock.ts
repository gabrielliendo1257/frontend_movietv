import { Directive, OnDestroy, effect, input } from '@angular/core';

/**
 * Bloquea el scroll del body mientras un modal está abierto.
 * Compensa el ancho del scrollbar para evitar saltos de layout y soporta
 * varios modales apilados (conteo compartido: solo el último libera).
 */
@Directive({ selector: '[appScrollLock]' })
export class ScrollLock implements OnDestroy {
    readonly appScrollLock = input(false, { alias: 'appScrollLock' });

    private static active = 0;

    private locked = false;

    constructor() {
        effect(() => {
            const shouldLock = this.appScrollLock();
            if (shouldLock && !this.locked) this.lock();
            if (!shouldLock && this.locked) this.unlock();
        });
    }

    private lock(): void {
        const body = document.body;
        ScrollLock.active += 1;
        if (ScrollLock.active > 1) {
            this.locked = true;
            return;
        }
        const scrollbarWidth = window.innerWidth - body.clientWidth;
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }
        this.locked = true;
    }

    private unlock(): void {
        if (!this.locked) return;
        const body = document.body;
        ScrollLock.active = Math.max(0, ScrollLock.active - 1);
        if (ScrollLock.active === 0) {
            body.style.overflow = '';
            body.style.paddingRight = '';
        }
        this.locked = false;
    }

    ngOnDestroy(): void {
        this.unlock();
    }
}
