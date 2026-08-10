import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
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

    ngOnInit() {
    }
}
