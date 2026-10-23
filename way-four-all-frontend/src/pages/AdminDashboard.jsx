import { Link } from "react-router-dom";
import useRemote from "../hooks/useRemote";
import Feedback from "../components/Feedback";
import Icon from "../components/Icon";
export default function AdminDashboard() {
  const remote = useRemote("/admin/dashboard");
  return (
    <main className="container page">
      <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
      <h1>
        Visão geral<span className="title-dot">.</span>
      </h1>
      <p className="page-description">
        Cuide da qualidade das informações da comunidade.
      </p>
      <Feedback {...remote}>
        <div className="stats-grid">
          {Object.entries(remote.data || {}).map(([nome, total]) => (
            <div className="panel stat" key={nome}>
              <Icon name={nome === "usuarios" ? "user" : "building"} />
              <strong>{total}</strong>
              <span>{nome}</span>
            </div>
          ))}
        </div>
      </Feedback>
      <div className="admin-links">
        <Link className="panel" to="/admin/locais">
          <Icon name="building" />
          <h3>Gerenciar estabelecimentos</h3>
          <p>Revise os dados e publique locais aprovados no mapa.</p>
          <span className="text-link">Ver estabelecimentos →</span>
        </Link>
        <Link className="panel" to="/admin/solicitacoes">
          <Icon name="pin" />
          <h3>Analisar contribuições</h3>
          <p>Aprove ou rejeite sugestões de locais e correções.</p>
          <span className="text-link">Ver solicitações →</span>
        </Link>
        <Link className="panel" to="/admin/avaliacoes">
          <Icon name="star" />
          <h3>Moderar avaliações</h3>
          <p>Revise os relatos antes de publicá-los.</p>
          <span className="text-link">Ver avaliações →</span>
        </Link>
      </div>
    </main>
  );
}
