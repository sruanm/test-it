import { NextFunction, Request, Response } from "express";
import { CulturaCategory, Lote, Produtor, Usuario } from "../models/entities";
import { BadRequestError, HTTPError, NotFoundError } from "../errors";
import { AppDataSource } from "../data-source";
import bcrypt from 'bcryptjs'

type CreateProdutorReqBody = Omit<Usuario, "id" | "role"> & Omit<Produtor, "id" | "perfil">

function parseCreateProdutorReqBody(body: Partial<CreateProdutorReqBody> | undefined) {
    if (!body?.areaTotalEmHectares || !body?.cpf || !body?.email || !body?.municipio || !body?.nomeCompleto || !body?.senha) {
        throw new BadRequestError();
    }

    return {
        areaTotalEmHectares: body.areaTotalEmHectares,
        cpf: body.cpf,
        email: body.email,
        municipio: body.municipio,
        nomeCompleto: body.nomeCompleto,
        senha: body.senha
    }
}

export class ProdutorController {
    static async createProdutor(req: Request, res: Response, next: NextFunction) {
        try {
            const { areaTotalEmHectares, ...userPayload } = parseCreateProdutorReqBody(req.body);

            const userRepo = AppDataSource.getRepository(Usuario)

            const findedUserByEmail = await userRepo.findOneBy({ email: userPayload.email })
            const findedUserByCpf = await userRepo.findOneBy({ cpf: userPayload.cpf })

            if (findedUserByCpf || findedUserByEmail) {
                throw new HTTPError(409, `${findedUserByCpf ? 'Cpf' : 'Email'} already registered`)
            }

            const hashedPwd = await bcrypt.hash(userPayload.senha, 10)

            const newUser = userRepo.create({
                ...userPayload,
                role: "produtor",
                senha: hashedPwd
            })

            const { senha: _, ...safeUser } = await userRepo.save(newUser)

            const produtorRepo = AppDataSource.getRepository(Produtor)

            const newProdutor = produtorRepo.create({
                perfil: newUser,
                areaTotalEmHectares: areaTotalEmHectares
            })

            const { perfil: __, id: ___, ...safeProdutor } = await produtorRepo.save(newProdutor);

            return res.status(201).json({
                ...safeUser,
                ...safeProdutor
            })
        } catch (err) {
            return next(err)
        }
    }

    static async createLote(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseCreateLoteReqBody(req.body);
            const id = req.params["id"];
            if (!id) {
                throw new HTTPError(500, "Routes misconfiguration")
            }

            const userRepo = AppDataSource.getRepository(Usuario);
            const findedUser = await userRepo.findOneBy({ id })

            if (!findedUser || findedUser.role !== "produtor") {
                throw new NotFoundError()
            }

            const produtorRepo = AppDataSource.getRepository(Produtor);
            const findedProdutor = await produtorRepo.findOneBy({ perfil: findedUser })

            if (!findedProdutor) {
                throw new NotFoundError()
            }

            const loteRepo = AppDataSource.getRepository(Lote);

            const existingProdutorLotes = await loteRepo.findBy({
                dono: findedProdutor,
            });
            // await loteRepo.sum("tamanhoEmHectares", {  // Devia ter feito assim
            //     dono: findedProdutor,
            // });

            let existingProdutorLotesTotalArea = 0;

            for (const lote of existingProdutorLotes) {
                existingProdutorLotesTotalArea += lote.tamanhoEmHectares
            }

            const newLote = loteRepo.create({
                ...payload,
                dono: findedProdutor,
            })

            if (existingProdutorLotesTotalArea + newLote.tamanhoEmHectares > findedProdutor.areaTotalEmHectares) {
                throw new HTTPError(409, "New lote exceeds the areaTotalEmHectares registered on produtor profile")
            }

            const { dono: _, ...safeLote } = await loteRepo.save(newLote)

            return res.status(201).json(safeLote)

        } catch (err) {
            return next(err)
        }
    }
}

type CreateLoteReqBody = Omit<Lote, "id" | "dono">

function parseCreateLoteReqBody(body: Partial<CreateLoteReqBody> | undefined) {
    if (!body?.cultura || !body?.tamanhoEmHectares) {
        throw new BadRequestError()
    }

    const culturas: CulturaCategory[] = ["caju", "milho", "feijao"]

    if (!culturas.includes(body.cultura)) {
        throw new HTTPError(400, "Cultura must be a valid category")
    }

    return {
        cultura: body.cultura as CulturaCategory,
        tamanhoEmHectares: body.tamanhoEmHectares
    }
}