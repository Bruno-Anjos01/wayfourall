import { Link, useParams } from "react-router-dom";
import useRemote from "../hooks/useRemote";
import Feedback from "../components/Feedback";
import Mapa from "../components/Mapa";
import Icon from "../components/Icon";
export default function Rota() {
  const { id } = useParams();
  const remote = useRemote("/estabelecimentos/" + id);
  const local = remote.data?.dados;
  const destino = local
    ? [local.logradouro, local.numero, local.cidade, local.estado]
        .filter(Boolean)
        .join(", ")
    : "";
  return (
    <main className="container page">
      <Link className="back-link" to={"/estabelecimentos/" + id}>
        ← Voltar ao local
      </Link>
      <h1>
        Seu próximo caminho<span className="title-dot">.</span>
      </h1>
      <Feedback {...remote}>
        {local && (
          <div className="route-grid">
            <Mapa locais={[local]} />
            <section className="panel">
              <span className="eyebrow">SEU DESTINO</span>
              <h2>{local.nome}</h2>
              <p>{destino}</p>
              <div className="tip">
                <Icon name="access" />
                <strong>Planeje uma viagem que funciona para você.</strong>
                <p>
                  O serviço de mapas abrirá para você escolher a origem e o
                  transporte. Ainda não calculamos rotas com garantia de
                  acessibilidade; confira rampas, calçadas e condições do
                  trajeto antes de sair.
                </p>
              </div>
              <a
                className="button full"
                href={
                  "https://www.google.com/maps/dir/?api=1&destination=" +
                  encodeURIComponent(destino)
                }
                target="_blank"
                rel="noreferrer"
              >
                Abrir trajeto no Google Maps <Icon name="out" size={18} />
              </a>
            </section>
          </div>
        )}
      </Feedback>
    </main>
  );
}
