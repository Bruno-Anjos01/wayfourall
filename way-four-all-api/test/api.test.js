import { test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/config/database.js';
import { validarEstabelecimento } from '../src/modules/estabelecimentos/estabelecimentoService.js';
import { validarCredenciais } from '../src/modules/auth/authController.js';
import { criarLimiteLogin } from '../src/middlewares/loginLimit.js';

let server;
let base;
process.env.JWT_SECRET = 'test-only-secret-not-for-production-123456789';
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await pool.end(); });
afterEach(() => mock.restoreAll());

async function requisicao(path, { method = 'GET', body, perfil, raw, token } = {}) {
  const headers = {};
  if (body !== undefined || raw !== undefined) headers['Content-Type'] = 'application/json';
  if (perfil) headers.Authorization = `Bearer ${jwt.sign({ id: 1, perfil }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
  if (token) headers.Authorization = token;
  const response = await fetch(base + path, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}

test('rotas inexistentes, JSON inválido e corpos ausentes retornam erro de cliente', async () => {
  assert.equal((await requisicao('/inexistente')).status, 404);
  assert.equal((await requisicao('/api/auth/login', { method: 'POST', raw: '{' })).status, 400);
  assert.equal((await requisicao('/api/auth/login', { method: 'POST' })).status, 400);
  assert.equal((await requisicao('/api/auth/login', { method: 'POST', body: [] })).status, 400);
});

test('credenciais inválidas não chegam ao banco', async () => {
  const consulta = mock.method(pool, 'query', () => { throw new Error('Consulta inesperada'); });
  for (const body of [{}, { email: 12, senha: {} }, { email: 'a@b.com', senha: '123' }]) {
    assert.equal((await requisicao('/api/auth/cadastro', { method: 'POST', body })).status, 400);
  }
  assert.equal(consulta.mock.callCount(), 0);
  assert.equal(validarCredenciais({ email: ' A@B.COM ', senha: '12345678', nome: 'Ana' }, true).email, 'a@b.com');
  assert.throws(() => validarCredenciais({ email: 'a@b.com', senha: 'á'.repeat(37) }), /Senha inválida/);
});

test('autorização consulta perfil atual em vez de confiar no perfil antigo do token', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'usuario' }] }));
  assert.equal((await requisicao('/api/admin/solicitacoes', { perfil: 'admin' })).status, 403);
  assert.equal((await requisicao('/api/admin/solicitacoes')).status, 401);
  assert.equal((await requisicao('/api/admin/solicitacoes', { token: 'Basic abc' })).status, 401);
});

test('validação de estabelecimento rejeita elevação de privilégios e campos inválidos', () => {
  assert.throws(() => validarEstabelecimento({ status: 'aprovado' }, true), /não permitido/);
  assert.throws(() => validarEstabelecimento({}, true), /ao menos/);
  assert.throws(() => validarEstabelecimento({ recursos: [true] }, true), /ID inválido/);
  assert.throws(() => validarEstabelecimento({ latitude: 91 }, true), /latitude inválida/);
  assert.throws(() => validarEstabelecimento({ site: 'javascript:alert(1)' }, true), /HTTP/);
});

test('listagem pública filtra aprovação e rejeita paginação fracionária', async () => {
  const consulta = mock.method(pool, 'query', async () => ({ rows: [] }));
  assert.equal((await requisicao('/api/estabelecimentos?pagina=1.5')).status, 400);
  assert.equal(consulta.mock.callCount(), 0);
  assert.equal((await requisicao('/api/estabelecimentos')).status, 200);
  assert.match(consulta.mock.calls[0].arguments[0], /e.status = 'aprovado'/);
});

test('aprovação aplica dados e confirma tudo na mesma transação', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  const comandos = [];
  const client = { release: mock.fn(), query: async (sql) => {
    comandos.push(sql);
    if (sql.includes('FOR UPDATE')) return { rows: [{ id: 2, tipo: 'adicao', status: 'pendente', dados_propostos: { nome: 'Local', logradouro: 'Rua A', cidade: 'São Paulo', estado: 'SP' } }] };
    return { rows: [{ id: 3 }] };
  } };
  mock.method(pool, 'connect', async () => client);
  assert.equal((await requisicao('/api/admin/solicitacoes/2/aprovar', { method: 'PATCH', perfil: 'admin', body: {} })).status, 200);
  assert.ok(comandos.find(sql => sql.includes('INSERT INTO estabelecimentos')));
  assert.equal(comandos.at(-1), 'COMMIT');
  assert.equal(client.release.mock.callCount(), 1);
});

test('falha ao aplicar proposta desfaz transação e libera conexão', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  const comandos = [];
  const client = { release: mock.fn(), query: async (sql) => {
    comandos.push(sql);
    if (sql.includes('FOR UPDATE')) return { rows: [{ tipo: 'revisao', estabelecimento_id: 2, status: 'pendente', dados_propostos: { categoriaId: 999 } }] };
    if (sql.includes('UPDATE estabelecimentos')) throw Object.assign(new Error('FK'), { code: '23503' });
    return { rows: [] };
  } };
  mock.method(pool, 'connect', async () => client);
  assert.equal((await requisicao('/api/admin/solicitacoes/2/aprovar', { method: 'PATCH', perfil: 'admin', body: {} })).status, 409);
  assert.equal(comandos.at(-1), 'ROLLBACK');
  assert.ok(!comandos.includes('COMMIT'));
  assert.equal(client.release.mock.callCount(), 1);
});

test('avaliação rejeita nota inválida e exclusão restringe por proprietário', async () => {
  const consulta = mock.method(pool, 'query', async (sql) => ({ rows: sql.startsWith('SELECT id, perfil') ? [{ id: 1, perfil: 'usuario' }] : [] }));
  assert.equal((await requisicao('/api/avaliacoes', { method: 'POST', perfil: 'usuario', body: { estabelecimentoId: 2, nota: 6 } })).status, 400);
  assert.equal((await requisicao('/api/avaliacoes/3', { method: 'DELETE', perfil: 'usuario' })).status, 404);
  assert.match(consulta.mock.calls.at(-1).arguments[0], /usuario_id = \$2/);
});

test('limite de autenticação responde 429 após exceder tentativas', () => {
  const limitador = criarLimiteLogin({ maximo: 1 });
  const next = mock.fn();
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json() {} };
  limitador({ ip: '127.0.0.1' }, res, next);
  limitador({ ip: '127.0.0.1' }, res, next);
  assert.equal(next.mock.callCount(), 1);
  assert.equal(res.code, 429);
});

test('aprovação de exclusão remove estabelecimento antes de concluir solicitação', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  const comandos = [];
  mock.method(pool, 'connect', async () => ({ release() {}, query: async sql => {
    comandos.push(sql);
    if (sql.includes('FOR UPDATE')) return { rows: [{ id: 2, tipo: 'exclusao', status: 'pendente', estabelecimento_id: 3 }] };
    return { rows: [{ id: 3 }] };
  } }));
  assert.equal((await requisicao('/api/admin/solicitacoes/2/aprovar', { method: 'PATCH', perfil: 'admin', body: {} })).status, 200);
  assert.ok(comandos.findIndex(sql => sql.startsWith('DELETE FROM estabelecimentos')) < comandos.findIndex(sql => sql.includes('UPDATE solicitacoes')));
  assert.equal(comandos.at(-1), 'COMMIT');
});

test('solicitação já analisada não é reaplicada', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  const comandos = [];
  mock.method(pool, 'connect', async () => ({ release() {}, query: async sql => {
    comandos.push(sql);
    return { rows: [{ status: 'aprovada' }] };
  } }));
  assert.equal((await requisicao('/api/admin/solicitacoes/2/aprovar', { method: 'PATCH', perfil: 'admin', body: {} })).status, 409);
  assert.equal(comandos.length, 3);
  assert.equal(comandos.at(-1), 'ROLLBACK');
});

test('atualização substitui recursos dentro da transação', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  const comandos = [];
  mock.method(pool, 'connect', async () => ({ release() {}, query: async (sql, params) => {
    comandos.push({ sql, params });
    return { rows: [{ id: 2 }] };
  } }));
  const body = { nome: 'Local', logradouro: 'Rua', cidade: 'São Paulo', estado: 'SP', recursos: [3, 3, 4] };
  assert.equal((await requisicao('/api/estabelecimentos/2', { method: 'PUT', perfil: 'admin', body })).status, 200);
  const insercoes = comandos.filter(({ sql }) => sql.startsWith('INSERT INTO estabelecimento_recursos'));
  assert.deepEqual(insercoes.map(({ params }) => params), [[2, 3], [2, 4]]);
  assert.equal(comandos.at(-1).sql, 'COMMIT');
});

test('favoritos são vinculados ao usuário autenticado e removidos apenas por ele', async () => {
  const consulta = mock.method(pool, 'query', async sql => ({ rows: sql.startsWith('SELECT id, perfil') ? [{ id: 1, perfil: 'usuario' }] : [{ estabelecimento_id: 2 }] }));
  assert.equal((await requisicao('/api/favoritos/2', { method: 'PUT', perfil: 'usuario', body: {} })).status, 200);
  assert.deepEqual(consulta.mock.calls.at(-1).arguments[1], [1, 2]);
  assert.equal((await requisicao('/api/favoritos/2', { method: 'DELETE', perfil: 'usuario' })).status, 204);
  assert.match(consulta.mock.calls.at(-1).arguments[0], /usuario_id = \$1/);
  assert.deepEqual(consulta.mock.calls.at(-1).arguments[1], [1, 2]);
});

test('moderação exige administrador e status permitido', async () => {
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'usuario' }] }));
  assert.equal((await requisicao('/api/avaliacoes/2/moderar', { method: 'PATCH', perfil: 'usuario', body: { status: 'aprovada' } })).status, 403);
  mock.restoreAll();
  mock.method(pool, 'query', async () => ({ rows: [{ id: 1, perfil: 'admin' }] }));
  assert.equal((await requisicao('/api/avaliacoes/2/moderar', { method: 'PATCH', perfil: 'admin', body: { status: 'qualquer' } })).status, 400);
});
