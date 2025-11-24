import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Navbar} from '@shared/components/navbar/navbar';
import {Footer} from '@shared/components/footer/footer';

@Component({
  selector: 'app-auth-layout',
    imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

}
