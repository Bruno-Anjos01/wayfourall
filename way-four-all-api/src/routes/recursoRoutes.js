import { Router } from "express";

import {
  atualizarRecurso,
  buscarRecursoPorId,
  criarRecurso,
  excluirRecurso,
  listarRecursos,
} from "../controllers/recursoController.js";

const router = Router();

router.get("/", listarRecursos);
router.get("/:id", buscarRecursoPorId);
router.post("/", criarRecurso);
router.put("/:id", atualizarRecurso);
router.delete("/:id", excluirRecurso);

export default router;
