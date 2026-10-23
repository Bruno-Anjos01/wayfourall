import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import Feedback from "../components/Feedback";
import Pagination from "../components/Pagination";
export default function AdminAvaliacoes() {
  const [pagina, setPagina] = useState(1);
  const remote = useRemote("/avaliacoes/pendentes?pagina=" + pagina);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(null);
  async function moderar(id, status) {
    setBusy(id);
    setErro("");
    try {
      await api.patch("/avaliacoes/" + id + "/moderar", { status });
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
      <h1>Avaliações para revisar</h1>
      {erro && (
        <p role="alert" className="alert error">
          {erro}
        </p>
      )}
      <Feedback {...remote} empty={!remote.data?.dados?.length}>
        <div className="request-list">
          {remote.data?.dados?.map((a) => (
            <article className="panel" key={a.id}>
              <span className="rating">{"★".repeat(a.nota)}</span>
              <h3>Avaliação #{a.id}</h3>
              <Link
                className="text-link"
                to={"/estabelecimentos/" + a.estabelecimento_id}
              >
                Ver estabelecimento →
              </Link>
              <p>{a.comentario || "Sem comentário."}</p>
              <div className="actions">
                <button
                  className="button"
                  disabled={busy === a.id}
                  onClick={() => moderar(a.id, "aprovada")}
                >
                  Publicar
                </button>
                <button
                  className="button outline"
                  disabled={busy === a.id}
                  onClick={() => moderar(a.id, "rejeitada")}
                >
                  Rejeitar
                </button>
              </div>
            </article>
          ))}
        </div>
      </Feedback>
      <Pagination
        pagina={pagina}
        setPagina={setPagina}
        quantidade={remote.data?.dados?.length}
        loading={remote.loading}
      />
    </main>
  );
}
