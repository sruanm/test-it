import { Router } from "express";
import { EventController } from "../controllers/event.controller";

export const eventRouter = Router()

eventRouter.get("/", EventController.listEvents);
eventRouter.post("/", EventController.createEvent);
eventRouter.get("/:id/confirmations", EventController.listEventConfirmations);
eventRouter.post("/:id/confirmations", EventController.createConfirmation);
eventRouter.delete("/:id/confirmations/:confId", EventController.cancelConfirmation)