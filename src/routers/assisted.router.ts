import { Router } from "express";
import { AssistedController } from "../controllers/assisted.controller";

export const assistedRouter = Router()

assistedRouter.get("/", AssistedController.getAll);
assistedRouter.post("/", AssistedController.register);
assistedRouter.post("/:id/benefits", AssistedController.addBenefit)
assistedRouter.delete("/:id/benefits/:benefitId", AssistedController.removeBenefit)