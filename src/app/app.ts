import {Component} from '@angular/core';
import {MainLayout} from '@core/layouts/main-layout/main-layout';
import {Navbar} from '@shared/components/navbar/navbar';
import {Footer} from '@shared/components/footer/footer';
import {RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [MainLayout, Navbar, Footer, RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {

}
