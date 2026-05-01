import { NextFunction, Request, Response } from "express";
import { BadRequestError, HTTPError } from "../errors";
import { userRepo } from "../models/repositories";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface LoginBody {
    email: string;
    password: string
}

interface SignupBody extends LoginBody {
    isAdmin: boolean
}

function parseLoginBody(body: Partial<LoginBody> | undefined) {
    if (!body?.email || !body?.password) {
        throw new BadRequestError()
    }

    return {
        email: body.email,
        password: body.password
    }
}

function parseSignupBody(body: Partial<SignupBody> | undefined) {
    if (typeof body?.isAdmin !== "boolean") {
        throw new BadRequestError()
    }

    return {
        isAdmin: body.isAdmin,
        ...parseLoginBody(body)
    }
}

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseLoginBody(req.body);

            const findedUser = await userRepo.findOne({
                where: {
                    email: payload.email,
                },
                select: ["email", "id", "isAdmin", "password"]
            })

            const unauthorized = () => { throw new HTTPError(401, "Email or password invalids") }

            if (!findedUser) {
                return unauthorized()
            }

            const pwdsEqual = await bcrypt.compare(payload.password, findedUser.password)

            if (!pwdsEqual) {
                return unauthorized()
            }

            const ONE_HOUR_IN_SECS = 60 * 60;
            const token = jwt.sign({ sub: findedUser.email }, "SECRET", { expiresIn: ONE_HOUR_IN_SECS })

            const { password: _, ...safeUser } = findedUser

            return res.status(200).json({
                token,
                user: safeUser
            })


        } catch (err) {
            return next(err)
        }
    }

    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseSignupBody(req.body);

            const findedUser = await userRepo.findOneBy({ email: payload.email })
            if (findedUser) {
                throw new HTTPError(409, 'Email already registered')
            }

            const hashedPwd = await bcrypt.hash(payload.password, 10);
            const newUser = userRepo.create({
                ...payload,
                password: hashedPwd
            });

            const { password: _, ...safeUser } = await userRepo.save(newUser);

            return res.status(200).json(safeUser);

        } catch (err) {
            return next(err)
        }
    }
}

