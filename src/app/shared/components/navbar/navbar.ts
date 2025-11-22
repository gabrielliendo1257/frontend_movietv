import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
    imports: [
        RouterLink
    ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

    isOpen = false;
    mobileOpen = false;

    openDropdown() {
        if (window.innerWidth > 900) this.isOpen = true;
    }

    closeDropdown() {
        if (window.innerWidth > 900) this.isOpen = false;
    }

    toggleDropdownMobile() {
        if (window.innerWidth <= 900) {
            this.isOpen = !this.isOpen;
        }
    }

    toggleMobileMenu() {
        this.mobileOpen = !this.mobileOpen;

        // Cierra dropdown si el menú se cierra
        if (!this.mobileOpen) this.isOpen = false;
    }
}
