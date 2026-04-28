abstract class AppError extends Error { }

export class HTTPError extends AppError {
    constructor(public statusCode: number, public customMessage: string) {
        super();
    }
}