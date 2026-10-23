import { validarId } from '../../utils/validation.js';
import pool from "../../config/database.js";

import {
  falha,
  sucesso,
} from "../../utils/response.js";



function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length >= 2 && nome.trim().length <= 100;
}

export async function listarCategorias(
  request,
  response,
  next,
) {
  try {
    const resultado = await pool.query(`
      SELECT id, nome
      FROM categorias
      ORDER BY nome
    `);

    return sucesso(response, {
      mensagem: "Categorias encontradas",
      dados: resultado.rows,
      meta: {
        quantidade: resultado.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarCategoriaPorId(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        SELECT id, nome
        FROM categorias
        WHERE id = $1
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Categoria não encontrada",
      });
    }

    return sucesso(response, {
      mensagem: "Categoria encontrada",
      dados: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function criarCategoria(
  request,
  response,
  next,
) {
  try {
    const { nome } = request.body;

    if (!validarNome(nome)) {
      return falha(response, {
        status: 400,
        mensagem: "Informe um nome válido para a categoria",
      });
    }

    const resultado = await pool.query(
      `
        INSERT INTO categorias (nome)
        VALUES ($1)
        RETURNING id, nome
      `,
      [nome.trim()],
    );

    return sucesso(response, {
      status: 201,
      mensagem: "Categoria cadastrada com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return falha(response, {
        status: 409,
        mensagem: "Essa categoria já está cadastrada",
      });
    }

    next(error);
  }
}

export async function atualizarCategoria(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);
    const { nome } = request.body;

    if (!validarNome(nome)) {
      return falha(response, {
        status: 400,
        mensagem: "Informe um nome válido para a categoria",
      });
    }

    const resultado = await pool.query(
      `
        UPDATE categorias
        SET nome = $1
        WHERE id = $2
        RETURNING id, nome
      `,
      [nome.trim(), id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Categoria não encontrada",
      });
    }

    return sucesso(response, {
      mensagem: "Categoria atualizada com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return falha(response, {
        status: 409,
        mensagem: "Já existe uma categoria com esse nome",
      });
    }

    next(error);
  }
}

export async function excluirCategoria(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        DELETE FROM categorias
        WHERE id = $1
        RETURNING id, nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Categoria não encontrada",
      });
    }

    return sucesso(response, {
      mensagem: "Categoria excluída com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return falha(response, {
        status: 409,
        mensagem:
          "Não é possível excluir esta categoria porque ela está sendo utilizada por um estabelecimento",
      });
    }

    next(error);
  }
}
