import { Component, effect, inject, signal } from '@angular/core';
import { Footer } from '@layout/footer/footer';
import { Navbar } from '@layout/navbar/navbar';
import { ToastContainer } from '@core/ui/toast-container/toast-container';
import { UploadDrawer } from '@features/uploads/components/upload-drawer/upload-drawer';
import { UploadFacade } from '@features/uploads/services/upload-facade';

/**
 * Shell de la aplicación: navbar global, contenido enrutado, footer,
 * drawer de subidas y toasts. La reproducción (watch) va fuera del shell.
 */
@Component({
    selector: 'app-shell',
    imports: [Footer, Navbar, ToastContainer, UploadDrawer],
    templateUrl: './app-shell.html',
    styleUrl: './app-shell.css',
})
export class AppShell {
    private readonly uploadFacade = inject(UploadFacade);

    readonly drawerOpen = signal(false);

    constructor() {
        // Al iniciar una subida desde cualquier página, el drawer muestra el progreso.
        let previousActive = 0;
        effect(() => {
            const active = this.uploadFacade.activeCount();
            if (active > previousActive) {
                this.drawerOpen.set(true);
            }
            previousActive = active;
        });
    }
}
