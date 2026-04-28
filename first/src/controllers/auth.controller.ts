import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { AppDataSource } from "../data-source";
import { User } from "../models/entities";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

function parseSignBody(body: any) {
    let email = null;
    let password = null

    if (body) {
        if (typeof body?.email === "string" && body.email.trim() !== "") {
            email = body.email.trim() as string;
        }
        if (typeof body?.password === "string" && body.password.trim() !== "") {
            password = body.password.trim() as string
        }
    }

    if (!email || !password) {
        throw new AppError(400, "Email and password must be sent")
    }

    return { email, password }
}


export class AuthController {
    static async signup(req: Request, res: Response<Omit<User, "password">>, next: NextFunction) {
        try {

            const { email, password } = parseSignBody(req.body);

            const repo = AppDataSource.getRepository(User)
            const findedUser = await repo.findOneBy({ email });

            if (findedUser) {
                throw new AppError(409, "Email already in use")
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = repo.create({ email, password: hashedPassword })

            const { password: _, ...safeUser } = await repo.save(newUser)

            return res.status(200).json(safeUser)

        } catch (err) {
            return next(err)
        }
    }

    static async login(req: Request, res: Response<{ token: string, user: Omit<User, "password"> }>, next: NextFunction) {
        try {
            const { email, password } = parseSignBody(req.body);

            const repo = AppDataSource.getRepository(User);

            const findedUser = await repo.findOne({ where: { email }, select: ["id", "email", "password"] })

            if (!findedUser) {
                throw new AppError(401, "Email or password invalids")
            }

            const passwordsEqual = await bcrypt.compare(password, findedUser.password);

            if (!passwordsEqual) {
                throw new AppError(401, "Email or password invalids")
            }

            const ONE_HOUR = 60 * 60
            const token = jwt.sign({ sub: findedUser.email }, "SECRET", { expiresIn: ONE_HOUR })

            const { password: _, ...safeUser } = findedUser;

            return res.status(200).json({
                user: safeUser,
                token
            })
        } catch (err) {
            return next(err);
        }
    }
}