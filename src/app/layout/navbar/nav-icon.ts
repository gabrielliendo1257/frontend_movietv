import { Component, input } from '@angular/core';

export type NavIconName =
    | 'home'
    | 'catalog'
    | 'libraries'
    | 'profile'
    | 'settings'
    | 'activity'
    | 'admin';

/**
 * Icono de navegación (trazo 24×24, currentColor): mismo lenguaje que los
 * demás glifos del shell. Sustituye a los emojis en bottom-nav y drawer.
 */
@Component({
    selector: 'app-nav-icon',
    template: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            @switch (name()) {
                @case ('home') {
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                }
                @case ('catalog') {
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                }
                @case ('libraries') {
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    <line x1="7" y1="2" x2="7" y2="22"/>
                    <line x1="17" y1="2" x2="17" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="2" y1="7" x2="7" y2="7"/>
                    <line x1="2" y1="17" x2="7" y2="17"/>
                    <line x1="17" y1="17" x2="22" y2="17"/>
                    <line x1="17" y1="7" x2="22" y2="7"/>
                }
                @case ('profile') {
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                }
                @case ('settings') {
                    <line x1="4" y1="21" x2="4" y2="14"/>
                    <line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="3"/>
                    <line x1="20" y1="21" x2="20" y2="16"/>
                    <line x1="20" y1="12" x2="20" y2="3"/>
                    <line x1="1" y1="14" x2="7" y2="14"/>
                    <line x1="9" y1="8" x2="15" y2="8"/>
                    <line x1="17" y1="16" x2="23" y2="16"/>
                }
                @case ('activity') {
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                }
                @case ('admin') {
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                }
            }
        </svg>
    `,
    styles: `
        :host {
            display: inline-flex;
            line-height: 0;
        }
    `,
})
export class NavIcon {
    readonly name = input.required<NavIconName>();
}
