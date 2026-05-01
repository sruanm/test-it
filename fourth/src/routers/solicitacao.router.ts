import { Router } from "express";
import { SolicitacaoController } from "../controllers/solicitacao.controller";
import { authMiddleware } from "../middlewares";

export const produtorSolicitacaoRouter = Router();
export const tecnicoSolicitacaoRouter = Router();

produtorSolicitacaoRouter.use(authMiddleware("produtor"));
produtorSolicitacaoRouter.use(SolicitacaoController.createSolicitacao);

tecnicoSolicitacaoRouter.use(authMiddleware("tecnico"));
tecnicoSolicitacaoRouter.get("/", SolicitacaoController.getSolicitacoes);
tecnicoSolicitacaoRouter.put(
  "/:id/aprovar",
  SolicitacaoController.changeSolicitacaoStatus("aprovada"),
);
tecnicoSolicitacaoRouter.put(
  "/:id/negar",
  SolicitacaoController.changeSolicitacaoStatus("reprovada"),
);
