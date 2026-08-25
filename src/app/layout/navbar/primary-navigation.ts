import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavIcon, NavIconName } from '@layout/navbar/nav-icon';

interface NavDestination {
    label: string;
    route: string;
    icon: NavIconName;
}

/**
 * Destinos globales del shell. Las acciones contextuales (editar, visibilidad,
 * borrar…) viven dentro de cada experiencia, nunca aquí.
 * Compartidos con el drawer lateral (MobileMenu).
 */
export const DESTINATIONS: NavDestination[] = [
    { label: 'Home', route: '/movies', icon: 'home' },
    { label: 'Catalog', route: '/catalog', icon: 'catalog' },
    { label: 'Libraries', route: '/libraries', icon: 'libraries' },
];

@Component({
    selector: 'app-primary-navigation',
    imports: [RouterLink, RouterLinkActive, NavIcon],
    template: `
        <div class="destinations">
            @for (destination of destinations; track destination.route) {
                <a
                    class="nav-link"
                    [routerLink]="destination.route"
                    routerLinkActive="active"
                >{{ destination.label }}</a>
            }
        </div>

        <!-- Bottom navigation (mobile) -->
        <nav class="bottom-nav" aria-label="Navegación principal">
            @for (destination of destinations; track destination.route) {
                <a
                    class="bottom-link"
                    [routerLink]="destination.route"
                    routerLinkActive="active"
                >
                    <span class="bottom-icon" aria-hidden="true">
                        <app-nav-icon [name]="destination.icon" />
                    </span>
                    <span class="bottom-label">{{ destination.label }}</span>
                </a>
            }
        </nav>
    `,
    styles: `
        .destinations {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .nav-link {
            display: block;
            padding: 0.4rem 0.85rem;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 500;
            color: #92929e;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .nav-link:hover { color: #e4e4ec; background: rgba(255, 255, 255, 0.05); }
        .nav-link.active { color: #fff; background: rgba(255, 255, 255, 0.08); }

        .bottom-nav { display: none; }

        @media (max-width: 767px) {
            .destinations { display: none; }

            .bottom-nav {
                position: fixed;
                inset: auto 0 0 0;
                z-index: 100;
                display: grid;
                grid-auto-flow: column;
                justify-content: space-around;
                align-items: stretch;
                background: #0c0c0ff2;
                backdrop-filter: blur(12px);
                border-top: 1px solid #1e1e26;
                padding-bottom: env(safe-area-inset-bottom);
            }

            .bottom-link {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                padding: 0.5rem 0.75rem;
                font-size: 0.62rem;
                font-weight: 500;
                color: #92929e;
                text-decoration: none;
            }

            .bottom-icon { line-height: 0; }
            .bottom-label { letter-spacing: 0.01em; }
            .bottom-link.active { color: #ff6d3f; }
        }
    `,
})
export class PrimaryNavigation {
    readonly destinations = DESTINATIONS;
}
