import { validarId } from '../../utils/validation.js';
import pool from "../../config/database.js";

import {
  falha,
  sucesso,
} from "../../utils/response.js";

const TIPOS_PERMITIDOS = [
  "fisica",
  "visual",
  "auditiva",
  "intelectual",
  "sensorial",
  "comunicacional",
];



function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length >= 2 && nome.trim().length <= 150;
}

function normalizarTipo(tipo) {
  if (typeof tipo !== "string" || !tipo.trim()) {
    return null;
  }

  return tipo.trim().toLowerCase();
}

function validarDescricao(descricao) {
  return (
    descricao === undefined ||
    descricao === null ||
    typeof descricao === "string"
  );
}

export async function listarRecursos(
  request,
  response,
  next,
) {
  try {
    const { tipo } = request.query;

    const valores = [];
    let filtro = "";

    if (tipo !== undefined) {
      const tipoNormalizado = normalizarTipo(tipo);

      if (
        !tipoNormalizado ||
        !TIPOS_PERMITIDOS.includes(tipoNormalizado)
      ) {
        return falha(response, {
          status: 400,
          mensagem: "Tipo de acessibilidade inválido",
          detalhes: {
            tiposPermitidos: TIPOS_PERMITIDOS,
          },
        });
      }

      valores.push(tipoNormalizado);
      filtro = "WHERE tipo = $1";
    }

    const resultado = await pool.query(
      `
        SELECT id, nome, descricao, tipo
        FROM recursos_acessibilidade
        ${filtro}
        ORDER BY tipo, nome
      `,
      valores,
    );

    return sucesso(response, {
      mensagem: "Recursos de acessibilidade encontrados",
      dados: resultado.rows,
      meta: {
        quantidade: resultado.rows.length,
        filtroTipo: tipo
          ? tipo.trim().toLowerCase()
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarRecursoPorId(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        SELECT id, nome, descricao, tipo
        FROM recursos_acessibilidade
        WHERE id = $1
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Recurso de acessibilidade não encontrado",
      });
    }

    return sucesso(response, {
      mensagem: "Recurso de acessibilidade encontrado",
      dados: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function criarRecurso(
  request,
  response,
  next,
) {
  try {
    const { nome, descricao, tipo } = request.body;

    if (!validarNome(nome)) {
      return falha(response, {
        status: 400,
        mensagem: "Informe um nome válido para o recurso",
      });
    }

    if (!validarDescricao(descricao)) {
      return falha(response, {
        status: 400,
        mensagem: "A descrição deve ser um texto",
      });
    }

    const tipoNormalizado = normalizarTipo(tipo);

    if (!tipoNormalizado) {
      return falha(response, {
        status: 400,
        mensagem: "O tipo de acessibilidade é obrigatório",
      });
    }

    if (!TIPOS_PERMITIDOS.includes(tipoNormalizado)) {
      return falha(response, {
        status: 400,
        mensagem: "Tipo de acessibilidade inválido",
        detalhes: {
          tiposPermitidos: TIPOS_PERMITIDOS,
        },
      });
    }

    const resultado = await pool.query(
      `
        INSERT INTO recursos_acessibilidade (
          nome,
          descricao,
          tipo
        )
        VALUES ($1, $2, $3)
        RETURNING id, nome, descricao, tipo
      `,
      [
        nome.trim(),
        descricao?.trim() || null,
        tipoNormalizado,
      ],
    );

    return sucesso(response, {
      status: 201,
      mensagem: "Recurso cadastrado com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return falha(response, {
        status: 409,
        mensagem: "Esse recurso já está cadastrado",
      });
    }

    next(error);
  }
}

export async function atualizarRecurso(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);
    const { nome, descricao, tipo } = request.body;

    if (!validarNome(nome)) {
      return falha(response, {
        status: 400,
        mensagem: "Informe um nome válido para o recurso",
      });
    }

    if (!validarDescricao(descricao)) {
      return falha(response, {
        status: 400,
        mensagem: "A descrição deve ser um texto",
      });
    }

    const tipoNormalizado = normalizarTipo(tipo);

    if (!tipoNormalizado) {
      return falha(response, {
        status: 400,
        mensagem: "O tipo de acessibilidade é obrigatório",
      });
    }

    if (!TIPOS_PERMITIDOS.includes(tipoNormalizado)) {
      return falha(response, {
        status: 400,
        mensagem: "Tipo de acessibilidade inválido",
        detalhes: {
          tiposPermitidos: TIPOS_PERMITIDOS,
        },
      });
    }

    const resultado = await pool.query(
      `
        UPDATE recursos_acessibilidade
        SET
          nome = $1,
          descricao = $2,
          tipo = $3
        WHERE id = $4
        RETURNING id, nome, descricao, tipo
      `,
      [
        nome.trim(),
        descricao?.trim() || null,
        tipoNormalizado,
        id,
      ],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Recurso de acessibilidade não encontrado",
      });
    }

    return sucesso(response, {
      mensagem: "Recurso atualizado com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return falha(response, {
        status: 409,
        mensagem: "Já existe um recurso com esse nome",
      });
    }

    next(error);
  }
}

export async function excluirRecurso(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        DELETE FROM recursos_acessibilidade
        WHERE id = $1
        RETURNING id, nome, descricao, tipo
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Recurso de acessibilidade não encontrado",
      });
    }

    return sucesso(response, {
      mensagem: "Recurso excluído com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return falha(response, {
        status: 409,
        mensagem:
          "Não é possível excluir este recurso porque ele está vinculado a um estabelecimento",
      });
    }

    next(error);
  }
}
