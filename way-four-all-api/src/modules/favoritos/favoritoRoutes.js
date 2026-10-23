import { Router } from 'express';
import pool from '../../config/database.js';
import { autenticar } from '../../middlewares/authMiddleware.js';
import { erroHttp, validarId, paginacao } from '../../utils/validation.js';
import { sucesso } from '../../utils/response.js';

const router = Router();
router.use(autenticar);
router.get('/', async (request, response) => {
  const { pagina, limite, offset } = paginacao(request.query);
  const resultado = await pool.query(`SELECT e.* FROM favoritos f JOIN estabelecimentos e ON e.id = f.estabelecimento_id
    WHERE f.usuario_id = $1 AND e.status = 'aprovado' ORDER BY f.criado_em DESC, e.id LIMIT $2 OFFSET $3`,
  [request.usuario.id, limite, offset]);
  return sucesso(response, { dados: resultado.rows, meta: { pagina, limite } });
});
router.put('/:estabelecimentoId', async (request, response) => {
  const id = validarId(request.params.estabelecimentoId);
  const resultado = await pool.query(`INSERT INTO favoritos (usuario_id, estabelecimento_id)
    SELECT $1, id FROM estabelecimentos WHERE id = $2 AND status = 'aprovado'
    ON CONFLICT (usuario_id, estabelecimento_id) DO UPDATE SET usuario_id = EXCLUDED.usuario_id RETURNING *`, [request.usuario.id, id]);
  if (!resultado.rows.length) throw erroHttp(404, 'Estabelecimento não encontrado');
  return sucesso(response, { dados: resultado.rows[0] });
});
router.delete('/:estabelecimentoId', async (request, response) => {
  const id = validarId(request.params.estabelecimentoId);
  await pool.query('DELETE FROM favoritos WHERE usuario_id = $1 AND estabelecimento_id = $2', [request.usuario.id, id]);
  return response.status(204).end();
});
export default router;
