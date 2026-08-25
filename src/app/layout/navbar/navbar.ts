import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AddMediaAction } from '@layout/navbar/add-media-action';
import { GlobalSearch } from '@layout/navbar/global-search';
import { MobileMenu } from '@layout/navbar/mobile-menu';
import { NotificationButton } from '@layout/navbar/notification-button';
import { PrimaryNavigation } from '@layout/navbar/primary-navigation';
import { QuotaIndicator } from '@layout/navbar/quota-indicator';
import { UserMenu } from '@layout/navbar/user-menu';
import { ShellAccess } from '@layout/access';
import { ShellStore } from '@features/shell/data-access/shell-store';
import { UploadFacade } from '@features/uploads/services/upload-facade';

/**
 * Barra superior del shell. Composición por responsabilidad:
 * destinos (PrimaryNavigation), acción primaria (AddMediaAction),
 * búsqueda global, actividad, cuota y contexto de usuario.
 * En móvil (<768px) el contexto vive en el drawer lateral (MobileMenu).
 */
@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        PrimaryNavigation,
        AddMediaAction,
        GlobalSearch,
        NotificationButton,
        QuotaIndicator,
        UserMenu,
        MobileMenu,
    ],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    private readonly uploadFacade = inject(UploadFacade);
    readonly shell = inject(ShellStore);
    readonly access = inject(ShellAccess);

    /** Subidas en curso de esta sesión: badge de la acción primaria. */
    readonly activeUploads = this.uploadFacade.activeCount;

    /**
     * Actividad relevante para la campana: subidas locales en vivo y jobs
     * que el BFF reporta corriendo server-side (p. ej. tras recargar).
     */
    readonly activityBadge = computed(() => {
        const running = this.shell.context()?.activity?.running ?? 0;
        return Math.max(this.activeUploads(), running);
    });
}
