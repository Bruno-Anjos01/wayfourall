import { Router } from "express";

import {
  atualizarRecurso,
  buscarRecursoPorId,
  criarRecurso,
  excluirRecurso,
  listarRecursos,
} from "./recursoController.js";

import {
  autenticar,
  somenteAdmin,
} from "../../middlewares/authMiddleware.js";

const router = Router();

// Rotas públicas
router.get("/", listarRecursos);
router.get("/:id", buscarRecursoPorId);

// Rotas administrativas
router.post(
  "/",
  autenticar,
  somenteAdmin,
  criarRecurso,
);

router.put(
  "/:id",
  autenticar,
  somenteAdmin,
  atualizarRecurso,
);

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  excluirRecurso,
);

export default router;
