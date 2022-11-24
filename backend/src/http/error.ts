import type { Error as APIError } from '@eligo/protocol';
import { Response } from 'polka';

export class HTTPError extends Error {
    status: number;
    apiError: APIError;
    constructor(status: number, apiError: APIError) {
        super(`${apiError.code}: ${apiError.message}`);
        this.status = status;
        this.apiError = apiError;
    }
}

export const handleError = (res: Response) => (err: Error) => {
    if (err instanceof HTTPError) {
        res.statusCode = err.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err.apiError));
    } else {
        console.error(err);
        res.statusCode = 500;
        res.end('Internal server error');
    }
};
