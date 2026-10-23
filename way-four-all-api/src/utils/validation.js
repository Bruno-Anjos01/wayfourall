export function erroHttp(statusCode, mensagem) {
  return Object.assign(new Error(mensagem), { statusCode });
}

export function validarId(valor) {
  if (!['string', 'number'].includes(typeof valor) || !/^\d+$/.test(String(valor)) ||
      !Number.isSafeInteger(Number(valor)) || Number(valor) < 1 || Number(valor) > 2147483647) {
    throw erroHttp(400, 'ID inválido');
  }
  return Number(valor);
}

export function texto(valor, campo, maximo, obrigatorio = false) {
  if (valor == null && !obrigatorio) return null;
  if (typeof valor !== 'string' || valor.trim().length > maximo || (obrigatorio && !valor.trim())) {
    throw erroHttp(400, `${campo} inválido`);
  }
  return valor.trim() || null;
}

export function paginacao(query) {
  const pagina = validarId(query.pagina ?? '1');
  const limite = Math.min(validarId(query.limite ?? '10'), 50);
  return { pagina, limite, offset: (pagina - 1) * limite };
}
