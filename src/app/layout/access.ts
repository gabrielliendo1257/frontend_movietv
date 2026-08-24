import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '@core/session/auth.service';

/**
 * Capacidades que el shell usa para mostrar u ocultar acciones.
 * Ocultar botones es solo UX: el backend siempre autoriza cada operación.
 *
 * TODO(roles): derivar canAccessAdmin de un rol real cuando el BFF exponga
 * el concepto en la sesión o el perfil (hoy UserProfile no trae roles).
 */
@Injectable({ providedIn: 'root' })
export class ShellAccess {
    private readonly auth = inject(AuthService);

    readonly isAuthenticated = this.auth.isLogged;

    readonly canAddMedia = this.auth.isLogged;
    readonly canManageLibraries = this.auth.isLogged;
    readonly canAccessAdmin = this.auth.isLogged;
}
