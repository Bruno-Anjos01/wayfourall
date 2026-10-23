import pool from '../config/database.js';
import { erroHttp, validarId, texto, paginacao } from '../utils/validation.js';
import { sucesso } from '../utils/response.js';

export async function listarAvaliacoes(request, response) {
  const id = validarId(request.params.estabelecimentoId);
  const { pagina, limite, offset } = paginacao(request.query);
  const resultado = await pool.query(`
    SELECT a.id, a.nota, a.comentario, a.criado_em, u.nome AS usuario
    FROM avaliacoes a JOIN usuarios u ON u.id = a.usuario_id
    JOIN estabelecimentos e ON e.id = a.estabelecimento_id
    WHERE a.estabelecimento_id = $1 AND a.status = 'aprovada' AND e.status = 'aprovado'
    ORDER BY a.criado_em DESC, a.id DESC LIMIT $2 OFFSET $3`, [id, limite, offset]);
  return sucesso(response, { dados: resultado.rows, meta: { pagina, limite } });
}

export async function criarAvaliacao(request, response) {
  const estabelecimentoId = validarId(request.body.estabelecimentoId);
  const { nota } = request.body;
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw erroHttp(400, 'Nota deve ser um inteiro entre 1 e 5');
  const comentario = texto(request.body.comentario, 'Comentário', 5000);
  const resultado = await pool.query(`
    INSERT INTO avaliacoes (usuario_id, estabelecimento_id, nota, comentario)
    SELECT $1, id, $3, $4 FROM estabelecimentos WHERE id = $2 AND status = 'aprovado'
    RETURNING *`, [request.usuario.id, estabelecimentoId, nota, comentario]);
  if (!resultado.rows.length) throw erroHttp(404, 'Estabelecimento não encontrado');
  return sucesso(response, { status: 201, mensagem: 'Avaliação enviada para moderação', dados: resultado.rows[0] });
}

export async function excluirAvaliacao(request, response) {
  const id = validarId(request.params.id);
  const resultado = await pool.query(`DELETE FROM avaliacoes WHERE id = $1
    AND (usuario_id = $2 OR $3 = 'admin') RETURNING id`, [id, request.usuario.id, request.usuario.perfil]);
  if (!resultado.rows.length) throw erroHttp(404, 'Avaliação não encontrada');
  return sucesso(response, { dados: resultado.rows[0] });
}

export async function listarPendentes(request, response) {
  const { pagina, limite, offset } = paginacao(request.query);
  const resultado = await pool.query("SELECT * FROM avaliacoes WHERE status = 'pendente' ORDER BY id LIMIT $1 OFFSET $2", [limite, offset]);
  return sucesso(response, { dados: resultado.rows, meta: { pagina, limite } });
}

export async function moderarAvaliacao(request, response) {
  const id = validarId(request.params.id);
  const { status } = request.body;
  if (!['aprovada', 'rejeitada'].includes(status)) throw erroHttp(400, 'Status inválido');
  const resultado = await pool.query("UPDATE avaliacoes SET status = $1 WHERE id = $2 AND status = 'pendente' RETURNING *", [status, id]);
  if (!resultado.rows.length) throw erroHttp(409, 'Avaliação inexistente ou já moderada');
  return sucesso(response, { dados: resultado.rows[0] });
}
