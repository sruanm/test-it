import { Router } from "express";
import { OpportunityController } from "../controllers/opportunity.controller";

const opportunityRouter = Router()

opportunityRouter.get("/", OpportunityController.getAllOpportunities);
opportunityRouter.post("/", OpportunityController.createOpportunity);
opportunityRouter.get("/:id/submissions", OpportunityController.getAllSubmissions)
opportunityRouter.post("/:id/submissions", OpportunityController.makeSubmission)
opportunityRouter.delete("/:id/submissions", OpportunityController.cancelSubmission)