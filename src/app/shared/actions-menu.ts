import { Component, ElementRef, HostListener, OnDestroy, inject, input, signal } from '@angular/core';

interface MenuPosition {
    top: number;
    left: number;
}

/**
 * Menú de acciones para contextos con recorte (tablas dentro de
 * contenedores con overflow-x). El panel se posiciona contra el viewport
 * (position:fixed), se alinea a la derecha del trigger y se voltea hacia
 * arriba cuando no hay espacio debajo — así nunca queda detrás del borde
 * del contenedor ni fuera de pantalla en la última fila.
 *
 * El contenido (botones) se proyecta: conservan los estilos de la página.
 */
@Component({
    selector: 'app-actions-menu',
    template: `
        <details #details class="dropdown" (toggle)="onToggle(details)">
            <summary class="menu-trigger" [title]="label()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.9"/>
                    <circle cx="12" cy="12" r="1.9"/>
                    <circle cx="12" cy="19" r="1.9"/>
                </svg>
                <span class="sr-only">{{ label() }}</span>
            </summary>

            @if (open()) {
                <div
                    role="menu"
                    class="menu fixed"
                    [class.ready]="pos()"
                    [style.top.px]="pos()?.top"
                    [style.left.px]="pos()?.left"
                >
                    <ng-content />
                </div>
            }
        </details>
    `,
    styles: `
        .dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown summary::-webkit-details-marker {
            display: none;
        }

        .menu-trigger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            background: transparent;
            color: var(--color-text);
            cursor: pointer;
            list-style: none;
        }

        .menu-trigger:hover {
            border-color: var(--color-primary);
            color: var(--color-heading);
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
            border: 0;
        }

        .menu {
            min-width: 170px;
            max-width: min(220px, calc(100vw - 24px));
            padding: 0.3rem;
            background: #16161d;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        }

        /* Fuera del contenedor de scroll: relativo al viewport */
        .menu.fixed {
            position: fixed;
            visibility: hidden;
        }

        .menu.fixed.ready {
            visibility: visible;
        }
    `,
})
export class ActionsMenu implements OnDestroy {
    /** Texto accesible/título del trigger. */
    readonly label = input('Más acciones');

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly open = signal(false);
    protected readonly pos = signal<MenuPosition | null>(null);

    constructor() {
        // Cerrar ante scroll —capture para atrapar también el scroll interno
        // del wrapper de tabla— y resize: un menú fijo quedaría huérfano.
        window.addEventListener('scroll', this.closeOnScroll, true);
        window.addEventListener('resize', this.closeOnScroll);
    }

    private readonly closeOnScroll = () => this.close();

    private close(): void {
        const details = this.host.nativeElement.querySelector('details');
        if (details) details.open = false;
        this.open.set(false);
        this.pos.set(null);
    }

    onToggle(details: HTMLDetailsElement): void {
        if (!details.open) {
            this.open.set(false);
            this.pos.set(null);
            return;
        }
        this.open.set(true);

        // El @if del menú se renderiza tras este evento: medir en el
        // siguiente frame, cuando el panel ya existe en el DOM.
        requestAnimationFrame(() => {
            const summary = details.querySelector('summary');
            const menu = details.querySelector('.menu');
            if (!summary || !menu) return;

            const triggerRect = summary.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            const margin = 8;
            const gap = 6;

            let top = triggerRect.bottom + gap;
            if (top + menuRect.height > window.innerHeight - margin
                && triggerRect.top - menuRect.height > margin) {
                top = triggerRect.top - menuRect.height - gap;
            }

            let left = triggerRect.right - menuRect.width;
            left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));

            this.pos.set({ top, left });
        });
    }

    @HostListener('document:pointerdown', ['$event'])
    onDocumentPointer(event: PointerEvent): void {
        if (!this.open()) return;
        if (!this.host.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open()) this.close();
    }

    ngOnDestroy(): void {
        window.removeEventListener('scroll', this.closeOnScroll, true);
        window.removeEventListener('resize', this.closeOnScroll);
    }
}
