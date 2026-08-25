import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-base-url';
import { ShellContext } from '@features/shell/models/shell-context';

/** Bootstrap transversal del shell: identidad, capacidades y contexto. */
@Injectable({ providedIn: 'root' })
export class ShellApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    getContext(): Observable<ShellContext> {
        return this.http.get<ShellContext>(this.baseUrl + '/web/shell');
    }
}
