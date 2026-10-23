import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import useRemote, { mensagemErro } from "../hooks/useRemote";
import useAuth from "../hooks/useAuth";
import Feedback from "../components/Feedback";
import Icon from "../components/Icon";
import Mapa from "../components/Mapa";
import Pagination from "../components/Pagination";
export default function Estabelecimento() {
  const { id } = useParams();
  const remote = useRemote("/estabelecimentos/" + id);
  const [paginaAvaliacoes, setPaginaAvaliacoes] = useState(1);
  const reviews = useRemote(
    "/avaliacoes/estabelecimentos/" + id + "?pagina=" + paginaAvaliacoes,
  );
  const { autenticado } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("acessibilidade");
  const [message, setMessage] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const local = remote.data?.dados;
  async function favoritar() {
    if (!autenticado) {
      navigate("/login", {
        state: { redirecionarPara: "/estabelecimentos/" + id },
      });
      return;
    }
    setBusy(true);
    setErro("");
    try {
      await api.put("/favoritos/" + id, {});
      setMessage("Local salvo nos seus favoritos.");
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(false);
    }
  }
  async function avaliar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    setBusy(true);
    setErro("");
    try {
      await api.post("/avaliacoes", {
        estabelecimentoId: Number(id),
        nota: Number(dados.get("nota")),
        comentario: dados.get("comentario"),
      });
      setMessage("Obrigada! Sua avaliação foi enviada para moderação.");
      form.reset();
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(false);
    }
  }
  async function compartilhar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copiado para compartilhar.");
    } catch {
      setErro("Copie o endereço desta página para compartilhar.");
    }
  }
  return (
    <main className="container page">
      <Link className="back-link" to="/buscar">
        ← Voltar para o mapa
      </Link>
      <Feedback {...remote}>
        {local && (
          <>
            <div className="detail-hero">
              <div className="detail-art">
                <Icon name="building" size={90} />
                <span>Um novo lugar para conhecer</span>
              </div>
              <div>
                <span className="pill">
                  {local.categoria?.nome || "Estabelecimento"}
                </span>
                <h1>{local.nome}</h1>
                <p>
                  <Icon name="pin" size={17} />
                  {local.cidade}, {local.estado}
                </p>
                {local.verificado && (
                  <span className="verified">
                    <Icon name="shield" size={16} /> Informações verificadas
                  </span>
                )}
                <div className="actions">
                  <button
                    className="button outline"
                    onClick={favoritar}
                    disabled={busy}
                  >
                    <Icon name="heart" size={18} />
                    Favoritar
                  </button>
                  <button className="button outline" onClick={compartilhar}>
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
            {message && (
              <p role="status" className="alert success">
                {message}
              </p>
            )}
            {erro && (
              <p role="alert" className="alert error">
                {erro}
              </p>
            )}
            <div className="detail-grid">
              <section>
                <div
                  className="tabs"
                  role="tablist"
                  aria-label="Informações do local"
                >
                  {["acessibilidade", "avaliações", "informações"].map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={tab === t ? "active" : ""}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="tab-panel" role="tabpanel">
                  {tab === "acessibilidade" ? (
                    <>
                      <h3>Recursos de acessibilidade</h3>
                      <p className="muted">
                        Informações disponíveis para planejar sua visita.
                      </p>
                      {local.recursos?.length ? (
                        local.recursos.map((r) => (
                          <div className="resource-row" key={r.id}>
                            <Icon name="access" />
                            <div>
                              <strong>{r.nome}</strong>
                              <small>
                                {r.observacao ||
                                  r.descricao ||
                                  "Recurso informado para este local."}
                              </small>
                            </div>
                            <span className="verified">
                              <Icon name="check" size={16} />
                              {r.verificado ? "Verificado" : "Informado"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="feedback">
                          Ainda não há recursos informados. Isso não significa
                          que o local não seja acessível.
                        </div>
                      )}
                      <div className="tip">
                        As condições podem mudar. Entre em contato com o
                        estabelecimento para confirmar os recursos de que você
                        precisa.
                      </div>
                    </>
                  ) : tab === "avaliações" ? (
                    <>
                      <h3>Experiências da comunidade</h3>
                      <Feedback
                        {...reviews}
                        empty={!reviews.data?.dados?.length}
                      >
                        {reviews.data?.dados?.map((r) => (
                          <article className="review" key={r.id}>
                            <strong>{r.usuario}</strong>
                            <span className="rating">
                              {"★".repeat(r.nota)}
                              {"☆".repeat(5 - r.nota)}
                            </span>
                            <p>{r.comentario}</p>
                          </article>
                        ))}
                      </Feedback>
                      <Pagination
                        pagina={paginaAvaliacoes}
                        setPagina={setPaginaAvaliacoes}
                        quantidade={reviews.data?.dados?.length}
                        loading={reviews.loading}
                      />
                      {autenticado ? (
                        <form className="panel form" onSubmit={avaliar}>
                          <h3>Como foi sua experiência?</h3>
                          <label>
                            Nota
                            <select name="nota" required>
                              <option value="">Selecione</option>
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                  {n} estrelas
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Seu comentário
                            <textarea
                              name="comentario"
                              maxLength={5000}
                              placeholder="Conte o que pode ajudar outras pessoas…"
                            />
                          </label>
                          <button className="button" disabled={busy}>
                            Enviar avaliação
                          </button>
                        </form>
                      ) : (
                        <Link className="text-link" to="/login">
                          Entre para avaliar este local →
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <h3>Sobre o local</h3>
                      <p>
                        {local.descricao ||
                          "O estabelecimento ainda não possui uma descrição."}
                      </p>
                      <dl>
                        <dt>Telefone</dt>
                        <dd>{local.telefone || "Não informado"}</dd>
                        <dt>Site</dt>
                        <dd>
                          {local.site &&
                          (local.site.startsWith("https://") ||
                            local.site.startsWith("http://")) ? (
                            <a
                              className="text-link"
                              href={local.site}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Visitar site ↗
                            </a>
                          ) : (
                            "Não informado"
                          )}
                        </dd>
                      </dl>
                    </>
                  )}
                </div>
                <Link
                  className="text-link"
                  to={
                    "/adicionar-local?estabelecimentoId=" + id + "&tipo=revisao"
                  }
                >
                  Sugerir uma correção <Icon name="arrow" size={16} />
                </Link>
              </section>
              <aside className="panel location-panel">
                <Mapa locais={[local]} />
                <h3>Encontre o caminho</h3>
                <p>
                  {local.logradouro}
                  {local.numero ? ", " + local.numero : ""}
                  <br />
                  {local.bairro}
                  <br />
                  {local.cidade} · {local.estado}
                </p>
                <Link className="button full" to={"/rota/" + id}>
                  Como chegar <Icon name="arrow" />
                </Link>
              </aside>
            </div>
          </>
        )}
      </Feedback>
    </main>
  );
}
