import { montarSolicitacao } from "../utils/solicitacao";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import api from "../services/api";
import Icon from "../components/Icon";
export default function AdicionarLocal() {
  const [params] = useSearchParams();
  const id = params.get("estabelecimentoId");
  const [tipo, setTipo] = useState(id ? "revisao" : "adicao");
  const categorias = useRemote("/categorias");
  const recursos = useRemote("/recursos");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    try {
      await api.post("/solicitacoes", montarSolicitacao(form, tipo, id));
      setEnviado(true);
    } catch (error) {
      setErro(error.isAxiosError ? mensagemErro(error) : error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page narrow">
      <Link className="back-link" to="/buscar">
        ← Voltar para o mapa
      </Link>
      <span className="eyebrow">SUA CONTRIBUIÇÃO FAZ A DIFERENÇA</span>
      <h1>
        {id ? "Sugerir uma alteração" : "Adicione um novo caminho"}
        <span className="title-dot">.</span>
      </h1>
      <p className="page-description">
        As informações serão analisadas antes de aparecerem no mapa.
      </p>
      {enviado ? (
        <div className="panel submitted">
          <Icon name="check" size={48} />
          <h2>Contribuição enviada!</h2>
          <p>Obrigada por ajudar a construir uma cidade mais inclusiva.</p>
          <Link className="button" to="/minhas-solicitacoes">
            Acompanhar solicitação
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="contribution-form">
          {id && (
            <label>
              O que deseja solicitar?
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="revisao">Corrigir informações</option>
                <option value="exclusao">Solicitar remoção do local</option>
              </select>
            </label>
          )}
          <div className="form-columns">
            <section className="panel form">
              {tipo !== "exclusao" && (
                <>
                  <h3>Informações do local</h3>
                  {tipo === "revisao" && (
                    <p className="muted">
                      Preencha somente os campos que deseja alterar.
                    </p>
                  )}
                  <label>
                    Nome do local
                    <input
                      name="nome"
                      required={tipo === "adicao"}
                      maxLength={180}
                      placeholder="Ex.: Biblioteca Central"
                    />
                  </label>
                  <label>
                    Categoria
                    <select name="categoriaId">
                      <option value="">Selecione uma categoria</option>
                      {categorias.data?.dados?.map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Rua / avenida
                    <input
                      name="logradouro"
                      required={tipo === "adicao"}
                      maxLength={180}
                      placeholder="Nome da rua"
                    />
                  </label>
                  <div className="two-fields">
                    <label>
                      Número
                      <input name="numero" maxLength={20} />
                    </label>
                    <label>
                      Bairro
                      <input name="bairro" maxLength={100} />
                    </label>
                  </div>
                  <div className="two-fields">
                    <label>
                      Cidade
                      <input
                        name="cidade"
                        required={tipo === "adicao"}
                        maxLength={100}
                      />
                    </label>
                    <label>
                      Estado
                      <select name="estado" required={tipo === "adicao"}>
                        <option value="">UF</option>
                        {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                          .split(" ")
                          .map((uf) => (
                            <option key={uf}>{uf}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Telefone (opcional)
                    <input name="telefone" type="tel" maxLength={30} />
                  </label>
                  <label>
                    Site (opcional)
                    <input
                      name="site"
                      type="url"
                      placeholder="https://"
                      maxLength={255}
                    />
                  </label>
                  <label>
                    Descrição (opcional)
                    <textarea name="descricao" maxLength={10000} />
                  </label>
                </>
              )}
              <label>
                {tipo === "exclusao"
                  ? "Por que este local deve ser removido?"
                  : "Conte um pouco sobre sua contribuição"}
                <textarea
                  name="motivo"
                  required
                  minLength={10}
                  maxLength={5000}
                  placeholder="Explique o que você conhece sobre o local (mínimo de 10 caracteres)."
                />
              </label>
            </section>
            {tipo !== "exclusao" && (
              <aside className="panel resources-form">
                <h3>Recursos de acessibilidade</h3>
                <p>Selecione apenas os recursos que você conhece.</p>
                {tipo === "revisao" && (
                  <label className="checkbox">
                    <input type="checkbox" name="alterarRecursos" />
                    Substituir a lista atual de recursos pelos selecionados
                    abaixo
                  </label>
                )}
                {recursos.error ? (
                  <p role="alert">{recursos.error}</p>
                ) : recursos.loading ? (
                  <p>Carregando recursos…</p>
                ) : (
                  recursos.data?.dados?.map((r) => (
                    <label className="checkbox resource-option" key={r.id}>
                      <input name="recursos" type="checkbox" value={r.id} />
                      <Icon name="access" size={20} />
                      {r.nome}
                    </label>
                  ))
                )}
                <div className="tip">
                  <Icon name="shield" />
                  <p>
                    Informações precisas ajudam outras pessoas a decidir com
                    segurança.
                  </p>
                </div>
              </aside>
            )}
          </div>
          {erro && (
            <p role="alert" className="alert error">
              {erro}
            </p>
          )}
          <div className="form-actions">
            <Link to="/buscar">Cancelar</Link>
            <button className="button" disabled={busy}>
              {busy ? "Enviando…" : "Enviar para avaliação"}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
