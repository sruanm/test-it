import { NextFunction, Request, Response } from "express";
import { BadRequestError, HTTPError } from "../errors";
import { AppDataSource } from "../data-source";
import { Usuario } from "../models/entities";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

type SignupReqBody = Omit<Usuario, "id" | "role">

function parseSignupBody(body: Partial<SignupReqBody> | undefined) {
    if (!body?.cpf || !body.email || !body.nomeCompleto || !body.municipio || !body.senha) {
        throw new BadRequestError()
    }

    return {
        cpf: body.cpf,
        email: body.email,
        nomeCompleto: body.nomeCompleto,
        municipio: body.municipio,
        senha: body.senha
    }
}

export class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseSignupBody(req.body);
            
            const repo = AppDataSource.getRepository(Usuario)

            const findedUserByEmail = await repo.findOneBy({ email: payload.email })
            const findedUserByCpf = await repo.findOneBy({ cpf: payload.cpf })

            if (findedUserByCpf || findedUserByEmail) {
                throw new HTTPError(409, `${findedUserByCpf ? 'Cpf' : 'Email'} already registered`)
            }

            const hashedPwd = await bcrypt.hash(payload.senha, 10)

            const newUser = repo.create({
                ...payload,
                role: "tecnico",
                senha: hashedPwd
            })

            const { senha: _, ...safeUser } = await repo.save(newUser)

            return res.status(200).json(safeUser)
        }
        catch (err) {
            return next(err);
        }
    }
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseLoginReqBody(req.body)

            const repo = AppDataSource.getRepository(Usuario)
            const findedUser = await repo.findOne({
                where: {
                    email: payload.email
                },
                select: ["cpf", "email", "nomeCompleto", "id", "municipio", "role", "senha"]
            })

            const unauthorized = () => { throw new HTTPError(401, "Email or password invalids") }

            if (!findedUser) {
                return unauthorized()
            }

            const pwdsEqual = await bcrypt.compare(payload.senha, findedUser.senha)

            if (!pwdsEqual) {
                return unauthorized()
            }

            const ONE_HOUR_IN_SECS = 60 * 60;
            const token = jwt.sign({ sub: findedUser.email }, "SECRET", { expiresIn: ONE_HOUR_IN_SECS });

            const { senha: _, ...safeUser } = findedUser

            return res.status(200).json({
                token,
                user: safeUser
            })
        }
        catch (err) {
            return next(err);
        }
    }
}

interface LoginReqBody {
    email: string;
    senha: string
}

function parseLoginReqBody(body: Partial<LoginReqBody> | undefined) {
    if (!body?.email || !body?.senha) {
        throw new BadRequestError()
    }

    return {
        email: body.email,
        senha: body.senha
    }
}