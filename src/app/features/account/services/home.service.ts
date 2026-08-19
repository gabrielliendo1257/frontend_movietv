import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HomeView } from '@features/account/models/home';

@Injectable({
    providedIn: 'root',
})
export class HomeService {
    private readonly http = inject(HttpClient);
    private readonly homeUrl = environment.backendAddress + '/web/home';

    getHome(): Observable<HomeView> {
        return this.http.get<HomeView>(this.homeUrl, { withCredentials: true });
    }
}