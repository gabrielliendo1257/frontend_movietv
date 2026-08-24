import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { HomeView } from '@features/account/models/home';

@Injectable({ providedIn: 'root' })
export class AccountApi {
    private readonly http = inject(HttpClient);

    getHome(): Observable<HomeView> {
        return this.http.get<HomeView>(inject(API_BASE_URL) + '/web/home');
    }
}
