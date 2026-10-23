import { Router } from "express";

import {
  aprovarSolicitacao,
  buscarSolicitacaoPorId,
  listarSolicitacoes,
  rejeitarSolicitacao,
} from "./adminSolicitacaoController.js";

import {
  autenticar,
  somenteAdmin,
} from "../../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar, somenteAdmin);

router.get("/", listarSolicitacoes);
router.get("/:id", buscarSolicitacaoPorId);
router.patch("/:id/aprovar", aprovarSolicitacao);
router.patch("/:id/rejeitar", rejeitarSolicitacao);

export default router;
