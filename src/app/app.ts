import {Component, computed, inject, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
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

    readonly isWatchRoute = computed(() => this.router.url.startsWith('/watch/'));

    ngOnInit() {
    }
}
