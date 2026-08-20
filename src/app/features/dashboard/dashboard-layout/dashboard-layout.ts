import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SidebarEntry {
    label: string;
    route: string;
    children?: SidebarEntry[];
}

const NAV: SidebarEntry[] = [
    { label: 'Dashboard', route: '/dashboard' },
    {
        label: 'Libraries',
        route: '/dashboard/libraries',
        children: [
            { label: 'Local', route: '/dashboard/libraries' },
            { label: 'S3', route: '/dashboard/libraries' },
        ],
    },
    { label: 'Catalog', route: '/dashboard/catalog' },
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
}
