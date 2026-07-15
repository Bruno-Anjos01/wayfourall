import pool from "../config/database.js";

function validarId(id) {
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    const error = new Error("ID inválido");
    error.statusCode = 400;
    throw error;
  }

  return numero;
}

export async function criarEstabelecimento(request, response, next) {
  const {
    nome,
    descricao,
    categoriaId,
    telefone,
    site,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    latitude,
    longitude,
    recursos = [],
  } = request.body;

  if (!nome || !logradouro || !cidade || !estado) {
    return response.status(400).json({
      erro: "Nome, logradouro, cidade e estado são obrigatórios",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const estabelecimentoResult = await client.query(
      `
        INSERT INTO estabelecimentos (
          nome,
          descricao,
          categoria_id,
          telefone,
          site,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          latitude,
          longitude
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING *
      `,
      [
        nome.trim(),
        descricao || null,
        categoriaId ?? null,
        telefone ?? null,
        site ?? null,
        cep || null,
        logradouro.trim(),
        numero || null,
        complemento || null,
        bairro || null,
        cidade.trim(),
        estado.trim().toUpperCase(),
        latitude ?? null,
        longitude ?? null,
      ],
    );

    const estabelecimento = estabelecimentoResult.rows[0];

    for (const recursoId of recursos) {
      await client.query(
        `
          INSERT INTO estabelecimento_recursos (
            estabelecimento_id,
            recurso_id
          )
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
        [estabelecimento.id, recursoId],
      );
    }

    await client.query("COMMIT");

    return response.status(201).json({
      mensagem: "Estabelecimento cadastrado com sucesso",
      estabelecimento,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

export async function listarEstabelecimentos(request, response, next) {
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

    const paginaNumero = Math.max(Number(pagina) || 1, 1);
    const limiteNumero = Math.min(Math.max(Number(limite) || 10, 1), 50);
    const offset = (paginaNumero - 1) * limiteNumero;

    const valores = [];
    const condicoes = [];

    if (busca) {
      valores.push(`%${busca}%`);

      condicoes.push(`
        (
          e.nome ILIKE $${valores.length}
          OR e.bairro ILIKE $${valores.length}
          OR e.cidade ILIKE $${valores.length}
        )
      `);
    }

    if (cidade) {
      valores.push(`%${cidade}%`);
      condicoes.push(`e.cidade ILIKE $${valores.length}`);
    }

    if (estado) {
      valores.push(estado.toUpperCase());
      condicoes.push(`e.estado = $${valores.length}`);
    }

    if (categoriaId) {
      valores.push(Number(categoriaId));
      condicoes.push(`e.categoria_id = $${valores.length}`);
    }

    if (recursoId) {
      valores.push(Number(recursoId));

      condicoes.push(`
        EXISTS (
          SELECT 1
          FROM estabelecimento_recursos filtro_er
          WHERE filtro_er.estabelecimento_id = e.id
            AND filtro_er.recurso_id = $${valores.length}
            AND filtro_er.disponivel = TRUE
        )
      `);
    }

    const where =
      condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";

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
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
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

    return response.status(200).json({
      pagina: paginaNumero,
      limite: limiteNumero,
      quantidade: resultado.rows.length,
      estabelecimentos: resultado.rows,
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
    const id = validarId(request.params.id);

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
          e.complemento,
          e.bairro,
          e.cidade,
          e.estado,
          e.latitude,
          e.longitude,
          e.status,
          e.verificado,
          e.criado_em,
          c.nome AS categoria,

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
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS recursos

        FROM estabelecimentos e

        LEFT JOIN categorias c
          ON c.id = e.categoria_id

        LEFT JOIN estabelecimento_recursos er
          ON er.estabelecimento_id = e.id
          AND er.disponivel = TRUE

        LEFT JOIN recursos_acessibilidade r
          ON r.id = er.recurso_id

        WHERE e.id = $1

        GROUP BY e.id, c.nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Estabelecimento não encontrado",
      });
    }

    return response.status(200).json(resultado.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function atualizarEstabelecimento(
  request,
  response,
  next,
) {
  try {
    const id = validarId(request.params.id);

    const {
      nome,
      descricao,
      categoriaId,
      telefone,
      site,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      latitude,
      longitude,
      status,
      verificado,
    } = request.body;

    if (!nome || !logradouro || !cidade || !estado) {
      return response.status(400).json({
        erro: "Nome, logradouro, cidade e estado são obrigatórios",
      });
    }

const verificadoNormalizado =
  verificado === undefined
    ? null
    : verificado === true || verificado === "true";

const resultado = await pool.query(
  `
    UPDATE estabelecimentos
    SET
      nome = $1,
      descricao = $2,
      categoria_id = $3,
      telefone = $4,
      site = $5,
      cep = $6,
      logradouro = $7,
      numero = $8,
      complemento = $9,
      bairro = $10,
      cidade = $11,
      estado = $12,
      latitude = $13,
      longitude = $14,
      status = COALESCE($15, status),
      verificado = COALESCE($16, verificado),
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = $17
    RETURNING *
  `,
  [
    nome.trim(),
    descricao ?? null,
    categoriaId ?? null,
    telefone ?? null,
    site ?? null,
    cep ?? null,
    logradouro.trim(),
    numero ?? null,
    complemento ?? null,
    bairro ?? null,
    cidade.trim(),
    estado.trim().toUpperCase(),
    latitude ?? null,
    longitude ?? null,
    status ?? null,
    verificadoNormalizado,
    id,
  ],
);

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Estabelecimento não encontrado",
      });
    }

    return response.status(200).json({
      mensagem: "Estabelecimento atualizado com sucesso",
      estabelecimento: resultado.rows[0],
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
    const id = validarId(request.params.id);

    const resultado = await pool.query(
      `
        DELETE FROM estabelecimentos
        WHERE id = $1
        RETURNING id, nome
      `,
      [id],
    );

    if (resultado.rows.length === 0) {
      return response.status(404).json({
        erro: "Estabelecimento não encontrado",
      });
    }

    return response.status(200).json({
      mensagem: "Estabelecimento excluído com sucesso",
      estabelecimento: resultado.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
