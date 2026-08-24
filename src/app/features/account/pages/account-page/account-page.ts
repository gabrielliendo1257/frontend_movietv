import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@core/session/auth.service';
import { AccountStore } from '@features/account/data-access/account-store';
import { BytesPipe } from '@shared/pipes/bytes.pipe';

@Component({
    selector: 'app-account-page',
    imports: [BytesPipe],
    templateUrl: './account-page.html',
    styleUrl: './account-page.css',
})
export class AccountPage implements OnInit {
    private readonly accountStore = inject(AccountStore);
    private readonly authService = inject(AuthService);

    readonly isLogged = this.authService.isLogged;

    readonly home = this.accountStore.home;
    readonly loading = this.accountStore.loading;
    readonly error = this.accountStore.error;

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.accountStore.reload();
    }

    quotaPercent(used: number, quota: number): number {
        if (!quota) return 0;
        return Math.min(100, Math.round((used / quota) * 100));
    }
}
