import { Router } from 'express';
import { autenticar, somenteAdmin } from '../../middlewares/authMiddleware.js';
import { listarEstabelecimentos, buscarEstabelecimentoPorId } from './estabelecimentoController.js';

const router = Router();
router.use(autenticar, somenteAdmin);
router.get('/', listarEstabelecimentos);
router.get('/:id', buscarEstabelecimentoPorId);
export default router;
