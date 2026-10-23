import { criarLimiteLogin } from '../../middlewares/loginLimit.js';
import { autenticar } from '../../middlewares/authMiddleware.js';
import { Router } from "express";

import {
  cadastrarUsuario,
  login,
  obterUsuario,
} from "./authController.js";

const router = Router();

const limite = criarLimiteLogin();
router.post("/cadastro", limite, cadastrarUsuario);
router.post("/login", limite, login);

router.get('/me', autenticar, obterUsuario);

export default router;