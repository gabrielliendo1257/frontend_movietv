import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { AuthService } from '@core/session/auth.service';
import { AccountApi } from '@features/account/data-access/account-api';
import { HomeView } from '@features/account/models/home';

/**
 * Estado global del usuario autenticado (perfil, cuota, subidas recientes).
 * Se recarga al iniciar sesión; los consumidores leen signals derivados.
 */
@Injectable({ providedIn: 'root' })
export class AccountStore {
    private readonly api = inject(AccountApi);
    private readonly authService = inject(AuthService);

    private readonly _home = signal<HomeView | null>(null);
    private readonly _loading = signal(false);
    private readonly _error = signal(false);

    readonly home = this._home.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly profile = computed(() => this._home()?.profile ?? null);
    readonly quota = computed(() => this._home()?.quota ?? null);

    constructor() {
        // Un solo fetch por sesión; se limpia al cerrar sesión.
        toObservable(this.authService.isLogged)
            .pipe(
                switchMap((logged) =>
                    logged
                        ? this.api.getHome().pipe(catchError(() => {
                              this._error.set(true);
                              return EMPTY;
                          }))
                        : EMPTY,
                ),
            )
            .subscribe((home) => {
                this._home.set(home);
                this._loading.set(false);
            });
    }

    reload(): void {
        this._loading.set(true);
        this._error.set(false);
        this.api
            .getHome()
            .pipe(catchError(() => {
                this._error.set(true);
                this._loading.set(false);
                return EMPTY;
            }))
            .subscribe((home) => {
                this._home.set(home);
                this._loading.set(false);
            });
    }
}
