import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Búsqueda global del shell. V1: delega en la experiencia Catalog
 * (/catalog?q=…), que lista media accesible y ya filtra por título.
 */
@Component({
    selector: 'app-global-search',
    imports: [FormsModule],
    template: `
        <div class="search">
            <!-- Desktop -->
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
                class="search-input"
                type="text"
                placeholder="Search media..."
                [ngModel]="term()"
                (ngModelChange)="term.set($event)"
                (keydown.enter)="submit()"
            />

            <!-- Tablet/mobile: icono que abre el panel de búsqueda -->
            <button class="search-toggle" type="button" (click)="open.set(true)"
                    aria-label="Buscar">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
            </button>

            @if (open()) {
                <div class="search-overlay">
                    <input
                        #mobileInput
                        class="search-input"
                        type="text"
                        placeholder="Search media..."
                        [ngModel]="term()"
                        (ngModelChange)="term.set($event)"
                        (keydown.enter)="submit()"
                    />
                    <button class="search-close" type="button" (click)="close()"
                            aria-label="Cerrar búsqueda">×</button>
                </div>
            }
        </div>
    `,
    styles: `
        .search {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-icon {
            position: absolute;
            left: 0.65rem;
            color: #92929e;
            pointer-events: none;
        }

        .search-input {
            width: 200px;
            padding: 0.45rem 0.75rem 0.45rem 2rem;
            border-radius: 8px;
            border: 1px solid #26262f;
            background: rgba(255, 255, 255, 0.05);
            color: #e4e4ec;
            font-size: 0.82rem;
            outline: none;
            transition: border-color 0.2s ease, background 0.2s ease;
        }

        .search-input::placeholder { color: #6d6d7a; }
        .search-input:focus { border-color: rgba(255, 109, 63, 0.4); background: rgba(255, 255, 255, 0.08); }

        .search-toggle { display: none; }

        @media (max-width: 1023px) {
            .search > .search-icon,
            .search > .search-input { display: none; }

            .search-toggle {
                display: grid;
                place-items: center;
                width: 34px;
                height: 34px;
                border: none;
                border-radius: 8px;
                background: none;
                color: #92929e;
                cursor: pointer;
            }

            .search-toggle:hover { color: #e4e4ec; background: rgba(255, 255, 255, 0.06); }

            .search-overlay {
                position: fixed;
                inset: 60px 0 auto 0;
                z-index: 99;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.6rem 1rem;
                background: rgba(12, 12, 15, 0.96);
                border-bottom: 1px solid #1e1e26;
            }

            .search-overlay .search-input {
                flex: 1;
                width: auto;
                display: block;
            }

            .search-close {
                border: none;
                background: none;
                color: #92929e;
                font-size: 1.3rem;
                cursor: pointer;
            }
        }
    `,
})
export class GlobalSearch {
    private readonly router = inject(Router);

    readonly term = signal('');
    readonly open = signal(false);

    submit(): void {
        const query = this.term().trim();
        if (!query) return;

        this.router.navigate(['/catalog'], { queryParams: { q: query } });
        this.close();
    }

    close(): void {
        this.term.set('');
        this.open.set(false);
    }
}
