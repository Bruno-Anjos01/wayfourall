import { Router } from "express";

import {
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  criarEstabelecimento,
  atualizarEstabelecimento,
  excluirEstabelecimento,
} from "./estabelecimentoController.js";

import {
  autenticar,
  somenteAdmin,
} from "../../middlewares/authMiddleware.js";

const router = Router();

// Públicas
router.get("/", listarEstabelecimentos);
router.get("/:id", buscarEstabelecimentoPorId);

// Apenas administrador
router.post(
  "/",
  autenticar,
  somenteAdmin,
  criarEstabelecimento,
);

router.put(
  "/:id",
  autenticar,
  somenteAdmin,
  atualizarEstabelecimento,
);

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  excluirEstabelecimento,
);

export default router;
