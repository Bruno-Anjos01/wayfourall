import { validarId } from '../../utils/validation.js';
import { validarEstabelecimento, salvarEstabelecimento } from '../estabelecimentos/estabelecimentoService.js';
import { texto, erroHttp } from '../../utils/validation.js';
import pool from "../../config/database.js";



export async function listarSolicitacoes(
  request,
  response,
  next,
) {
  try {
    const { status, tipo } = request.query;

    const valores = [];
    const condicoes = [];

    if (status) {
      valores.push(status);
      condicoes.push(`s.status = $${valores.length}`);
    }

    if (tipo) {
      valores.push(tipo);
      condicoes.push(`s.tipo = $${valores.length}`);
    }

    const where =
      condicoes.length > 0
        ? `WHERE ${condicoes.join(" AND ")}`
        : "";

    const resultado = await pool.query(
      `
        SELECT
          s.id,
          s.tipo,
          s.status,
          s.motivo,
          s.dados_propostos,
          s.resposta_admin,
          s.criado_em,
          s.analisado_em,
          u.id AS usuario_id,
          u.nome AS usuario,
          u.email AS usuario_email,
          e.id AS estabelecimento_id,
          e.nome AS estabelecimento
        FROM solicitacoes_estabelecimentos s
        INNER JOIN usuarios u
          ON u.id = s.usuario_id
        LEFT JOIN estabelecimentos e
          ON e.id = s.estabelecimento_id
        ${where}
        ORDER BY
          CASE WHEN s.status = 'pendente' THEN 0 ELSE 1 END,
          s.criado_em DESC
      `,
      valores,
    );

    return response.status(200).json({
      quantidade: resultado.rows.length,
      solicitacoes: resultado.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarSolicitacaoPorId(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        SELECT
          s.*,
          u.nome AS usuario,
          u.email AS usuario_email,
          e.nome AS estabelecimento,
          admin.nome AS administrador
        FROM solicitacoes_estabelecimentos s
        INNER JOIN usuarios u
          ON u.id = s.usuario_id
        LEFT JOIN estabelecimentos e
          ON e.id = s.estabelecimento_id
        LEFT JOIN usuarios admin
          ON admin.id = s.analisado_por
        WHERE s.id = $1
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Solicitação não encontrada",
      });
    }

    return response.status(200).json(resultado.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function aprovarSolicitacao(
  request,
  response,
  next,
) {
  const id = validarId(request.params.id);
  const administradorId = request.usuario.id;
  const respostaAdmin = texto(request.body.respostaAdmin, 'Resposta', 5000);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const consulta = await client.query(
      `
        SELECT *
        FROM solicitacoes_estabelecimentos
        WHERE id = $1
        FOR UPDATE
      `,
      [id],
    );

    if (consulta.rows.length === 0) {
      await client.query("ROLLBACK");

      return response.status(404).json({
        erro: "Solicitação não encontrada",
      });
    }

    const solicitacao = consulta.rows[0];

    if (solicitacao.status !== "pendente") {
      await client.query("ROLLBACK");

      return response.status(409).json({
        erro: "Esta solicitação já foi analisada",
      });
    }

    if (solicitacao.tipo === 'exclusao') {
      const removido = await client.query('DELETE FROM estabelecimentos WHERE id = $1 RETURNING id', [solicitacao.estabelecimento_id]);
      if (!removido.rows.length) throw erroHttp(409, 'Estabelecimento já removido');
    } else {
      if (solicitacao.tipo === 'revisao' && !solicitacao.estabelecimento_id) throw erroHttp(409, 'Estabelecimento já removido');
      const dados = validarEstabelecimento(solicitacao.dados_propostos, solicitacao.tipo === 'revisao');
      if (solicitacao.tipo === 'adicao') dados.status = 'aprovado';
      await salvarEstabelecimento(client, dados, solicitacao.tipo === 'revisao' ? solicitacao.estabelecimento_id : null);
    }

    const resultado = await client.query(
      `
        UPDATE solicitacoes_estabelecimentos
        SET
          status = 'aprovada',
          resposta_admin = $1,
          analisado_por = $2,
          analisado_em = CURRENT_TIMESTAMP,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
      [
        respostaAdmin?.trim() || "Solicitação aprovada",
        administradorId,
        id,
      ],
    );

    await client.query("COMMIT");

    return response.status(200).json({
      mensagem: "Solicitação aprovada com sucesso",
      solicitacao: resultado.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function rejeitarSolicitacao(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);
    const administradorId = request.usuario.id;
    const { respostaAdmin } = request.body;

    if (
      typeof respostaAdmin !== "string" ||
      respostaAdmin.trim().length < 5
    ) {
      return response.status(400).json({
        erro: "Informe o motivo da rejeição",
      });
    }

    const resultado = await pool.query(
      `
        UPDATE solicitacoes_estabelecimentos
        SET
          status = 'rejeitada',
          resposta_admin = $1,
          analisado_por = $2,
          analisado_em = CURRENT_TIMESTAMP,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $3
          AND status = 'pendente'
        RETURNING *
      `,
      [
        respostaAdmin.trim(),
        administradorId,
        id,
      ],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Solicitação pendente não encontrada",
      });
    }

    return response.status(200).json({
      mensagem: "Solicitação rejeitada",
      solicitacao: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
