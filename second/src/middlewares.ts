import { Request, Response, NextFunction } from "express";

export async function logMiddleware(req: Request, _res: Response, next: NextFunction) {
    console.info(`[${req.method}] ${req.path}`);

    return next();
}

export async function errorMiddleware(error: any, _req: Request, res: Response, next: NextFunction) {
    try {
        const statusCode = error?.statusCode || 500;
        const message = error?.customMessage || "Internal server error";

        console.error(`${statusCode} ${message}`);
        return res.status(statusCode).json({ error: message });
    } catch (err) {
        return next(err);
    }
}