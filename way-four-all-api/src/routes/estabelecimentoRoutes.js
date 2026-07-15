import { Router } from "express";

import {
  criarEstabelecimento,
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  atualizarEstabelecimento,
  excluirEstabelecimento,
} from "../controllers/estabelecimentoController.js";

const router = Router();

router.get("/", listarEstabelecimentos);
router.get("/:id", buscarEstabelecimentoPorId);
router.post("/", criarEstabelecimento);
router.put("/:id", atualizarEstabelecimento);
router.delete("/:id", excluirEstabelecimento);

export default router;
