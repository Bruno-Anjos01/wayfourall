import { test } from "node:test";
import assert from "node:assert/strict";
import { montarSolicitacao } from "../src/utils/solicitacao.js";

function formulario(campos = {}) {
  const form = new FormData();
  form.set("motivo", "Contribuição para melhorar a acessibilidade");
  for (const [campo, valor] of Object.entries(campos)) {
    for (const item of Array.isArray(valor) ? valor : [valor])
      form.append(campo, item);
  }
  return form;
}

test("adição normaliza texto e recursos sem anexar um ID de estabelecimento", () => {
  const resultado = montarSolicitacao(
    formulario({
      nome: " Biblioteca ",
      recursos: ["1", "1", "2"],
      categoriaId: "3",
    }),
    "adicao",
    "99",
  );
  assert.equal(resultado.estabelecimentoId, undefined);
  assert.deepEqual(resultado.dadosPropostos, {
    nome: "Biblioteca",
    recursos: [1, 2],
    categoriaId: 3,
  });
});

test("revisão parcial preserva recursos quando substituição não foi marcada", () => {
  const resultado = montarSolicitacao(
    formulario({ nome: "Novo nome", recursos: ["3"], telefone: "" }),
    "revisao",
    "12",
  );
  assert.deepEqual(resultado.dadosPropostos, { nome: "Novo nome" });
  assert.equal(resultado.estabelecimentoId, 12);
});

test("revisão pode remover todos os recursos explicitamente", () => {
  const resultado = montarSolicitacao(
    formulario({ alterarRecursos: "on" }),
    "revisao",
    "12",
  );
  assert.deepEqual(resultado.dadosPropostos, { recursos: [] });
});

test("exclusão não transmite campos de revisão ocultos", () => {
  const resultado = montarSolicitacao(
    formulario({ nome: "Não enviar", recursos: ["1"] }),
    "exclusao",
    "12",
  );
  assert.equal(resultado.dadosPropostos, undefined);
  assert.equal(resultado.estabelecimentoId, 12);
});

test("rejeita revisão vazia, ID inválido e motivo insuficiente", () => {
  assert.throws(
    () => montarSolicitacao(formulario(), "revisao", "12"),
    /ao menos/,
  );
  assert.throws(
    () => montarSolicitacao(formulario(), "exclusao", "-1"),
    /válido/,
  );
  const form = formulario();
  form.set("motivo", "curto");
  assert.throws(() => montarSolicitacao(form, "adicao"), /10 caracteres/);
});
