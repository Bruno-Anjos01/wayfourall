import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { salvarEstabelecimento } from '../src/modules/estabelecimentos/estabelecimentoService.js';

test('PostgreSQL: schema, migração, recursos, favoritos e exclusão com histórico', {
  skip: !process.env.TEST_DATABASE_URL,
}, async () => {
  const client = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `teste_${randomUUID().replaceAll('-', '')}`;
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await client.query(await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'));
    // Simula a instalação antiga sem esses módulos, somente no schema de teste.
    await client.query('DROP TABLE avaliacoes, favoritos');
    const migracao = await readFile(new URL('../database/migrations/001_concluir_api.sql', import.meta.url), 'utf8');
    await client.query(migracao);
    await client.query(migracao);
    const usuario = await client.query("INSERT INTO usuarios (nome, email, senha_hash) VALUES ('Teste', 'teste@example.com', 'hash-teste') RETURNING id");
    const uid = usuario.rows[0].id;
    await client.query('BEGIN');
    const estabelecimento = await salvarEstabelecimento(client, { nome: 'Local', cidade: 'São Paulo', estado: 'SP', logradouro: 'Rua', status: 'aprovado', recursos: [1, 2] });
    await salvarEstabelecimento(client, { recursos: [3] }, estabelecimento.id);
    await client.query('COMMIT');
    const recursos = await client.query('SELECT recurso_id FROM estabelecimento_recursos WHERE estabelecimento_id = $1', [estabelecimento.id]);
    assert.deepEqual(recursos.rows, [{ recurso_id: 3 }]);
    await client.query('INSERT INTO favoritos (usuario_id, estabelecimento_id) VALUES ($1, $2)', [uid, estabelecimento.id]);
    await client.query("INSERT INTO solicitacoes_estabelecimentos (usuario_id, estabelecimento_id, tipo, motivo) VALUES ($1, $2, 'exclusao', 'Local encerrado')", [uid, estabelecimento.id]);
    await client.query('DELETE FROM estabelecimentos WHERE id = $1', [estabelecimento.id]);
    assert.equal((await client.query('SELECT * FROM favoritos')).rows.length, 0);
    assert.equal((await client.query('SELECT estabelecimento_id FROM solicitacoes_estabelecimentos')).rows[0].estabelecimento_id, null);
  } finally {
    await client.query('ROLLBACK');
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await client.end();
  }
});
