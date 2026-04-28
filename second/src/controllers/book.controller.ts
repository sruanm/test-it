import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors";
import { Book, BookGender, User } from "../models/entities";
import { AppDataSource } from "../data-source";

type CreateBookReq = Omit<Book, "id" | "registeredBy" | "evaluations">

const bookGenders: BookGender[] = ["fic", "bio", "tec", "child"]


function parseCreateBody(body: Partial<CreateBookReq> | undefined) {
    if (body && typeof body?.author === "string" && typeof body?.gender === "string" && typeof body?.title === "string") {
        throw new HTTPError(400, "All body params must be sent")
    }

    const [author, gender, title] = [body?.author?.trim(), body?.gender?.trim(), body?.title?.trim()]

    if (!author || !gender || !title) {
        throw new HTTPError(400, "All strings must be not empty")
    }

    if (!bookGenders.includes(gender as BookGender)) {
        throw new HTTPError(400, "Book gender must be a valid category")
    }

    return {
        author,
        gender: gender as BookGender,
        title
    }
}

interface GetQueryParams {
    gender: string;
    orderBy: string;
}


function parseGetQueryParams(query: Partial<GetQueryParams> | undefined) {
    const params: Partial<GetQueryParams> = {}
    if (query) {
        if (query?.gender && bookGenders.includes(query.gender as BookGender)) {
            params.gender = query.gender as BookGender;
        }
        else if (query?.orderBy && query.orderBy === "bestRated") {
            params.orderBy = query.orderBy;
        }
    }

    return params
}

export class BookController {
    static async getAll(req: Request, res: Response<Omit<Book, "evaluations">[]>, next: NextFunction) {
        try {
            const filters = parseGetQueryParams(req.params);

            const repo = AppDataSource.getRepository(Book);
            const books = await repo.find({
                where: {
                    ...(filters.gender ? { gender: filters.gender as BookGender } : {})
                },
                relations: {
                    registeredBy: true
                }
            })

            return res.status(200).json(books);

        } catch (err) {
            return next(err);
        }
    }

    static async createBook(req: Request, res: Response<Omit<Book, "registeredBy" | "evaluations">>, next: NextFunction) {
        try {
            const payload = parseCreateBody(req.body);

            const repo = AppDataSource.getRepository(Book);
            const loggedUser = (req as any).user as User;

            const newBook = repo.create({
                registeredBy: loggedUser,
                ...payload
            })

            const { evaluations: _, registeredBy: __, ...safeBook } = await repo.save(newBook)

            return res.status(201).json(safeBook);

        } catch (err) {
            return next(err);
        }
    }
}