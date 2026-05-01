import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source"
import { JobOpportunity, Submission, User } from "../models/entities"
import { HTTPError } from "../errors";

type CreateOpBody = Omit<JobOpportunity, "id" | "submissions">

function parseCreateOpBody(body: Partial<CreateOpBody> | undefined) {
    if (!body?.description || !body?.renumeration || !body?.title) {
        throw new HTTPError(400, "All data must be sent");
    }

    return body;
}

function parseCreateSubBody(body: Partial<{ message: string }> | undefined) {
    if (!body?.message) {
        throw new HTTPError(400, "All data must be sent");
    }

    return body;
}

function parseIntId(rawId: string | undefined) {
    if (!rawId) {
        throw new HTTPError(500, "Routes misconfiguration")
    }

    const id = parseInt(rawId);

    return id;
}

export class OpportunityController {
    static async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseIntId(req.params["id"])

            const opportunityRepo = AppDataSource.getRepository(JobOpportunity)
            const loggedUser = (req as any).user as User;
            
            const findedOpportunity = await opportunityRepo.findOne({
                where: {
                    id,
                    publisher: loggedUser
                },
                relations: {
                    submissions: true
                }
            })

            if (!findedOpportunity) {
                throw new HTTPError(404, "Opportunity not found")
            }

            return res.status(200).json(findedOpportunity.submissions)
        } catch (err) {
            return next(err)
        }
    }

    static async cancelSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseIntId(req.params["id"])

            const submissionRepo = AppDataSource.getRepository(Submission)
            const loggedUser = (req as any).user as User;

            const findedSubmission = await submissionRepo.findOneBy({
                id,
                candidate: loggedUser
            })

            if (!findedSubmission) {
                throw new HTTPError(404, "Submission not found")
            }

            await submissionRepo.delete(findedSubmission.id);

            return res.status(204).send();
        } catch (err) {
            return next(err)
        }
    }

    static async makeSubmission(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseIntId(req.params["id"])
            const payload = parseCreateSubBody(req.body)

            const opportunityRepo = AppDataSource.getRepository(JobOpportunity)
            const findedOpportunity = await opportunityRepo.findOne({
                where: {
                    id
                },
                relations: {
                    publisher: true
                }
            })

            if (!findedOpportunity) {
                throw new HTTPError(404, "Opportunity not found")
            }

            const loggedUser = (req as any).user as User;

            if (loggedUser.id === findedOpportunity.publisher.id) {
                throw new HTTPError(409, "Publisher can not submit to his own opportunities")
            }

            const submissionRepo = AppDataSource.getRepository(Submission);

            const findedSubmission = await submissionRepo.findOneBy({
                opportunity: findedOpportunity,
                candidate: loggedUser
            })
            
            if (findedSubmission) {
                throw new HTTPError(409, "User can not submit to same opportunity twice")
            }

            const newSubmission = submissionRepo.create({
                candidate: loggedUser,
                opportunity: findedOpportunity,
                ...payload
            })

            const { candidate: _, opportunity: __, ...safeSubmission } = await submissionRepo.save(newSubmission)

            return res.status(201).json(safeSubmission);
        } catch (err) {
            return next(err)
        }
    }

    static async createOpportunity(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = parseCreateOpBody(req.body)

            const repo = AppDataSource.getRepository(JobOpportunity);
            const loggedUser = (req as any).user as User

            const newOpportunity = repo.create({
                ...payload,
                publisher: loggedUser
            })

            const { submissions, publisher, ...safeOpportunity } = await repo.save(newOpportunity)

            return res.status(201).json(safeOpportunity)
        } catch (err) {
            return next(err)
        }
    }

    static async getAllOpportunities(req: Request, res: Response, next: NextFunction) {
        try {
            const minRenumeration = req.query["salarioMin"] as string | undefined;
            const maxRenumeration = req.query["salarioMax"] as string | undefined;
            const orderBy = req.query["orderBy"] as string | undefined;

            const repo = AppDataSource.getRepository(JobOpportunity);

            const opportunitites = await repo.find({
                order: { ...(orderBy === "salario" ? { renumeration: "DESC" } : {}) }
            })

            const renumerationFilter = (op: JobOpportunity) => {
                let onFilter = true;

                if (minRenumeration) {
                    onFilter = op.renumeration >= parseFloat(minRenumeration)
                }

                if (maxRenumeration) {
                    onFilter = onFilter && (op.renumeration <= parseFloat(maxRenumeration))
                }

                return onFilter;
            }

            return res.status(200).json(opportunitites.filter(renumerationFilter))

        } catch (err) {
            return next(err)
        }
    }
}