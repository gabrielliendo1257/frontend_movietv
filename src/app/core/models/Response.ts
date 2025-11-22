import {JwtAccess} from '@core/models/JwtModel';

export interface ResponseBackend {
    body: JwtAccess;
    statusCode: string;
    statusCodeValue: number;
    headers: any;
}
