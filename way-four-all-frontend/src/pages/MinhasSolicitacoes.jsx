import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import Feedback from "../components/Feedback";
export default function MinhasSolicitacoes() {
  const remote = useRemote("/solicitacoes/minhassolicitacoes");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(null);
  async function cancelar(id) {
    setBusy(id);
    setErro("");
    try {
      await api.patch(
        "/solicitacoes/minhassolicitacoes/" + id + "/cancelar",
        {},
      );
      remote.retry();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="container page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONSTRUINDO JUNTOS</span>
          <h1>
            Minhas contribuições<span className="title-dot">.</span>
          </h1>
          <p>Acompanhe a análise dos locais e correções que você enviou.</p>
        </div>
        <Link className="button" to="/adicionar-local">
          Indicar novo local +
        </Link>
      </div>
      {erro && (
        <p className="alert error" role="alert">
          {erro}
        </p>
      )}
      <Feedback {...remote} empty={!remote.data?.solicitacoes?.length}>
        <div className="request-list">
          {remote.data?.solicitacoes?.map((s) => (
            <article className="panel request-card" key={s.id}>
              <div>
                <span className={"status " + s.status}>{s.status}</span>
                <h3>
                  {s.estabelecimento ||
                    s.dados_propostos?.nome ||
                    "Solicitação #" + s.id}
                </h3>
                <small>
                  {
                    {
                      adicao: "Novo local",
                      revisao: "Revisão",
                      exclusao: "Exclusão",
                    }[s.tipo]
                  }{" "}
                  · {new Date(s.criado_em).toLocaleDateString("pt-BR")}
                </small>
                <p>{s.motivo}</p>
                {s.resposta_admin && (
                  <div className="tip">
                    <strong>Resposta da equipe</strong>
                    <p>{s.resposta_admin}</p>
                  </div>
                )}
              </div>
              {s.status === "pendente" && (
                <button
                  className="button outline small"
                  disabled={busy === s.id}
                  onClick={() => cancelar(s.id)}
                >
                  Cancelar solicitação
                </button>
              )}
            </article>
          ))}
        </div>
      </Feedback>
    </main>
  );
}
