import pool from "../config/database.js";

const TIPOS_PERMITIDOS = [
  "fisica",
  "visual",
  "auditiva",
  "intelectual",
  "sensorial",
  "comunicacional",
];

function validarId(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    const error = new Error("ID do recurso inválido");
    error.statusCode = 400;
    throw error;
  }

  return numero;
}

function normalizarTipo(tipo) {
  if (typeof tipo !== "string" || !tipo.trim()) {
    return null;
  }

  return tipo.trim().toLowerCase();
}

export async function listarRecursos(request, response, next) {
  try {
    const { tipo } = request.query;

    const valores = [];
    let filtro = "";

    if (tipo) {
      const tipoNormalizado = normalizarTipo(tipo);

      if (!tipoNormalizado) {
        return response.status(400).json({
          erro: "Tipo de acessibilidade inválido",
        });
      }

      if (!TIPOS_PERMITIDOS.includes(tipoNormalizado)) {
        return response.status(400).json({
          erro: "Tipo de acessibilidade inválido",
          tiposPermitidos: TIPOS_PERMITIDOS,
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

    return response.status(200).json({
      quantidade: resultado.rows.length,
      recursos: resultado.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarRecursoPorId(request, response, next) {
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
      return response.status(404).json({
        erro: "Recurso de acessibilidade não encontrado",
      });
    }

    return response.status(200).json(resultado.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function criarRecurso(request, response, next) {
  try {
    const { nome, descricao, tipo } = request.body;

    if (typeof nome !== "string" || nome.trim().length < 2) {
      return response.status(400).json({
        erro: "Informe um nome válido para o recurso",
      });
    }

    const tipoNormalizado = normalizarTipo(tipo);

    if (!tipoNormalizado) {
      return response.status(400).json({
        erro: "Nome e tipo são obrigatórios",
      });
    }

    if (!TIPOS_PERMITIDOS.includes(tipoNormalizado)) {
      return response.status(400).json({
        erro: "Tipo de acessibilidade inválido",
        tiposPermitidos: TIPOS_PERMITIDOS,
      });
    }

    if (
      descricao !== undefined &&
      descricao !== null &&
      typeof descricao !== "string"
    ) {
      return response.status(400).json({
        erro: "A descrição deve ser um texto",
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

    return response.status(201).json({
      mensagem: "Recurso cadastrado com sucesso",
      recurso: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        erro: "Esse recurso já está cadastrado",
      });
    }

    next(error);
  }
}

export async function atualizarRecurso(request, response, next) {
  try {
    const id = validarId(request.params.id);
    const { nome, descricao, tipo } = request.body;

    if (typeof nome !== "string" || nome.trim().length < 2) {
      return response.status(400).json({
        erro: "Informe um nome válido para o recurso",
      });
    }

    const tipoNormalizado = normalizarTipo(tipo);

    if (!tipoNormalizado) {
      return response.status(400).json({
        erro: "Nome e tipo são obrigatórios",
      });
    }

    if (!TIPOS_PERMITIDOS.includes(tipoNormalizado)) {
      return response.status(400).json({
        erro: "Tipo de acessibilidade inválido",
        tiposPermitidos: TIPOS_PERMITIDOS,
      });
    }

    if (
      descricao !== undefined &&
      descricao !== null &&
      typeof descricao !== "string"
    ) {
      return response.status(400).json({
        erro: "A descrição deve ser um texto",
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
      return response.status(404).json({
        erro: "Recurso de acessibilidade não encontrado",
      });
    }

    return response.status(200).json({
      mensagem: "Recurso atualizado com sucesso",
      recurso: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        erro: "Já existe um recurso com esse nome",
      });
    }

    next(error);
  }
}

export async function excluirRecurso(request, response, next) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        DELETE FROM recursos_acessibilidade
        WHERE id = $1
        RETURNING id, nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Recurso de acessibilidade não encontrado",
      });
    }

    return response.status(200).json({
      mensagem: "Recurso excluído com sucesso",
      recurso: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return response.status(409).json({
        erro: "Não é possível excluir este recurso porque ele está vinculado a um estabelecimento",
      });
    }

    next(error);
  }
}
