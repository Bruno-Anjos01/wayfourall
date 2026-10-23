import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';
import { erroHttp, texto } from '../../utils/validation.js';

export function validarCredenciais(body, cadastro = false) {
  const email = texto(body?.email, 'E-mail', 150, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw erroHttp(400, 'E-mail inválido');
  const senha = body?.senha;
  if (typeof senha !== 'string' || senha.length < (cadastro ? 8 : 1) || Buffer.byteLength(senha, 'utf8') > 72) {
    throw erroHttp(400, 'Senha inválida: cadastro exige pelo menos 8 caracteres; limite de 72 bytes');
  }
  return { email, senha, ...(cadastro ? { nome: texto(body.nome, 'Nome', 150, true) } : {}) };
}

export async function cadastrarUsuario(request, response, next) {
  try {
    const { nome, email, senha } = validarCredenciais(request.body, true);
    const senhaHash = await bcrypt.hash(senha, 12);
    const resultado = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, 'usuario') RETURNING id, nome, email, perfil",
      [nome, email, senhaHash],
    );
    return response.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', usuario: resultado.rows[0] });
  } catch (error) { next(error); }
}

export async function login(request, response, next) {
  try {
    const { email, senha } = validarCredenciais(request.body);
    const resultado = await pool.query('SELECT id, nome, email, perfil, senha_hash FROM usuarios WHERE email = $1 AND ativo = TRUE', [email]);
    const usuario = resultado.rows[0];
    if (!usuario || !await bcrypt.compare(senha, usuario.senha_hash)) throw erroHttp(401, 'E-mail ou senha inválidos');
    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    const { id, nome, perfil } = usuario;
    return response.json({ token, usuario: { id, nome, email, perfil } });
  } catch (error) { next(error); }
}

export async function obterUsuario(request, response, next) {
  try {
    const resultado = await pool.query('SELECT id, nome, email, perfil FROM usuarios WHERE id = $1 AND ativo = TRUE', [request.usuario.id]);
    if (!resultado.rows.length) throw erroHttp(401, 'Usuário não encontrado');
    return response.json({ usuario: resultado.rows[0] });
  } catch (error) { next(error); }
}
