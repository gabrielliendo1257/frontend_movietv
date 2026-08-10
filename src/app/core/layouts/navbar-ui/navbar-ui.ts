import {Component, HostListener, input, model, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

export interface NavUser {
    picture?: string | null;
    username?: string | null;
    email?: string | null;
}

export interface NavLink {
    label: string;
    route: string;
    icon?: string;
}

@Component({
    selector: 'app-navbar-ui',
    imports: [
        FormsModule
    ],
    templateUrl: './navbar-ui.html',
    styleUrl: './navbar-ui.css',
})
export class NavbarUi {
    user = input<NavUser | null>(null);
    searchQuery = model<string>('');
    activeRoute = input<string>('');
    links = input<NavLink[]>([
        {label: 'Home', route: '/', icon: '⌂'},
        {label: 'Upload', route: '/upload', icon: '↑'},
    ]);

    logoClick = output<void>();
    navClick = output<string>();
    searchChange = output<string>();
    searchSubmit = output<string>();
    signInClick = output<void>();
    signUpClick = output<void>();
    profileClick = output<void>();
    settingsClick = output<void>();
    logoutClick = output<void>();
    uploadClick = output<void>();

    uploadCount = input(0);

    menuOpen = signal(false);
    mobileSearchOpen = signal(false);

    @HostListener('document:click', ['$event'])
    onDocClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu')) {
            this.menuOpen.set(false);
        }
    }
}
