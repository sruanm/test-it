import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors";
import { Book, BookGender, User } from "../models/entities";
import { AppDataSource } from "../data-source";

type CreateBookReq = Omit<Book, "id" | "registeredBy" | "evaluations">

function parseCreateBody(body: Partial<CreateBookReq> | undefined) {
    if (body && typeof body?.author === "string" && typeof body?.gender === "string" && typeof body?.title === "string") {
        throw new HTTPError(400, "All body params must be sent")
    }

    const [author, gender, title] = [body?.author?.trim(), body?.gender?.trim(), body?.title?.trim()]

    if (!author || !gender || !title) {
        throw new HTTPError(400, "All strings must be not empty")
    }

    const genders: BookGender[] = ["fic", "bio", "tec", "child"]

    if (!genders.includes(gender as BookGender)) {
        throw new HTTPError(400, "Book gender must be a valid category")
    }

    return {
        author,
        gender: gender as BookGender,
        title
    }
}

export class BookController {
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