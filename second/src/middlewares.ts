import { Request, Response, NextFunction } from "express";
import { HTTPError } from "./errors";
import jwt from 'jsonwebtoken'
import { AppDataSource } from "./data-source";
import { User } from "./models/entities";

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

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const unauthorizedErr = new HTTPError(401, "Unauthorized");

        if (!token) {
            throw unauthorizedErr;
        }

        let email: string | null = null;

        try {
            const decoded = jwt.verify(token, "SECRET");
            if (typeof decoded !== "string" && decoded) {
                if (decoded?.sub === "string") {
                    email = decoded.sub;
                }
            }
        } catch {
            email = null;
        }

        if (!email) {
            throw unauthorizedErr;
        }

        const repo = AppDataSource.getRepository(User)
        const findedUser = await repo.findOneBy({ email });

        if (!findedUser) {
            throw unauthorizedErr;
        }

        (req as any).user = findedUser;

        return next();
    } catch (err) {
        return next(err);
    }
}