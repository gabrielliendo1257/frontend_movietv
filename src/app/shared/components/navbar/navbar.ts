import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';

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
    authService: AuthService = inject(AuthService);

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

    initFlowAuth(currentPath: string) {
        console.log("Current path: " + currentPath);
        this.authService.startLoginFlow()
    }

    protected readonly window = window;
}
