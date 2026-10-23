import pool from "../../config/database.js";

export async function obterResumoDashboard(
  request,
  response,
  next,
) {
  try {
    const resultado = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios) AS usuarios,
        (SELECT COUNT(*) FROM estabelecimentos) AS estabelecimentos,
        (SELECT COUNT(*) FROM categorias) AS categorias,
        (SELECT COUNT(*) FROM avaliacoes) AS avaliacoes,
        (
          SELECT COUNT(*)
          FROM recursos_acessibilidade
        ) AS recursos
    `);

    const dados = resultado.rows[0];

    return response.status(200).json({
      usuarios: Number(dados.usuarios),
      estabelecimentos: Number(dados.estabelecimentos),
      categorias: Number(dados.categorias),
      recursos: Number(dados.recursos),
      avaliacoes: Number(dados.avaliacoes),
    });
  } catch (error) {
    next(error);
  }
}
