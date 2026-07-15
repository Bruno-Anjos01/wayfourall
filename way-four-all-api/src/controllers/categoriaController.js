import pool from "../config/database.js";

export async function listarCategorias(request, response, next) {
  try {
    const resultado = await pool.query(`
      SELECT id, nome
      FROM categorias
      ORDER BY nome
    `);

    return response.status(200).json({
      quantidade: resultado.rows.length,
      categorias: resultado.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarCategoriaPorId(request, response, next) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.status(400).json({
        erro: "ID da categoria inválido",
      });
    }

    const resultado = await pool.query(
      `
        SELECT id, nome
        FROM categorias
        WHERE id = $1
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Categoria não encontrada",
      });
    }

    return response.status(200).json(resultado.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function criarCategoria(request, response, next) {
  try {
    const { nome } = request.body;

    if (!nome || nome.trim().length < 2) {
      return response.status(400).json({
        erro: "Informe um nome válido para a categoria",
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

    return response.status(201).json({
      mensagem: "Categoria cadastrada com sucesso",
      categoria: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        erro: "Essa categoria já está cadastrada",
      });
    }

    next(error);
  }
}

export async function atualizarCategoria(request, response, next) {
  try {
    const id = Number(request.params.id);
    const { nome } = request.body;

    if (!Number.isInteger(id) || id <= 0) {
      return response.status(400).json({
        erro: "ID da categoria inválido",
      });
    }

    if (!nome || nome.trim().length < 2) {
      return response.status(400).json({
        erro: "Informe um nome válido",
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
      return response.status(404).json({
        erro: "Categoria não encontrada",
      });
    }

    return response.status(200).json({
      mensagem: "Categoria atualizada com sucesso",
      categoria: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        erro: "Já existe uma categoria com esse nome",
      });
    }

    next(error);
  }
}

export async function excluirCategoria(request, response, next) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.status(400).json({
        erro: "ID da categoria inválido",
      });
    }

    const resultado = await pool.query(
      `
        DELETE FROM categorias
        WHERE id = $1
        RETURNING id, nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Categoria não encontrada",
      });
    }

    return response.status(200).json({
      mensagem: "Categoria excluída com sucesso",
      categoria: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return response.status(409).json({
        erro: "Não é possível excluir esta categoria porque ela está sendo utilizada por um estabelecimento",
      });
    }

    next(error);
  }
}