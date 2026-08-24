import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SidebarEntry {
    label: string;
    route: string;
    children?: SidebarEntry[];
}

const NAV: SidebarEntry[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Assets', route: '/dashboard/assets' },
    { label: 'Activity', route: '/dashboard/activity' },
    { label: 'Settings', route: '/dashboard/settings' },
];

@Component({
    selector: 'app-dashboard-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard-layout.html',
    styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
    readonly nav = NAV;
    readonly menuOpen = signal(false);
}
