import { Router } from "express";

import { obterResumoDashboard } from "./dashboardController.js";

import {
  autenticar,
  somenteAdmin,
} from "../../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar, somenteAdmin);

router.get("/", obterResumoDashboard);

export default router;