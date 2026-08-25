import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BytesPipe } from '@shared/pipes/bytes.pipe';
import { ShellQuota } from '@features/shell/models/shell-context';

/**
 * Indicador de cuota del shell (CONTEXTUAL): pill compacta con el % usado.
 * El detalle vive en el tooltip; el click lleva a Settings → Storage.
 * Sin dato disponible el navbar lo oculta (degradación independiente).
 */
@Component({
    selector: 'app-quota-indicator',
    imports: [RouterLink],
    template: `
        @if (quota(); as q) {
            <a
                class="quota"
                routerLink="/dashboard/settings"
                [title]="detail(q)"
                [attr.aria-label]="'Almacenamiento: ' + detail(q)"
            >
                <span class="quota-track" aria-hidden="true">
                    <span
                        class="quota-fill"
                        [class.danger]="nearLimit(q)"
                        [style.width.%]="q.usedPercent"
                    ></span>
                </span>
                <span class="quota-label">{{ q.usedPercent }}%</span>
            </a>
        }
    `,
    styles: `
        .quota {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.35rem 0.6rem;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.2s ease;
        }

        .quota:hover { background: rgba(255, 255, 255, 0.06); }
        .quota:focus-visible { outline: 2px solid rgba(255, 109, 63, 0.5); }

        .quota-track {
            width: 44px;
            height: 4px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.1);
            overflow: hidden;
        }

        .quota-fill {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: #ff6d3f;
        }

        .quota-fill.danger { background: #ff6d5e; }

        .quota-label {
            font-size: 0.68rem;
            font-weight: 600;
            color: #92929e;
            font-variant-numeric: tabular-nums;
        }

        @media (max-width: 767px) {
            .quota { display: none; }
        }
    `,
})
export class QuotaIndicator {
    /** Cuota ya filtrada por disponibilidad (ShellStore.quota). */
    readonly quota = input<ShellQuota | null>(null);

    private readonly bytes = new BytesPipe();

    detail(quota: ShellQuota): string {
        return `${this.bytes.transform(quota.usedBytes)} de ${this.bytes.transform(quota.limitBytes)} · ${quota.usedPercent}%`;
    }

    nearLimit(quota: ShellQuota): boolean {
        return (quota.usedPercent ?? 0) >= 90;
    }
}
