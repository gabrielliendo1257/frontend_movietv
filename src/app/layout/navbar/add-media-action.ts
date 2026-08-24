import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Acción primaria global del shell: "Quiero incorporar contenido nuevo". */
@Component({
    selector: 'app-add-media-action',
    imports: [RouterLink],
    template: `
        <a class="add-media-btn" routerLink="/uploads">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Media
            @if (activeUploads() > 0) {
                <span class="add-media-badge">{{ activeUploads() }}</span>
            }
        </a>
    `,
    styles: `
        .add-media-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.45rem 0.9rem;
            border-radius: 8px;
            background: linear-gradient(135deg, #ff3d00, #ff6d3f);
            color: #fff;
            font-size: 0.82rem;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
            transition: filter 0.2s ease, transform 0.1s ease;
        }

        .add-media-btn:hover { filter: brightness(1.12); }
        .add-media-btn:active { transform: scale(0.97); }

        .add-media-badge {
            min-width: 1.15rem;
            height: 1.15rem;
            padding: 0 0.3rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.25);
            font-size: 0.7rem;
            line-height: 1.15rem;
            text-align: center;
        }

        @media (max-width: 1023px) {
            .add-media-btn { padding: 0.45rem 0.6rem; font-size: 0; gap: 0; }
            .add-media-badge { margin-left: 0.25rem; }
        }
    `,
})
export class AddMediaAction {
    readonly activeUploads = input(0);
}
