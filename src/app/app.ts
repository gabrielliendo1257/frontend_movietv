import {Component, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, map, startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {PublicLayout} from '@core/layouts/public-layout/public-layout';

@Component({
    selector: 'app-root',
    imports: [
        PublicLayout,
        RouterOutlet
    ],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App implements OnInit {
    private readonly router = inject(Router);

    readonly isWatchRoute = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => this.router.url.startsWith('/watch/')),
            startWith(this.router.url.startsWith('/watch/')),
        ),
        { initialValue: this.router.url.startsWith('/watch/') },
    );

    ngOnInit() {
    }
}
