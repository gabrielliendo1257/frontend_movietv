import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Raíz del BFF, p. ej. http://localhost:9091 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
    providedIn: 'root',
    factory: () => environment.backendAddress,
});
