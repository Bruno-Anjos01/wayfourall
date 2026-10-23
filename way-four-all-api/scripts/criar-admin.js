import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';
import { validarCredenciais } from '../src/modules/auth/authController.js';

let client;
try {
  const { nome, email, senha } = validarCredenciais({
    nome: process.env.ADMIN_NOME, email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA,
  }, true);
  const hash = await bcrypt.hash(senha, 12);
  client = await pool.connect();
  await client.query('BEGIN');
  // Serializa inicializações concorrentes sem disponibilizar cadastro administrativo público.
  await client.query('LOCK TABLE usuarios IN SHARE ROW EXCLUSIVE MODE');
  const existente = await client.query("SELECT id FROM usuarios WHERE perfil = 'admin' LIMIT 1");
  if (existente.rows.length) throw new Error('Administrador inicial já cadastrado');
  await client.query("INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, 'admin')", [nome, email, hash]);
  await client.query('COMMIT');
  console.log('Administrador inicial criado');
} catch (error) {
  if (client) await client.query('ROLLBACK');
  console.error(error.code ? `Não foi possível criar o administrador (${error.code})` : error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
