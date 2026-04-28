import { Request, Response, NextFunction } from "express";
import { AppError } from "./errors";
import jwt from 'jsonwebtoken'
import { AppDataSource } from "./data-source";
import { User } from "./models/entities";

export async function errorMiddleware(error: any, _req: Request, res: Response, next: NextFunction) {
    try {
        const statusCode = error?.statusCode || 500;
        const customMessage = error?.customMessage || "Internal server error"

        console.error(`Catched error: ${error}`)

        return res.status(statusCode).json({ error: customMessage })
    } catch (err) {
        return next(err)
    }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const unauthorizedErr = new AppError(401, "Unauthorized")
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw unauthorizedErr
        }

        let email: string | null = null;

        try {
            const decoded = jwt.verify(token, "SECRET");

            if (typeof decoded !== "string") {
                if (typeof decoded?.sub === "string") {
                    email = decoded.sub;
                }
            }
        } catch {
        }

        if (!email) {
            throw unauthorizedErr
        }

        const repo = AppDataSource.getRepository(User)
        const findedUser = await repo.findOneBy({ email });

        if (!findedUser) {
            throw unauthorizedErr
        }

        (req as any).user = findedUser;

        return next();
    } catch (err) {
        return next(err)
    }
}