import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '@core/session/auth.service';
import { ShellStore } from '@features/shell/data-access/shell-store';

/**
 * Capacidades que el shell usa para mostrar u ocultar acciones.
 * Ocultar botones es solo UX: el backend siempre autoriza cada operación.
 *
 * Fuente de verdad: GET /web/shell (cuenta habilitada vs rol del token).
 * Mientras el contexto carga, las capacidades de producto heredan la sesión
 * (evita parpadeo de la navegación); las de administración arrancan en false
 * y aparecen solo cuando el BFF confirma el rol.
 */
@Injectable({ providedIn: 'root' })
export class ShellAccess {
    private readonly auth = inject(AuthService);
    private readonly shell = inject(ShellStore);

    private readonly caps = computed(() => this.shell.context()?.capabilities ?? null);

    readonly isAuthenticated = this.auth.isLogged;

    readonly canAddMedia = computed(() => this.caps()?.canAddMedia ?? this.isAuthenticated());
    readonly canManageLibraries = computed(
        () => this.caps()?.canManageLibraries ?? this.isAuthenticated(),
    );
    readonly canManageAnyLibrary = computed(() => this.caps()?.canManageAnyLibrary ?? false);
    readonly canModerateCatalog = computed(() => this.caps()?.canModerateCatalog ?? false);
    readonly canViewAllActivity = computed(() => this.caps()?.canViewAllActivity ?? false);
    readonly canAccessAdmin = computed(() => this.caps()?.canAccessAdmin ?? false);
}
