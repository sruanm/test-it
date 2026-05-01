import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source"
import { JobOpportunity } from "../models/entities"

export class OpportunityController {
    static async getAllOpportunities(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (err) {
            return next(err)
        }
    }

    static async createOpportunity(req: Request, res: Response, next: NextFunction) {
        try {
            const minRenumeration = req.query["salarioMin"] as string | undefined;
            const maxRenumeration = req.query["salarioMax"] as string | undefined;
            const orderBy = req.query["orderBy"] as string | undefined;

            const repo = AppDataSource.getRepository(JobOpportunity);

            const ops = await repo.find({
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

            return res.status(200).json(ops.filter(renumerationFilter))

        } catch (err) {
            return next(err)
        }
    }
}