import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '@core/config/api-base-url';

/**
 * La sesión vive en una cookie HttpOnly del BFF: todas las peticiones hacia él
 * deben viajar con credenciales. Las peticiones a terceros (p. ej. upload
 * directo a storage con URL presigned) quedan intactas.
 */
export const bffCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
    const baseUrl = inject(API_BASE_URL);

    if (!req.url.startsWith(baseUrl)) {
        return next(req);
    }

    return req.withCredentials ? next(req) : next(req.clone({ withCredentials: true }));
};
