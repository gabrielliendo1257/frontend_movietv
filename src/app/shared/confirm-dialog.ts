import { Component, HostListener, input, model, output } from '@angular/core';
import { ScrollLock } from '@shared/scroll-lock';

/**
 * Confirmación de acciones destructivas. Patrón visual de los modales del
 * proyecto (backdrop + panel anidado); el estado vive en el padre vía `open`.
 * El backdrop bloquea el scroll del body mientras el diálogo está abierto.
 */
@Component({
    selector: 'app-confirm-dialog',
    imports: [ScrollLock],
    template: `
        @if (open()) {
            <div class="backdrop" [appScrollLock]="true" (click)="cancel()">
                <div
                    class="modal"
                    role="alertdialog"
                    aria-modal="true"
                    [attr.aria-label]="title()"
                    (click)="$event.stopPropagation()"
                >
                    <h2 class="title">{{ title() }}</h2>
                    <p class="message">{{ message() }}</p>
                    <div class="actions">
                        <button class="btn" type="button" (click)="cancel()">Cancelar</button>
                        <button class="btn-danger" type="button" (click)="confirm()">
                            {{ confirmLabel() }}
                        </button>
                    </div>
                </div>
            </div>
        }
    `,
    styles: `
        .backdrop {
            position: fixed;
            inset: 0;
            z-index: 300;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 4rem 1rem 2rem;
            overflow-y: auto;
        }

        .modal {
            width: 100%;
            max-width: 400px;
            background: #131317;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            animation: confirm-in 0.18s ease;
        }

        @keyframes confirm-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .title {
            margin: 0;
            color: var(--color-heading);
            font-size: 1rem;
        }

        .message {
            margin: 0;
            color: var(--color-muted);
            font-size: 0.88rem;
            line-height: 1.5;
            overflow-wrap: anywhere;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .btn-danger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.55rem 0.95rem;
            border-radius: 8px;
            border: 1px solid transparent;
            background: var(--color-danger);
            color: #fff;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-danger:hover { filter: brightness(1.12); }
    `,
})
export class ConfirmDialog {
    readonly open = model(false);
    readonly title = input('¿Confirmas esta acción?');
    readonly message = input('');
    readonly confirmLabel = input('Eliminar');

    readonly confirmed = output<void>();
    readonly cancelled = output<void>();

    confirm(): void {
        this.confirmed.emit();
        this.open.set(false);
    }

    cancel(): void {
        this.cancelled.emit();
        this.open.set(false);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open()) this.cancel();
    }
}
