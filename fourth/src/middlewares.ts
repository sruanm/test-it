import { NextFunction, Request, Response } from "express";
import { Usuario, UsuarioRole } from "./models/entities";
import { HTTPError } from "./errors";
import jwt from 'jsonwebtoken'
import { AppDataSource } from "./data-source";

export function logMiddleware(req: Request, _res: Response, next: NextFunction) {
    console.info(`[${req.method}] ${req.path}`)
    return next()
}

export function errorMiddleware(error: any, _req: Request, res: Response, next: NextFunction) {
    try {
        if (!error) {
            return next()
        }

        const statusCode = error?.statusCode as number | undefined ?? 500;
        const customMessage = error?.customMessage as number | undefined ?? 'Internal server error';

        return res.status(statusCode).json({ detail: customMessage })
    } catch (err) {
        return next(err)
    }
}

export function authMiddleware(requiredRole?: UsuarioRole) {
    return async function (req: Request, _res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization?.split(" ")[1]

            const unauthorized = () => { throw new HTTPError(401, "Unauthorized") }
            const forbidden = () => { throw new HTTPError(403, "Forbidden") }

            if (!token) {
                return unauthorized()
            }

            let email: string;

            try {
                const decoded = jwt.verify(token, "SECRET");

                if (typeof decoded !== "string" && decoded.sub) {
                    email = decoded.sub;
                }
                else {
                    return unauthorized()
                }
            } catch {
                return unauthorized()
            }

            const repo = AppDataSource.getRepository(Usuario);
            const findedUser = await repo.findOneBy({ email });

            if (!findedUser) {
                return unauthorized();
            }

            if (requiredRole && findedUser.role !== requiredRole) {
                return forbidden()
            }

            (req as any).user = findedUser;

            return next()
        } catch (err) {
            return next(err)
        }
    }
}