import { Router } from "express";
import { ProdutorController } from "../controllers/produtor.controller";
import { authMiddleware } from "../middlewares";

export const produtorRouter = Router()

produtorRouter.use(authMiddleware("tecnico"))

produtorRouter.post("/", ProdutorController.createProdutor);
produtorRouter.post("/:id/lotes", ProdutorController.createLote)