import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Icon from "../components/Icon";
const opcoes = [
  ["Cadeirante", "Rampas, elevadores e espaços acessíveis", "access"],
  ["Deficiência visual", "Informação tátil e sinalização", "eye"],
  ["Deficiência auditiva", "Comunicação visual e Libras", "user"],
  ["Baixa visão", "Boa iluminação e contraste", "eye"],
  ["Mobilidade reduzida", "Acesso facilitado e apoio", "access"],
  ["Deficiência intelectual", "Informações simples e claras", "heart"],
  ["Pessoas idosas", "Ambientes acolhedores e adaptados", "user"],
];
function Preferencias({ usuario }) {
  const key = "@wayfourall:preferencias:" + usuario.id;
  const [escolhidas, setEscolhidas] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });
  const [msg, setMsg] = useState("");
  return (
    <section className="panel">
      <h2>Preferências de acessibilidade</h2>
      <p>Escolha os recursos que são importantes para você.</p>
      <div className="preference-grid">
        {opcoes.map(([nome, desc, icon]) => (
          <label
            key={nome}
            className={
              "preference " + (escolhidas.includes(nome) ? "selected" : "")
            }
          >
            <Icon name={icon} />
            <span>
              <strong>{nome}</strong>
              <small>{desc}</small>
            </span>
            <input
              type="checkbox"
              checked={escolhidas.includes(nome)}
              onChange={(e) => {
                setMsg("");
                setEscolhidas(
                  e.target.checked
                    ? [...escolhidas, nome]
                    : escolhidas.filter((v) => v !== nome),
                );
              }}
            />
          </label>
        ))}
      </div>
      <p className="muted">
        Estas preferências ficam salvas somente neste navegador. Os filtros do
        mapa são escolhidos na busca.
      </p>
      {msg && (
        <p role="status" className="alert">
          {msg}
        </p>
      )}
      <button
        className="button"
        onClick={() => {
          try {
            localStorage.setItem(key, JSON.stringify(escolhidas));
            setMsg("Preferências salvas neste navegador.");
          } catch {
            setMsg(
              "Não foi possível salvar. Verifique as permissões de armazenamento do navegador.",
            );
          }
        }}
      >
        Salvar preferências
      </button>
    </section>
  );
}
export default function Conta() {
  const { usuario, sair } = useAuth();
  const [tab, setTab] = useState("perfil");
  return (
    <main className="container page">
      <span className="eyebrow">SEU ESPAÇO</span>
      <h1>
        Minha conta<span className="title-dot">.</span>
      </h1>
      <div className="account-grid">
        <aside className="panel account-menu">
          <button
            className={tab === "perfil" ? "active" : ""}
            onClick={() => setTab("perfil")}
          >
            <Icon name="user" />
            Meu perfil
          </button>
          <button
            className={tab === "preferencias" ? "active" : ""}
            onClick={() => setTab("preferencias")}
          >
            <Icon name="access" />
            Acessibilidade
          </button>
          <Link to="/favoritos">
            <Icon name="heart" />
            Meus favoritos
          </Link>
          <Link to="/minhas-solicitacoes">
            <Icon name="pin" />
            Minhas contribuições
          </Link>
          <Link to="/privacidade">
            <Icon name="shield" />
            Privacidade
          </Link>
          <button onClick={sair} className="danger">
            <Icon name="out" />
            Sair da conta
          </button>
        </aside>
        {tab === "perfil" ? (
          <section className="panel profile">
            <div className="avatar">
              {usuario.nome.slice(0, 1).toUpperCase()}
            </div>
            <span className="eyebrow">BOM TER VOCÊ AQUI</span>
            <h2>{usuario.nome}</h2>
            <p>{usuario.email}</p>
            <dl>
              <dt>Tipo de conta</dt>
              <dd>
                {usuario.perfil === "admin"
                  ? "Administrador"
                  : "Membro da comunidade"}
              </dd>
            </dl>
            <p className="muted">
              Os dados do perfil são exibidos conforme seu cadastro. Edição de
              perfil e recuperação de senha ainda não estão disponíveis no
              serviço.
            </p>
            <Link to="/adicionar-local" className="button">
              Contribuir com um novo local
            </Link>
          </section>
        ) : (
          <Preferencias key={usuario.id} usuario={usuario} />
        )}
      </div>
    </main>
  );
}
