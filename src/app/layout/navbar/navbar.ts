import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AddMediaAction } from '@layout/navbar/add-media-action';
import { GlobalSearch } from '@layout/navbar/global-search';
import { NotificationButton } from '@layout/navbar/notification-button';
import { PrimaryNavigation } from '@layout/navbar/primary-navigation';
import { UserMenu } from '@layout/navbar/user-menu';
import { ShellAccess } from '@layout/access';
import { UploadFacade } from '@features/uploads/services/upload-facade';

/**
 * Barra superior del shell. Composición por responsabilidad:
 * destinos (PrimaryNavigation), acción primaria (AddMediaAction),
 * búsqueda global, actividad y contexto de usuario.
 */
@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        PrimaryNavigation,
        AddMediaAction,
        GlobalSearch,
        NotificationButton,
        UserMenu,
    ],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    private readonly uploadFacade = inject(UploadFacade);
    readonly access = inject(ShellAccess);

    /** Subidas en curso: badge de la acción primaria y campana. */
    readonly activeUploads = this.uploadFacade.activeCount;
}
