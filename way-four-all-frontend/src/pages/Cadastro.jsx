import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { mensagemErro } from "../hooks/useRemote";
import PasswordField from "../components/PasswordField";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
export default function Cadastro() {
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const [criado, setCriado] = useState(false);
  const navigate = useNavigate();
  const { entrar } = useAuth();
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("senha") !== form.get("confirmar")) {
      setErro("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    setErro("");
    try {
      await api.post("/auth/cadastro", {
        nome: form.get("nome"),
        email: form.get("email"),
        senha: form.get("senha"),
      });
      setCriado(true);
      try {
        await entrar(form.get("email"), form.get("senha"));
        navigate("/conta");
      } catch {
        setErro(
          "Sua conta foi criada. Entre com seu e-mail e senha para continuar.",
        );
      }
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page register-page">
      <section className="auth-card">
        <Logo />
        <h2>
          O mundo fica melhor
          <br />
          com você por aqui.
        </h2>
        <p>Crie sua conta. É rápido e gratuito.</p>
        <form onSubmit={submit}>
          <label>
            Nome completo
            <input
              name="nome"
              required
              minLength={2}
              maxLength={150}
              autoComplete="name"
              placeholder="Como podemos chamar você?"
            />
          </label>
          <label>
            E-mail
            <input
              name="email"
              required
              type="email"
              maxLength={150}
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </label>
          <PasswordField
            label="Crie uma senha"
            minLength={8}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirme sua senha"
            name="confirmar"
            minLength={8}
            autoComplete="new-password"
          />
          <small>Use no mínimo 8 caracteres (máximo de 72 bytes).</small>
          <label className="checkbox">
            <input required type="checkbox" />
            Li as informações de{" "}
            <Link to="/privacidade">privacidade e uso</Link>.
          </label>
          {erro && (
            <p className="alert error" role="alert">
              {erro}
            </p>
          )}
          <button className="button full" disabled={busy || criado}>
            {busy
              ? "Criando conta…"
              : criado
                ? "Conta criada"
                : "Criar minha conta"}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="auth-bottom">
          Já faz parte? <Link to="/login">Faça login</Link>
        </p>
      </section>
      <aside className="register-aside">
        <div className="big-symbol">
          <Icon name="globe" size={120} />
        </div>
        <span className="eyebrow">JUNTOS, VAMOS MAIS LONGE</span>
        <h2>
          Acessibilidade tem
          <br />
          muitas formas.
          <br />
          <em>A sua também importa.</em>
        </h2>
        <p>
          Salve seus lugares preferidos, avalie suas experiências e contribua
          para uma cidade que acolhe a todos.
        </p>
        <div className="benefit">
          <Icon name="heart" /> Seus favoritos em um só lugar
        </div>
        <div className="benefit">
          <Icon name="pin" /> Novos locais para descobrir
        </div>
        <div className="benefit">
          <Icon name="access" /> Preferências do seu jeito
        </div>
      </aside>
    </main>
  );
}
