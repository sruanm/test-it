import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors";
import { Book, BookGender, Evaluation, User } from "../models/entities";
import { AppDataSource } from "../data-source";

type CreateBookReq = Omit<Book, "id" | "registeredBy" | "evaluations">

const bookGenders: BookGender[] = ["fic", "bio", "tec", "child"]

function parseIntIdParam(rawId: string | undefined) {
    if (!rawId) {
        throw new HTTPError(500, "Server routes misconfiguration")
    }

    const id = parseInt(rawId)

    if (Number.isNaN(id)) {
        throw new HTTPError(404, "Book not found")
    }

    return id;
}


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

function getBookById(id: number) {
    const repo = AppDataSource.getRepository(Book);
    return repo.findOneBy({ id })
}

async function getBookByIdAndThrowsNotFound(id: number) {
    const book = await getBookById(id)

    if (!book) {
        throw new HTTPError(404, "Book not found")
    }

    return book
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

    static async getAllBookEvaluations(req: Request, res: Response<Omit<Evaluation, "book">[]>, next: NextFunction) {
        try {
            const id = parseIntIdParam(req.params["id"]);

            const book = await getBookByIdAndThrowsNotFound(id)

            const evaluationsRepo = AppDataSource.getRepository(Evaluation)
            const evaluations = await evaluationsRepo.find({
                where: {
                    book
                },
                select: ["id", "owner", "commentary", "hasLiked"]
            })

            return res.status(200).json(evaluations)

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

    static async createEvaluation(req: Request, res: Response<Omit<Evaluation, "owner" | "book">>, next: NextFunction) {
        try {
            const id = parseIntIdParam(req.params["id"]);
            const payload = parseCreateEvtBody(req.body);

            const book = await getBookByIdAndThrowsNotFound(id)

            const evaluationRepo = AppDataSource.getRepository(Evaluation);
            const newEvaluation = evaluationRepo.create({ book, ...payload })

            const { owner: _, book: __, ...safeEvaluation } = await evaluationRepo.save(newEvaluation)

            return res.status(201).json(safeEvaluation)
        } catch (err) {
            return next(err)
        }
    }

    static async deleteEvaluation(req: Request, res: Response, next: NextFunction) {
        try {


            const bookId = parseIntIdParam(req.params["id"]);
            const evaluationId = parseIntIdParam(req.params["evaluationId"]);


            const repo = AppDataSource.getRepository(Evaluation)
            const loggedUser = (req as any).user as User;

            const evaluation = await repo.findOneBy({
                id: evaluationId,
                owner: loggedUser,
                book: {
                    id: bookId
                },
            })

            if (!evaluation) {
                throw new HTTPError(404, "Evaluation not found")
            }

            await repo.delete(evaluation.id);

            return res.status(204);
        } catch (err) {
            return next(err)
        }
    }
}

type CreateEvaluationRequest = Omit<Evaluation, "id" | "owner" | "book">

function parseCreateEvtBody(body: Partial<CreateEvaluationRequest> | undefined) {
    if (!body) {
        throw new HTTPError(400, "A payload must be sent")
    }

    if ((body?.commentary && typeof body?.commentary !== "string") || typeof body.hasLiked !== "boolean") {
        throw new HTTPError(400, "All create data must be sent")
    }

    const commentary = body.commentary?.trim();

    if (!commentary) {
        throw new HTTPError(400, "Empty string not allowed on commentary")
    }

    return {
        commentary,
        hasLiked: body.hasLiked
    }
}