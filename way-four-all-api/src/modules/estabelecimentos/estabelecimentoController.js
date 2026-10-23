import pool from '../../config/database.js';
import { falha, sucesso } from '../../utils/response.js';
import { validarId, paginacao } from '../../utils/validation.js';
import { validarEstabelecimento, salvarEstabelecimento } from './estabelecimentoService.js';
const campoTextoValido = valor => typeof valor === 'string' && valor.trim().length > 0;

async function salvar(request, response, next, atualizar) {
  let client;
  try {
    const id = atualizar ? validarId(request.params.id) : null;
    const dados = validarEstabelecimento(request.body, false, true);
    if (!atualizar) dados.status ??= 'aprovado';
    client = await pool.connect();
    await client.query('BEGIN');
    const estabelecimento = await salvarEstabelecimento(client, dados, id);
    await client.query('COMMIT');
    return sucesso(response, { status: atualizar ? 200 : 201, dados: estabelecimento });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    next(error);
  } finally { client?.release(); }
}
export const criarEstabelecimento = (req, res, next) => salvar(req, res, next, false);
export const atualizarEstabelecimento = (req, res, next) => salvar(req, res, next, true);

export async function listarEstabelecimentos(
  request,
  response,
  next,
) {
  try {
    const {
      busca,
      cidade,
      estado,
      categoriaId,
      recursoId,
      pagina = "1",
      limite = "10",
    } = request.query;

    const { pagina: paginaNumero, limite: limiteNumero, offset } = paginacao({ pagina, limite });

    const valores = [];
    const condicoes = request.usuario?.perfil === 'admin' ? [] : ["e.status = 'aprovado'"];

    if (campoTextoValido(busca)) {
      valores.push(`%${busca.trim()}%`);

      condicoes.push(`
        (
          e.nome ILIKE $${valores.length}
          OR e.bairro ILIKE $${valores.length}
          OR e.cidade ILIKE $${valores.length}
        )
      `);
    }

    if (campoTextoValido(cidade)) {
      valores.push(`%${cidade.trim()}%`);

      condicoes.push(
        `e.cidade ILIKE $${valores.length}`,
      );
    }

    if (campoTextoValido(estado)) {
      valores.push(estado.trim().toUpperCase());

      condicoes.push(
        `e.estado = $${valores.length}`,
      );
    }

    if (
      categoriaId !== undefined &&
      categoriaId !== ""
    ) {
      const categoriaNumero = validarId(
        categoriaId,
        "ID da categoria",
      );

      valores.push(categoriaNumero);

      condicoes.push(
        `e.categoria_id = $${valores.length}`,
      );
    }

    if (
      recursoId !== undefined &&
      recursoId !== ""
    ) {
      const recursoNumero = validarId(
        recursoId,
        "ID do recurso",
      );

      valores.push(recursoNumero);

      condicoes.push(`
        EXISTS (
          SELECT 1
          FROM estabelecimento_recursos filtro_er
          WHERE
            filtro_er.estabelecimento_id = e.id
            AND filtro_er.recurso_id = $${valores.length}
            AND filtro_er.disponivel = TRUE
        )
      `);
    }

    const where =
      condicoes.length > 0
        ? `WHERE ${condicoes.join(" AND ")}`
        : "";

    valores.push(limiteNumero);
    const parametroLimite = `$${valores.length}`;

    valores.push(offset);
    const parametroOffset = `$${valores.length}`;

    const resultado = await pool.query(
      `
        SELECT
          e.id,
          e.nome,
          e.descricao,
          e.telefone,
          e.site,
          e.cep,
          e.logradouro,
          e.numero,
          e.bairro,
          e.cidade,
          e.estado,
          e.latitude,
          e.longitude,
          e.status,
          e.verificado,
          c.nome AS categoria,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', r.id,
                'nome', r.nome,
                'tipo', r.tipo,
                'verificado', er.verificado
              )
              ORDER BY r.nome
            ) FILTER (
              WHERE r.id IS NOT NULL
            ),
            '[]'::json
          ) AS recursos

        FROM estabelecimentos e

        LEFT JOIN categorias c
          ON c.id = e.categoria_id

        LEFT JOIN estabelecimento_recursos er
          ON er.estabelecimento_id = e.id
          AND er.disponivel = TRUE

        LEFT JOIN recursos_acessibilidade r
          ON r.id = er.recurso_id

        ${where}

        GROUP BY e.id, c.nome
        ORDER BY e.nome

        LIMIT ${parametroLimite}
        OFFSET ${parametroOffset}
      `,
      valores,
    );

    return sucesso(response, {
      mensagem: "Estabelecimentos encontrados",
      dados: resultado.rows,
      meta: {
        pagina: paginaNumero,
        limite: limiteNumero,
        quantidade: resultado.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function buscarEstabelecimentoPorId(
  request,
  response,
  next,
) {
  try {
    const id = validarId(
      request.params.id,
      "ID do estabelecimento",
    );

    const resultado = await pool.query(
      `
        SELECT
          e.id,
          e.nome,
          e.descricao,
          e.categoria_id AS "categoriaId",
          e.telefone,
          e.site,
          e.cep,
          e.logradouro,
          e.numero,
          e.complemento,
          e.bairro,
          e.cidade,
          e.estado,
          e.latitude,
          e.longitude,
          e.status,
          e.verificado,
          e.criado_em AS "criadoEm",
          e.atualizado_em AS "atualizadoEm",

          CASE
            WHEN c.id IS NULL THEN NULL
            ELSE JSON_BUILD_OBJECT(
              'id', c.id,
              'nome', c.nome
            )
          END AS categoria,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', r.id,
                'nome', r.nome,
                'descricao', r.descricao,
                'tipo', r.tipo,
                'observacao', er.observacao,
                'verificado', er.verificado
              )
              ORDER BY r.nome
            ) FILTER (
              WHERE r.id IS NOT NULL
            ),
            '[]'::json
          ) AS recursos

        FROM estabelecimentos e

        LEFT JOIN categorias c
          ON c.id = e.categoria_id

        LEFT JOIN estabelecimento_recursos er
          ON er.estabelecimento_id = e.id
          AND er.disponivel = TRUE

        LEFT JOIN recursos_acessibilidade r
          ON r.id = er.recurso_id

        WHERE e.id = $1 AND ($2::boolean OR e.status = 'aprovado')

        GROUP BY
          e.id,
          c.id,
          c.nome
      `,
      [id, request.usuario?.perfil === 'admin'],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Estabelecimento não encontrado",
      });
    }

    return sucesso(response, {
      mensagem: "Estabelecimento encontrado",
      dados: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function excluirEstabelecimento(
  request,
  response,
  next,
) {
  try {
    const id = validarId(
      request.params.id,
      "ID do estabelecimento",
    );

    const resultado = await pool.query(
      `
        DELETE FROM estabelecimentos
        WHERE id = $1
        RETURNING id, nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return falha(response, {
        status: 404,
        mensagem: "Estabelecimento não encontrado",
      });
    }

    return sucesso(response, {
      mensagem:
        "Estabelecimento excluído com sucesso",
      dados: resultado.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return falha(response, {
        status: 409,
        mensagem:
          "Não é possível excluir este estabelecimento porque existem registros vinculados a ele",
      });
    }

    next(error);
  }
}
