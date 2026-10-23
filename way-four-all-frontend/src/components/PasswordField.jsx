import { useId, useState } from "react";
import Icon from "./Icon";
export default function PasswordField({
  label = "Senha",
  name = "senha",
  autoComplete = "current-password",
  minLength,
}) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <span className="password-field">
        <input
          id={id}
          required
          type={visivel ? "text" : "password"}
          name={name}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder="Digite sua senha"
        />
        <button
          type="button"
          className="icon-button"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          onClick={() => setVisivel(!visivel)}
        >
          <Icon name="eye" size={19} />
        </button>
      </span>
    </div>
  );
}
