import { falha } from '../utils/response.js';

export function errorMiddleware(error, request, response, next) {
  if (response.headersSent) return next(error);
  const banco = {
    '23505': [409, 'Registro já cadastrado'],
    '23503': [409, 'Registro relacionado inexistente ou ainda em uso'],
    '23514': [400, 'Dados fora dos valores permitidos'],
    '22001': [400, 'Texto maior que o limite permitido'],
    '22P02': [400, 'Formato de dado inválido'],
  }[error.code];
  const status = banco?.[0] || error.statusCode || error.status || 500;
  const mensagem = banco?.[1] || (status >= 500 ? 'Erro interno do servidor' : error.message);
  if (status >= 500) console.error('Falha na API:', error.code || error.name);
  return falha(response, { status, mensagem });
}
