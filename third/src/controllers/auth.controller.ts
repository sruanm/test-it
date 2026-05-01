import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors";
import { AppDataSource } from "../data-source";
import { User } from "../models/entities";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface SignBody {
    email: string
    password: string
}

function parseSignBody(body: Partial<SignBody> | undefined) {
    if (!body?.email || !body?.password) {
        throw new HTTPError(400, "Credentials must be sent");
    }

    return {
        email: body.email,
        password: body.password
    }
}


export class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseSignBody(req.body);

            const repo = AppDataSource.getRepository(User)

            const findedUser = await repo.findOneBy({ email: payload.email })
            if (findedUser) {
                throw new HTTPError(409, "Email already registered")
            }

            const hashedPassword = await bcrypt.hash(payload.password, 10)

            const newUser = repo.create({
                email: payload.email,
                password: hashedPassword,
            })
            const { password: _, ...safeUser } = await repo.save(newUser)

            return res.status(200).json(safeUser)
        } catch (err) {
            return next(err)
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseSignBody(req.body);

            const repo = AppDataSource.getRepository(User)

            const findedUser = await repo.findOne({
                where: {
                    email: payload.email
                },
                select: ["id", "email", "password"]
            })

            const unauthorized = () => { throw new HTTPError(401, "Email or password invalid") }

            if (!findedUser) {
                return unauthorized()
            }

            const pwdsEqual = await bcrypt.compare(payload.password, findedUser.password);

            if (!pwdsEqual) {
                return unauthorized()
            }

            const ONE_HOUR_IN_SECS = 60 * 60;
            const token = jwt.sign({ sub: findedUser.email }, "SECRET", { expiresIn: ONE_HOUR_IN_SECS })

            const { password: _, ...safeUser } = findedUser

            return res.status(200).json({
                user: safeUser,
                token
            })
        } catch (err) {
            return next(err)
        }
    }
}