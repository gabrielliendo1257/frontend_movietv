import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, map, startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {AppShell} from '@layout/app-shell/app-shell';

@Component({
    selector: 'app-root',
    imports: [
        AppShell,
        RouterOutlet
    ],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    private readonly router = inject(Router);

    // La página de reproducción va a pantalla completa, sin shell.
    readonly isWatchRoute = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => this.router.url.startsWith('/watch/')),
            startWith(this.router.url.startsWith('/watch/')),
        ),
    );
}

