import { useState } from "react";
import { Link } from "react-router-dom";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import api from "../services/api";
import Feedback from "../components/Feedback";
function Editor({ id, aoSalvar, fechar }) {
  const remote = useRemote("/admin/estabelecimentos/" + id);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErro("");
    const form = new FormData(event.currentTarget);
    const dados = {};
    for (const campo of [
      "nome",
      "logradouro",
      "cidade",
      "estado",
      "descricao",
      "telefone",
      "site",
      "numero",
      "bairro",
    ])
      dados[campo] = form.get(campo) || null;
    dados.status = form.get("status");
    dados.verificado = form.get("verificado") === "on";
    try {
      await api.put("/estabelecimentos/" + id, dados);
      aoSalvar();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel admin-editor">
      <h2>Editar estabelecimento</h2>
      <Feedback {...remote}>
        {remote.data?.dados && (
          <form className="form" onSubmit={submit} key={id}>
            {[
              "nome",
              "logradouro",
              "cidade",
              "estado",
              "descricao",
              "telefone",
              "site",
              "numero",
              "bairro",
            ].map((c) => (
              <label key={c}>
                {
                  {
                    nome: "Nome",
                    logradouro: "Logradouro",
                    cidade: "Cidade",
                    estado: "Estado (UF)",
                    descricao: "Descrição",
                    telefone: "Telefone",
                    site: "Site",
                    numero: "Número",
                    bairro: "Bairro",
                  }[c]
                }
                <input
                  name={c}
                  defaultValue={remote.data.dados[c] || ""}
                  required={["nome", "logradouro", "cidade", "estado"].includes(
                    c,
                  )}
                  maxLength={c === "estado" ? 2 : undefined}
                />
              </label>
            ))}
            <label>
              Status
              <select name="status" defaultValue={remote.data.dados.status}>
                {["pendente", "aprovado", "rejeitado"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="checkbox">
              <input
                name="verificado"
                type="checkbox"
                defaultChecked={remote.data.dados.verificado}
              />
              Informações verificadas
            </label>
            {erro && (
              <p className="alert error" role="alert">
                {erro}
              </p>
            )}
            <div className="actions">
              <button className="button" disabled={busy}>
                {busy ? "Salvando…" : "Salvar alterações"}
              </button>
              <button type="button" className="button outline" onClick={fechar}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Feedback>
    </section>
  );
}
export default function AdminLocais() {
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState(null);
  const remote = useRemote("/admin/estabelecimentos?pagina=" + pagina);
  return (
    <main className="container page">
      <Link className="back-link" to="/admin">
        ← Administração
      </Link>
      <h1>Estabelecimentos</h1>
      <p className="page-description">
        Revise as informações e publique os locais aprovados no mapa.
      </p>
      {editando ? (
        <Editor
          key={editando}
          id={editando}
          fechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            remote.retry();
          }}
        />
      ) : (
        <>
          <Feedback {...remote} empty={!remote.data?.dados?.length}>
            <div className="request-list">
              {remote.data?.dados?.map((local) => (
                <article key={local.id} className="panel request-card">
                  <div>
                    <span className="status">{local.status}</span>
                    <h3>{local.nome}</h3>
                    <p>
                      {local.cidade} · {local.estado}
                    </p>
                  </div>
                  <button
                    className="button outline"
                    onClick={() => setEditando(local.id)}
                  >
                    Revisar informações
                  </button>
                </article>
              ))}
            </div>
          </Feedback>
          <div className="pagination">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              ← Anterior
            </button>
            <span>{pagina}</span>
            <button
              disabled={remote.data?.dados?.length !== 10}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
