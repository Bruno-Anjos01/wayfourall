export function sucesso(
  response,
  {
    status = 200,
    mensagem = "Operação realizada com sucesso",
    dados = null,
    meta = undefined,
  } = {},
) {
  const corpo = {
    sucesso: true,
    mensagem,
    dados,
  };

  if (meta !== undefined) {
    corpo.meta = meta;
  }

  return response.status(status).json(corpo);
}

export function falha(
  response,
  {
    status = 400,
    mensagem = "Não foi possível realizar a operação",
    detalhes = undefined,
  } = {},
) {
  const corpo = {
    sucesso: false,
    erro: mensagem,
    mensagem,
  };

  if (detalhes !== undefined) {
    corpo.detalhes = detalhes;
  }

  return response.status(status).json(corpo);
}
