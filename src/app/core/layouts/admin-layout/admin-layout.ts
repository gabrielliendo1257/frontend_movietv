import { Component } from '@angular/core';
import {Navbar} from '@shared/components/navbar/navbar';
import {Footer} from '@shared/components/footer/footer';

@Component({
  selector: 'app-admin-layout',
    imports: [
        Navbar,
        Footer
    ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

}
