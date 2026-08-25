/**
 * Contrato del bootstrap del shell (GET /web/shell). Espeja el DTO del BFF:
 * cada bloque se degrada por separado y los null son significativos
 * (usuario anónimo, perfil no disponible, cuota caída).
 */
export interface ShellCapabilities {
    canAddMedia: boolean;
    canManageLibraries: boolean;
    canAccessAdmin: boolean;
    /** Opera bibliotecas globales del operador. */
    canManageAnyLibrary: boolean;
    /** Edita/borra contenido de otros usuarios (moderación). */
    canModerateCatalog: boolean;
    /** Ve la actividad de todos los usuarios. */
    canViewAllActivity: boolean;
}

export interface ShellUser {
    id: string;
    username: string;
    /** null → la UI usa username/iniciales como fallback. */
    displayName: string | null;
    email: string | null;
    /** null → la UI renderiza iniciales en lugar de imagen. */
    avatarUrl: string | null;
}

export interface ShellActivity {
    running: number;
    failed: number;
}

/** Uso de cuota para el indicador del navbar; available=false → ocultar. */
export interface ShellQuota {
    available: boolean;
    usedBytes: number | null;
    limitBytes: number | null;
    usedPercent: number | null;
}

export interface ShellContext {
    authenticated: boolean;
    user: ShellUser | null;
    capabilities: ShellCapabilities;
    activity: ShellActivity | null;
    quota: ShellQuota | null;
}
