export function montarSolicitacao(form, tipo, id) {
  if (!["adicao", "revisao", "exclusao"].includes(tipo)) {
    throw new Error("Tipo de solicitação inválido.");
  }
  if (tipo !== "adicao" && (!/^\d+$/.test(String(id)) || Number(id) <= 0)) {
    throw new Error("Selecione um estabelecimento válido.");
  }
  const motivo = String(form.get("motivo") || "").trim();
  if (motivo.length < 10)
    throw new Error("Explique o motivo com pelo menos 10 caracteres.");
  const solicitacao = { tipo, motivo };
  if (tipo !== "adicao") solicitacao.estabelecimentoId = Number(id);
  if (tipo === "exclusao") return solicitacao;
  const dados = {};
  for (const campo of [
    "nome",
    "descricao",
    "logradouro",
    "numero",
    "bairro",
    "cidade",
    "estado",
    "telefone",
    "site",
    "cep",
  ]) {
    const valor = String(form.get(campo) || "").trim();
    if (valor) dados[campo] = valor;
  }
  if (form.get("categoriaId"))
    dados.categoriaId = Number(form.get("categoriaId"));
  if (tipo === "adicao" || form.get("alterarRecursos")) {
    dados.recursos = [...new Set(form.getAll("recursos").map(Number))];
  }
  if (tipo === "revisao" && !Object.keys(dados).length) {
    throw new Error("Preencha ao menos uma informação que deseja corrigir.");
  }
  solicitacao.dadosPropostos = dados;
  return solicitacao;
}
