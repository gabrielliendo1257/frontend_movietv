import { Component, inject } from '@angular/core';
import { AccountStore } from '@features/account/data-access/account-store';
import { BytesPipe } from '@shared/pipes/bytes.pipe';

@Component({
    selector: 'app-settings-page',
    imports: [BytesPipe],
    templateUrl: './settings-page.html',
    styleUrl: './settings-page.css',
})
export class SettingsPage {
    private readonly accountStore = inject(AccountStore);

    readonly home = this.accountStore.home;

    quotaPercent(quota: { quotaBytes: number; usedBytes: number }): number {
        if (!quota.quotaBytes) return 0;
        return Math.min(100, Math.round((quota.usedBytes / quota.quotaBytes) * 100));
    }
}
