import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { erroHttp } from '../utils/validation.js';

export async function autenticar(request, response, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization || '');
  if (!match) return next(erroHttp(401, 'Informe um token Bearer'));
  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!Number.isInteger(payload.id) || payload.id < 1) throw new Error('ID inválido');
  } catch { return next(erroHttp(401, 'Token inválido ou expirado')); }
  try {
    const resultado = await pool.query('SELECT id, perfil FROM usuarios WHERE id = $1 AND ativo = TRUE', [payload.id]);
    if (!resultado.rows.length) return next(erroHttp(401, 'Usuário não encontrado'));
    request.usuario = resultado.rows[0];
    return next();
  } catch (error) { return next(error); }
}

export function somenteAdmin(request, response, next) {
  if (request.usuario?.perfil !== 'admin') return next(erroHttp(403, 'Acesso permitido apenas para administradores'));
  next();
}
