import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Logo from "./Logo";
import Icon from "./Icon";
export default function Navbar() {
  const [aberto, setAberto] = useState(false);
  const { autenticado, administrador, sair } = useAuth();
  return (
    <header className="header">
      <div className="nav-shell">
        <Logo />
        <button
          className="icon-button mobile-menu"
          onClick={() => setAberto(!aberto)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
        >
          <Icon name="menu" />
        </button>
        <nav
          aria-label="Navegação principal"
          className={aberto ? "nav open" : "nav"}
          onClick={() => setAberto(false)}
        >
          <NavLink to="/">Início</NavLink>
          <NavLink to="/buscar">Explorar mapa</NavLink>
          <NavLink to="/favoritos">Favoritos</NavLink>
          <NavLink to="/sobre">Sobre o projeto</NavLink>
          {administrador && <NavLink to="/admin">Administração</NavLink>}
        </nav>
        <div className="nav-actions">
          {autenticado ? (
            <>
              <Link
                className="icon-button"
                to="/conta"
                aria-label="Minha conta"
              >
                <Icon name="user" />
              </Link>
              <button className="text-button" onClick={sair}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="button outline small" to="/login">
                Entrar
              </Link>
              <Link className="button small" to="/cadastro">
                Criar conta <Icon name="arrow" size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
