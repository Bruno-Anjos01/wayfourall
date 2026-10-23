import { validarId } from '../../utils/validation.js';
import { validarEstabelecimento } from '../estabelecimentos/estabelecimentoService.js';
import pool from "../../config/database.js";

const TIPOS_PERMITIDOS = ["adicao", "revisao", "exclusao"];



export async function criarSolicitacao(request, response, next) {
  try {
    const usuarioId = request.usuario.id;

    const {
      tipo,
      estabelecimentoId,
      dadosPropostos,
      motivo,
    } = request.body;

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      return response.status(400).json({
        erro: "Tipo de solicitação inválido",
        tiposPermitidos: TIPOS_PERMITIDOS,
      });
    }

    if (typeof motivo !== "string" || motivo.trim().length < 10) {
      return response.status(400).json({
        erro: "O motivo deve possuir pelo menos 10 caracteres",
      });
    }

    if (tipo === "adicao" && estabelecimentoId != null) {
      return response.status(400).json({
        erro: "Uma solicitação de adição não deve possuir estabelecimentoId",
      });
    }

    if (["revisao", "exclusao"].includes(tipo)) {
      const estabelecimentoNumero = Number(estabelecimentoId);

      if (
        !Number.isInteger(estabelecimentoNumero) ||
        estabelecimentoNumero <= 0
      ) {
        return response.status(400).json({
          erro: "Informe um estabelecimento válido",
        });
      }

      const estabelecimento = await pool.query(
        `
          SELECT id
          FROM estabelecimentos
          WHERE id = $1
        `,
        [estabelecimentoNumero],
      );

      if (estabelecimento.rows.length === 0) {
        return response.status(404).json({
          erro: "Estabelecimento não encontrado",
        });
      }
    }

    if (
      ["adicao", "revisao"].includes(tipo) &&
      (
        !dadosPropostos ||
        typeof dadosPropostos !== "object" ||
        Array.isArray(dadosPropostos)
      )
    ) {
      return response.status(400).json({
        erro: "Informe os dados propostos",
      });
    }

    const proposta = tipo === 'exclusao' ? null : validarEstabelecimento(dadosPropostos, tipo === 'revisao');

    const resultado = await pool.query(
      `
        INSERT INTO solicitacoes_estabelecimentos (
          usuario_id,
          estabelecimento_id,
          tipo,
          dados_propostos,
          motivo
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        usuarioId,
        estabelecimentoId ? Number(estabelecimentoId) : null,
        tipo,
        proposta,
        motivo.trim(),
      ],
    );

    return response.status(201).json({
      mensagem: "Solicitação enviada para análise",
      solicitacao: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function listarMinhasSolicitacoes(
  request,
  response,
  next,
) {
  try {
    const usuarioId = request.usuario.id;

    const resultado = await pool.query(
      `
        SELECT
          s.id,
          s.tipo,
          s.dados_propostos,
          s.motivo,
          s.status,
          s.resposta_admin,
          s.criado_em,
          s.analisado_em,
          e.id AS estabelecimento_id,
          e.nome AS estabelecimento
        FROM solicitacoes_estabelecimentos s
        LEFT JOIN estabelecimentos e
          ON e.id = s.estabelecimento_id
        WHERE s.usuario_id = $1
        ORDER BY s.criado_em DESC
      `,
      [usuarioId],
    );

    return response.status(200).json({
      quantidade: resultado.rows.length,
      solicitacoes: resultado.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarMinhaSolicitacaoPorId(
  request,
  response,
  next,
) {
  try {
    const usuarioId = request.usuario.id;
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        SELECT
          s.*,
          e.nome AS estabelecimento
        FROM solicitacoes_estabelecimentos s
        LEFT JOIN estabelecimentos e
          ON e.id = s.estabelecimento_id
        WHERE s.id = $1
          AND s.usuario_id = $2
      `,
      [id, usuarioId],
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

export async function cancelarMinhaSolicitacao(
  request,
  response,
  next,
) {
  try {
    const usuarioId = request.usuario.id;
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        UPDATE solicitacoes_estabelecimentos
        SET
          status = 'cancelada',
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
          AND usuario_id = $2
          AND status = 'pendente'
        RETURNING *
      `,
      [id, usuarioId],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Solicitação pendente não encontrada",
      });
    }

    return response.status(200).json({
      mensagem: "Solicitação cancelada com sucesso",
      solicitacao: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
