import { Router } from "express";

import {
  atualizarCategoria,
  buscarCategoriaPorId,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../controllers/categoriaController.js";

const router = Router();

router.get("/", listarCategorias);
router.get("/:id", buscarCategoriaPorId);
router.post("/", criarCategoria);
router.put("/:id", atualizarCategoria);
router.delete("/:id", excluirCategoria);

export default router;
