// Limite local por IP. Em múltiplas instâncias, configurar limite compartilhado no proxy.
export function criarLimiteLogin({ maximo = 30, janela = 15 * 60 * 1000 } = {}) {
  const tentativas = new Map();
  return (request, response, next) => {
    const agora = Date.now();
    for (const [ip, entrada] of tentativas) {
      if (entrada.expira <= agora) tentativas.delete(ip);
    }
    let entrada = tentativas.get(request.ip);
    if (!entrada) {
      if (tentativas.size >= 10000) return response.status(429).json({ erro: 'Tente novamente mais tarde' });
      entrada = { contador: 0, expira: agora + janela };
      tentativas.set(request.ip, entrada);
    }
    entrada.contador++;
    if (entrada.contador > maximo) {
      response.setHeader('Retry-After', Math.ceil((entrada.expira - agora) / 1000));
      return response.status(429).json({ erro: 'Muitas tentativas. Tente novamente mais tarde' });
    }
    next();
  };
}
