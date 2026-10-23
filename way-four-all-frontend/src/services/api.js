import axios from "axios";

const CHAVE_TOKEN = "@wayfourall:token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(CHAVE_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (erro) => Promise.reject(erro),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== "/auth/login")
      window.dispatchEvent(new Event("wfa:unauthorized"));
    return Promise.reject(error);
  },
);
export default api;
