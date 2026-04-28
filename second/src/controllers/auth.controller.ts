import { Request, Response, NextFunction } from "express";
import { HTTPError } from "../errors";
import { AppDataSource } from "../data-source";
import { User } from "../models/entities";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface LoginRequest {
    email: string;
    password: string;
}

function parseBody(body: Partial<LoginRequest> | undefined) {
    if (!body) {
        throw new HTTPError(400, "Credentials must be sent");
    }

    if (typeof body?.email !== "string" || typeof body?.password !== "string") {
        throw new HTTPError(400, "Email and password must be sent");
    }

    const [email, password] = [body.email.trim(), body.password.trim()];

    if (!email || !password) {
        throw new HTTPError(400, "Email and password must be not empty")
    }

    return { email, password }
}

export class AuthController {
    static async signup(req: Request, res: Response<{ id: number, email: string }>, next: NextFunction) {
        try {
            const payload = parseBody(req.body);

            const repo = AppDataSource.getRepository(User);
            const findedUser = await repo.findOneBy({ email: payload.email })

            if (findedUser) {
                throw new HTTPError(409, "Email already on use")
            }

            const hashedPassword = await bcrypt.hash(payload.password, 10);
            const newUser = repo.create({ ...payload, password: hashedPassword });

            const { password: _, registeredBooks: __, ...safeUser } = await repo.save(newUser);

            return res.status(200).json(safeUser);
        } catch (err) {
            return next(err);
        }
    }

    static async login(req: Request, res: Response<{ token: string, user: { id: number, email: string } }>, next: NextFunction) {
        try {
            const payload = parseBody(req.body);

            const repo = AppDataSource.getRepository(User);
            const findedUser = await repo.findOne({
                where: {
                    email: payload.email
                },
                select: ["id", "email", "password"]
            })

            const unauthorizedErr = new HTTPError(401, "Email or password invalids!");

            if (!findedUser) {
                throw unauthorizedErr;
            }

            const pwdsEqual = await bcrypt.compare(payload.password, findedUser.password);

            if (!pwdsEqual) {
                throw unauthorizedErr;
            }

            const ONE_MINUTE = 60;
            const token = jwt.sign({ sub: findedUser.email }, "SECRET", { expiresIn: ONE_MINUTE })

            const { password: _, ...safeUser } = findedUser;
            return res.status(200).json({
                token,
                user: safeUser
            })

        } catch (err) {
            return next(err);
        }
    }
}