import { Router } from "express";

import {
  buscarMinhaSolicitacaoPorId,
  cancelarMinhaSolicitacao,
  criarSolicitacao,
  listarMinhasSolicitacoes,
} from "./solicitacaoController.js";

import { autenticar } from "../../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar);

router.post("/", criarSolicitacao);
router.get("/minhassolicitacoes", listarMinhasSolicitacoes);
router.get("/minhassolicitacoes/:id", buscarMinhaSolicitacaoPorId);
router.patch("/minhassolicitacoes/:id/cancelar", cancelarMinhaSolicitacao);

export default router;
