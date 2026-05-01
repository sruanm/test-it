abstract class AppError extends Error { }

export class HTTPError extends AppError {
    constructor(public statusCode: number, public customMessage: string) {
        super()
    }
}

export class BadRequestError extends HTTPError {
    constructor() {
        super(400, "All fields must be sent");
    }
}

export class NotFoundError extends HTTPError {
    constructor() {
        super(404, "Resource not found");
    }
}

export class RoutesMisconfigurationError extends HTTPError {
    constructor() {
        super(500, "Routes misconfigurated")
    }
}

export class ConflictError extends HTTPError {
    constructor(customMessage: string) {
        super(409, customMessage)
    }
}