import { NextFunction, Request, Response } from "express";
import { HTTPError } from "./errors";
import jwt from 'jsonwebtoken'
import { AppDataSource } from "./data-source";
import { User } from "./models/entities";

export function logMiddleware(mode: "req" | "res") {
    return function log(req: Request, res: Response, next: NextFunction) {
        if (mode === "req") {
            console.info(`[${req.method}] ${req.path}`);
        }

        else {
            console.info(`\n[${res.statusCode}]\n`)
        }

        return next();
    }
}

export function errorMiddleware(error: any, _req: Request, res: Response, next: NextFunction) {
    try {
        const statusCode = error?.statusCode as number | undefined ?? 500;
        const message = error?.customMessage as number | string ?? "Internal server error";

        return res.status(statusCode).json({ error: message })


    } catch (err) {
        return next(err);
    }
}


export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const unauthorized = () => { throw new HTTPError(400, "Unauthorized") }

        if (!token) {
            return unauthorized();
        }

        let email: string;

        try {
            const decoded = jwt.verify(token, "SECRET")
            if (typeof decoded === "string" || !decoded.sub) {
                return unauthorized();
            }

            email = decoded.sub;
        } catch (err) {
            return unauthorized()
        }

        const repo = AppDataSource.getRepository(User);
        const findedUser = await repo.findOneBy({ email });

        if (!findedUser) {
            return unauthorized()
        }

        (req as any).user = findedUser;

        return next();
    }
    catch (err) {
        return next(err);
    }
}