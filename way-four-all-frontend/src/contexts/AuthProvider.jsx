import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AuthContext from "./authContext";
const TOKEN = "@wayfourall:token";
const USER = "@wayfourall:usuario";
export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN));
  const [carregando, setCarregando] = useState(() =>
    Boolean(localStorage.getItem(TOKEN)),
  );
  const sair = useCallback(() => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
    setUsuario(null);
    setToken(null);
    setCarregando(false);
  }, []);
  useEffect(() => {
    let ativo = true;
    if (token)
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (ativo) setUsuario(data.usuario);
        })
        .catch((error) => {
          if (ativo && error.response?.status === 401) sair();
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    return () => {
      ativo = false;
    };
  }, [token, sair]);
  useEffect(() => {
    window.addEventListener("wfa:unauthorized", sair);
    return () => window.removeEventListener("wfa:unauthorized", sair);
  }, [sair]);
  const entrar = useCallback(async (email, senha) => {
    const { data } = await api.post("/auth/login", { email, senha });
    localStorage.setItem(TOKEN, data.token);
    localStorage.setItem(USER, JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }, []);
  const valor = useMemo(
    () => ({
      usuario,
      token,
      carregando,
      entrar,
      sair,
      autenticado: Boolean(token && usuario),
      administrador: usuario?.perfil === "admin",
    }),
    [usuario, token, carregando, entrar, sair],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
