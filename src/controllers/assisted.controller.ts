import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { Assisted, Benefit, BenefitType, User } from "../models/entities";
import { AppDataSource } from "../data-source";

type CreateAssisted = Omit<Assisted, "id" | "user" | "benefits">

function parseCreateBody(body: undefined | Partial<CreateAssisted>) {
    // const badRequest = new AppError(400, 'All assisted data must be sent')

    if (!body) {
        throw new AppError(400, 'All assisted data must be sent')
    }

    const [cpf, fullName, monthlyFamiliarMoney] = [body?.cpf, body?.fullName, body?.monthlyFamiliarMoney];

    if (typeof cpf !== "string" || typeof fullName !== "string") {
        throw new AppError(400, 'Cpf and fullName must be strings')
    }

    if (typeof monthlyFamiliarMoney !== "number") {
        throw new AppError(400, 'monthlyFamiliarMoney must be a number')
    }

    const [clearedCpf, clearedFullName] = [cpf.trim(), fullName.trim()];

    if (!cpf || !fullName) {
        throw new AppError(400, 'Cpf and fullName must be not empty!')
    }

    let cpfOnlyNumbers = '';

    for (const char of clearedCpf) {
        if (char >= '1' && char <= '9' || char === '0') {
            cpfOnlyNumbers += char;
        }
    }

    if (cpfOnlyNumbers.length !== 11) {
        throw new AppError(400, 'Cpf must have 11 digits')
    }

    if (monthlyFamiliarMoney < 0) {
        throw new AppError(400, 'monthlyFamiliarMoney must be greater than 0')
    }

    return { fullName: clearedFullName, cpf: cpfOnlyNumbers, monthlyFamiliarMoney }
}


export class AssistedController {
    static async getAll(req: Request, res: Response<Omit<Assisted, "user">[]>, next: NextFunction) {
        try {
            const repo = AppDataSource.getRepository(Assisted);

            const loggedUser = (req as any).user as User;

            const assisteds = await repo.find({
                where: {
                    user: loggedUser
                },
                relations: {
                    benefits: true
                }
            })

            return res.status(200).json(assisteds)
        } catch (err) {
            return next(err);
        }
    }

    static async register(req: Request, res: Response<Omit<Assisted, "user" | "benefits">>, next: NextFunction) {
        try {
            const payload = parseCreateBody(req.body);

            const repo = AppDataSource.getRepository(Assisted);

            const findedUser = await repo.findOneBy({ cpf: payload.cpf })
            if (findedUser) {
                throw new AppError(409, 'Cpf already registered on system')
            }

            const user = (req as any).user as User;
            const newAssisted = repo.create({ user, ...payload })

            const { user: _, benefits: __, ...safeAssisted } = await repo.save(newAssisted);

            return res.status(201).json(safeAssisted);
        } catch (err) {
            return next(err)
        }
    }

    static async removeBenefit(req: Request, res: Response, next: NextFunction) {
        try {
            const assistedId = req.params["id"]
            const benefitId = req.params["benefitId"]

            if (!assistedId || !benefitId) {
                throw new AppError(500, "Routes misconfigurated on the server");
            }

            const loggedUser = (req as any).user as User;

            const repo = AppDataSource.getRepository(Benefit)

            const findedBenefit = await repo.findOne({
                where: {
                    id: benefitId,
                    assisted: {
                        user: loggedUser
                    }
                },
                relations: {
                    assisted: true
                }
            })

            if (!findedBenefit) {
                throw new AppError(404, "Benefit not found")
            }

            await repo.delete(findedBenefit.id);

            return res.status(204);
        } catch (err) {
            return next(err);
        }
    }

    static async addBenefit(req: Request, res: Response<Omit<Benefit, "assisted">>, next: NextFunction) {
        try {
            const id = req.params["id"];

            if (!id) {
                throw new AppError(500, "Error on server routes configuration")
            }

            const payload = parseAddBenefit(req.body);

            const assistedRepo = AppDataSource.getRepository(Assisted);
            const findedAssisted = await assistedRepo.findOne({
                where: {
                    id
                },
                relations: {
                    user: true,
                    benefits: true
                }
            })

            if (!findedAssisted) {
                throw new AppError(404, 'Assisted not found')
            }

            const loggedUser = (req as any).user as User;

            if (loggedUser.id !== findedAssisted.user.id) {
                throw new AppError(403, "No permission to perfom this action")
            }

            if (findedAssisted.monthlyFamiliarMoney >= 1500) {
                throw new AppError(409, "Assisted on system has monthly familiar money greater or equal to R$ 1.500,00")
            }

            let assistedBenefitsTotalValue = 0;

            findedAssisted.benefits.forEach((benefit) => { assistedBenefitsTotalValue += benefit.value })

            if ((assistedBenefitsTotalValue + payload.value) > 800) {
                throw new AppError(409, "Assisted benefits sums with this benefit is greater than R$ 800,00")
            }

            const benefitRepo = AppDataSource.getRepository(Benefit);

            const newBenefit = benefitRepo.create({ assisted: findedAssisted, ...payload })

            const { assisted: _, ...safeBenefit } = await benefitRepo.save(newBenefit)

            return res.status(201).json(safeBenefit)

        } catch (err) {
            return next(err)
        }
    }
}

type CreateBenefit = {
    value: number;
    type: string;
}


function parseAddBenefit(body: undefined | Partial<CreateBenefit>) {
    const badRequest = new AppError(400, "Value and type must be sent")

    if (!body) {
        throw badRequest;
    }

    if (typeof body?.type !== "string" || typeof body?.value !== "number") {
        throw badRequest;
    }

    const benefitTypes = ["food", "gas", "transport"]

    const { type, value } = body;

    if (!benefitTypes.includes(type)) {
        throw new AppError(400, "Type must be valid")
    }

    if (value < 0) {
        throw new AppError(400, "Value must be positive")
    }

    return {
        type: type as BenefitType
        , value
    }
}

