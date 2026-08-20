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
    children?: NavLink[];
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
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Home', route: '/movies' },
        {
            label: 'Movies',
            route: '/movies',
            children: [
                { label: 'En tendencia', route: '/movies' },
                { label: 'Últimas películas', route: '/movies' },
                { label: 'Más vistas', route: '/movies' },
            ],
        },
        {
            label: 'TV Shows',
            route: '/movies',
            children: [
                { label: 'Series', route: '/movies' },
                { label: 'Próximamente', route: '/movies' },
            ],
        },
        { label: 'Upload', route: '/uploads' },
        { label: 'Bibliotecas', route: '/libraries' },
        { label: 'Mi cuenta', route: '/account' },
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
    notificationsClick = output<void>();

    uploadCount = input(0);

    menuOpen = signal(false);
    mobileSearchOpen = signal(false);
    mobileNavOpen = signal(false);
    openDropdown = signal<string | null>(null);

    @HostListener('document:click', ['$event'])
    onDocClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu')) {
            this.menuOpen.set(false);
        }
        if (!target.closest('.nav-dropdown')) {
            this.openDropdown.set(null);
        }
    }

    onLinkClick(link: NavLink): void {
        if (link.children?.length) {
            this.openDropdown.set(this.openDropdown() === link.label ? null : link.label);
            return;
        }

        this.openDropdown.set(null);
        this.mobileNavOpen.set(false);
        this.navClick.emit(link.route);
    }
}
