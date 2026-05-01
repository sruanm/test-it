import { NextFunction, Request, Response } from "express";
import { SolicitacaoInsumo, SolicitacaoCategory, Lote, Usuario, SolicitacaoStatus } from "../models/entities";
import { BadRequestError, HTTPError, NotFoundError } from "../errors";
import { AppDataSource } from "../data-source";

type CreateSolicitacaoReqBody = Omit<SolicitacaoInsumo, "id" | "status" | "lote" | "avaliadaPor"> & { loteId: string }

function parseCreateSolicitacaoReqBody(body: Partial<CreateSolicitacaoReqBody> | undefined) {
    if (!body?.loteId || !body?.categoria || !body.quantidade) {
        throw new BadRequestError()
    }

    const types: SolicitacaoCategory[] = ["semente", "fertilizante", "kit-irrigacao"]

    if (!types.includes(body.categoria)) {
        throw new HTTPError(400, "Category must be a valid category")
    }

    return {
        loteId: body.loteId,
        categoria: body.categoria as SolicitacaoCategory,
        quantidade: body.quantidade
    }
}


export class SolicitacaoController {
    static async createSolicitacao(req: Request, res: Response, next: NextFunction) {
        try {
            const { loteId, ...solicitacaoPayload } = parseCreateSolicitacaoReqBody(req.body);

            const loggedUser = (req as any).user as Usuario;

            const loteRepo = AppDataSource.getRepository(Lote)
            const findedLote = await loteRepo.findOne({
                where: {
                    id: loteId
                }, relations: {
                    dono: {
                        perfil: true
                    }
                }
            })

            if (!findedLote) {
                throw new NotFoundError()
            }

            if (loggedUser.id !== findedLote.dono.perfil.id) {
                throw new HTTPError(403, "Forbidden")
            }

            const solicitacaoRepo = AppDataSource.getRepository(SolicitacaoInsumo)

            const existingSolicitacoesForTheLote = await solicitacaoRepo.findBy({ lote: findedLote })

            let quantidadeAlreadySolicitaded = 0;

            for (const solicitacao of existingSolicitacoesForTheLote) {
                quantidadeAlreadySolicitaded += solicitacao.quantidade;
            }

            if (quantidadeAlreadySolicitaded + solicitacaoPayload.quantidade > findedLote.tamanhoEmHectares * 50) {
                throw new HTTPError(409, "Quantidade exceeds the available for this lote")
            }

            const newSolicitacao = solicitacaoRepo.create({
                ...solicitacaoPayload,
                status: "pendente",
                lote: findedLote
            });

            const safeSolicitacao = await solicitacaoRepo.save(newSolicitacao)
            return res.status(201).json(safeSolicitacao)
        }
        catch (err) {
            return next(err);
        }
    }

    static async getSolicitacoes(req: Request, res: Response, next: NextFunction) {
        try {
            const loggedUser = (req as any).user as Usuario;

            const status = req.query["status"] as SolicitacaoStatus | undefined;
            const orderBy = req.query["orderBy"] as string | undefined;

            const repo = AppDataSource.getRepository(SolicitacaoInsumo)
            const solicitacoes = await repo.find({
                where: {
                    ...(status ? {
                        status
                    } : {}),
                    lote: {
                        dono: {
                            perfil: { municipio: loggedUser.municipio }
                        }
                    }

                },
                order: {
                    ...(orderBy === "menores-quantidades" ? {
                        quantidade: "DESC"
                    } : {}),
                }
            })

            return res.status(200).json(solicitacoes)
        } catch (err) {
            return next(err)
        }
    }

    static changeSolicitacaoStatus(newStatus: SolicitacaoStatus) {
        return async function (req: Request, res: Response, next: NextFunction) {
            try {
                const id = req.params["id"]
                if (!id) {
                    throw new HTTPError(500, "Routes misconfiguration")
                }

                const repo = AppDataSource.getRepository(SolicitacaoInsumo)
                const findedSolicitacao = await repo.findOne({
                    where: {
                        id
                    }, relations: {
                        lote: true
                    }
                })

                if (!findedSolicitacao) {
                    throw new NotFoundError()
                }

                findedSolicitacao.status = newStatus;

                const loggedUser = (req as any).user as Usuario;
                findedSolicitacao.avaliadaPor = loggedUser

                const safeSolicitacao = await repo.save(findedSolicitacao);

                return res.status(200).json(safeSolicitacao)
            } catch (err) {
                return next(err)
            }
        }
    }


}