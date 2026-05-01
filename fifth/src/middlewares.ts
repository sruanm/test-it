import { NextFunction, Request, Response } from "express";
import { HTTPError } from "./errors";
import jwt from 'jsonwebtoken'
import { userRepo } from "./models/repositories";

export function logMiddleware(req: Request, _res: Response, next: NextFunction) {
    console.info(`[${req.method}] ${req.path}`)

    return next()
}

export function errorMiddleware(error: any, _req: Request, res: Response, next: NextFunction) {
    if (!error) {
        return next()
    }

    try {
        const statusCode = error?.statusCode as number | undefined ?? 500;
        const message = error?.customMessage as string | undefined ?? "Internal server error";

        return res.status(statusCode).json({ error: message })
    }
    catch (err) {
        return next(err);
    }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        const unauthorized = () => { throw new HTTPError(401, 'Unauthorized') };

        if (!token) {
            return unauthorized()
        }

        let email: string

        try {
            const decoded = jwt.verify(token, "SECRET")
            if (typeof decoded !== "string" && decoded.sub) {
                email = decoded.sub;
            }

            else {
                return unauthorized()
            }
        } catch {
            return unauthorized()
        }

        const findedUser = await userRepo.findOneBy({ email })
        if (!findedUser) {
            return unauthorized()
        }

        (req as any).user = findedUser;

        return next();
    } catch (err) {
        return next(err);
    }
}