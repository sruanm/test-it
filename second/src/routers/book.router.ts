import { Router } from "express";
import { BookController } from "../controllers/book.controller";

export const bookRouter = Router()

bookRouter.get("/", BookController.getAll)
bookRouter.post("/", BookController.createBook)
bookRouter.get("/:id/evaluations", BookController.getAllBookEvaluations)
bookRouter.post("/:id/evaluations", BookController.createEvaluation)
bookRouter.delete("/:id/evaluations/:evaluationId", BookController.deleteEvaluation)