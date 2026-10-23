import { Router } from 'express';
import { autenticar, somenteAdmin } from '../middlewares/authMiddleware.js';
import { criarAvaliacao, excluirAvaliacao, listarAvaliacoes, listarPendentes, moderarAvaliacao } from './avaliacoesController.js';

const router = Router();
router.get('/estabelecimentos/:estabelecimentoId', listarAvaliacoes);
router.get('/pendentes', autenticar, somenteAdmin, listarPendentes);
router.post('/', autenticar, criarAvaliacao);
router.patch('/:id/moderar', autenticar, somenteAdmin, moderarAvaliacao);
router.delete('/:id', autenticar, excluirAvaliacao);
export default router;
