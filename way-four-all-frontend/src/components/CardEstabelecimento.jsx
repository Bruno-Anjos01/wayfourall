import { Link } from "react-router-dom";
import Icon from "./Icon";
export default function CardEstabelecimento({ local, children }) {
  const categoria =
    typeof local.categoria === "object"
      ? local.categoria?.nome
      : local.categoria;
  return (
    <article className="place-card">
      <Link
        to={"/estabelecimentos/" + local.id}
        className="place-art"
        aria-label={"Ver " + local.nome}
      >
        <Icon name="building" size={42} />
        <span>{categoria || "Local acessível"}</span>
      </Link>
      <div className="place-content">
        <div className="eyebrow">{categoria || "Explore a cidade"}</div>
        <Link to={"/estabelecimentos/" + local.id}>
          <h3>{local.nome}</h3>
        </Link>
        <p>
          <Icon name="pin" size={14} />
          {local.bairro ? local.bairro + " · " : ""}
          {local.cidade} · {local.estado}
        </p>
        <div className="resource-chips">
          {(local.recursos || []).slice(0, 3).map((recurso) => (
            <span key={recurso.id} title={recurso.nome}>
              <Icon name="access" size={15} />
              {recurso.nome}
            </span>
          ))}
        </div>
        {local.verificado && (
          <span className="verified">
            <Icon name="shield" size={14} /> Informações verificadas
          </span>
        )}
        {children}
      </div>
    </article>
  );
}
