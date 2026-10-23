import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import Feedback from "../components/Feedback";
export default function AdminSolicitacoes() {
  const [status, setStatus] = useState("pendente");
  const remote = useRemote("/admin/solicitacoes?status=" + status);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(null);
  async function analisar(event, id) {
    event.preventDefault();
    const acao = event.nativeEvent.submitter.value;
    const respostaAdmin = new FormData(event.currentTarget).get(
      "respostaAdmin",
    );
    if (acao === "rejeitar" && respostaAdmin.trim().length < 5) {
      setErro("Informe um motivo de rejeição com pelo menos 5 caracteres.");
      return;
    }
    setBusy(id);
    setErro("");
    try {
      await api.patch("/admin/solicitacoes/" + id + "/" + acao, {
        respostaAdmin,
      });
      remote.retry();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="container page">
      <Link className="back-link" to="/admin">
        ← Administração
      </Link>
      <div className="section-heading">
        <h1>Contribuições da comunidade</h1>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {["pendente", "aprovada", "rejeitada", "cancelada"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {erro && (
        <p role="alert" className="alert error">
          {erro}
        </p>
      )}
      <Feedback {...remote} empty={!remote.data?.solicitacoes?.length}>
        <div className="request-list">
          {remote.data?.solicitacoes?.map((s) => (
            <article key={s.id} className="panel">
              <span className={"status " + s.status}>
                {s.tipo} · {s.status}
              </span>
              <h3>
                {s.estabelecimento ||
                  s.dados_propostos?.nome ||
                  "Solicitação #" + s.id}
              </h3>
              <p>Enviada por {s.usuario}</p>
              <p>{s.motivo}</p>
              {s.dados_propostos && (
                <dl className="proposal">
                  {Object.entries(s.dados_propostos).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {s.status === "pendente" ? (
                <form className="form" onSubmit={(e) => analisar(e, s.id)}>
                  <label>
                    Resposta à comunidade
                    <textarea
                      name="respostaAdmin"
                      maxLength={5000}
                      placeholder="Explique sua decisão…"
                    />
                  </label>
                  {s.tipo === "exclusao" && (
                    <p className="alert">
                      A aprovação removerá o estabelecimento e seus vínculos.
                    </p>
                  )}
                  <div className="actions">
                    <button
                      className="button"
                      value="aprovar"
                      disabled={busy === s.id}
                    >
                      Aprovar e aplicar
                    </button>
                    <button
                      className="button outline"
                      value="rejeitar"
                      disabled={busy === s.id}
                    >
                      Rejeitar
                    </button>
                  </div>
                </form>
              ) : (
                <p>{s.resposta_admin}</p>
              )}
            </article>
          ))}
        </div>
      </Feedback>
    </main>
  );
}
