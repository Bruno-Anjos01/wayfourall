import { useEffect, useState } from "react";
import api from "../services/api";
export function mensagemErro(error) {
  return (
    error.response?.data?.mensagem ||
    error.response?.data?.erro ||
    "Não foi possível conectar ao servidor. Tente novamente em instantes."
  );
}
export default function useRemote(url) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ key: "", data: null, error: "" });
  const key = url + ":" + version;
  useEffect(() => {
    const controller = new AbortController();
    api
      .get(url, { signal: controller.signal })
      .then(({ data }) => setState({ key, data, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ key, data: null, error: mensagemErro(error) });
      });
    return () => controller.abort();
  }, [url, key]);
  return {
    data: state.key === key ? state.data : null,
    loading: state.key !== key,
    error: state.key === key ? state.error : "",
    retry: () => setVersion((value) => value + 1),
  };
}
