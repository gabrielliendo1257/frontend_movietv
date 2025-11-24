import { Component } from '@angular/core';
import {Navbar} from '@shared/components/navbar/navbar';
import {Footer} from '@shared/components/footer/footer';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [Navbar, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {

    constructor(private authService: AuthService,) {
    }

    startLogin(): void {
        this.authService.startLoginFlow();
    }
}
