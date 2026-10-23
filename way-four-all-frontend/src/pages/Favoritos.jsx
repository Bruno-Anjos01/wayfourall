import { useState } from "react";
import { Link } from "react-router-dom";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import api from "../services/api";
import Feedback from "../components/Feedback";
import Card from "../components/CardEstabelecimento";
import Icon from "../components/Icon";
export default function Favoritos() {
  const [pagina, setPagina] = useState(1);
  const remote = useRemote("/favoritos?pagina=" + pagina);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(null);
  async function remover(id) {
    setBusy(id);
    setErro("");
    try {
      await api.delete("/favoritos/" + id);
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
          <span className="eyebrow">LUGARES PARA VOLTAR</span>
          <h1>
            Meus favoritos<span className="title-dot">.</span>
          </h1>
          <p>Seus próximos destinos, guardados com carinho.</p>
        </div>
        <Link to="/buscar" className="button outline">
          Explorar mais <Icon name="arrow" />
        </Link>
      </div>
      {erro && (
        <p className="alert error" role="alert">
          {erro}
        </p>
      )}
      <Feedback {...remote} empty={!remote.data?.dados?.length}>
        <div className="cards-grid">
          {remote.data?.dados?.map((local) => (
            <Card key={local.id} local={local}>
              <button
                className="favorite-remove"
                disabled={busy === local.id}
                onClick={() => remover(local.id)}
              >
                <Icon name="heart" size={16} />{" "}
                {busy === local.id ? "Removendo…" : "Remover dos favoritos"}
              </button>
            </Card>
          ))}
        </div>
      </Feedback>
      <div className="pagination">
        <button disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
          ← Anterior
        </button>
        <span>Página {pagina}</span>
        <button
          disabled={remote.data?.dados?.length !== 10}
          onClick={() => setPagina((p) => p + 1)}
        >
          Próxima →
        </button>
      </div>
    </main>
  );
}
