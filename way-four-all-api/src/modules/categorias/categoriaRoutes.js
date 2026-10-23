import { Router } from "express";

import {
  atualizarCategoria,
  buscarCategoriaPorId,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "./categoriaController.js";

import {
  autenticar,
  somenteAdmin,
} from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listarCategorias);
router.get("/:id", buscarCategoriaPorId);

router.post(
  "/",
  autenticar,
  somenteAdmin,
  criarCategoria,
);

router.put(
  "/:id",
  autenticar,
  somenteAdmin,
  atualizarCategoria,
);

router.delete(
  "/:id",
  autenticar,
  somenteAdmin,
  excluirCategoria,
);

export default router;
