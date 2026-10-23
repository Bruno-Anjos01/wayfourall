import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { mensagemErro } from "../hooks/useRemote";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import PasswordField from "../components/PasswordField";
export default function Login() {
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErro("");
    const form = new FormData(event.currentTarget);
    try {
      const user = await entrar(form.get("email"), form.get("senha"));
      const destino = location.state?.redirecionarPara;
      navigate(
        destino?.startsWith("/") && !destino.startsWith("//")
          ? destino
          : user.perfil === "admin"
            ? "/admin"
            : "/buscar",
        { replace: true },
      );
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-decoration">
        <Icon name="globe" size={500} />
      </div>
      <div className="auth-intro">
        <span className="eyebrow">SEU PRÓXIMO CAMINHO COMEÇA AQUI</span>
        <h1>
          Uma cidade inteira.
          <br />
          <em>Mais possibilidades.</em>
        </h1>
        <p>
          Seus lugares favoritos e suas contribuições,
          <br />
          sempre com você.
        </p>
      </div>
      <section className="auth-card">
        <Logo />
        <h2>Bem-vindo(a) de volta!</h2>
        <p>Acesse sua conta para continuar.</p>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </label>
          <PasswordField />
          {erro && (
            <p className="alert error" role="alert">
              {erro}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="auth-bottom">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
        <Link to="/" className="back-link">
          ← Voltar ao início
        </Link>
      </section>
    </main>
  );
}
