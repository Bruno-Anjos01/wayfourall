import adminEstabelecimentoRoutes from './modules/estabelecimentos/adminEstabelecimentoRoutes.js';
import avaliacoesRoutes from './avaliacoes/avaliacoesRoutes.js';
import favoritoRoutes from './modules/favoritos/favoritoRoutes.js';
import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/authRoutes.js";
import categoriaRoutes from "./modules/categorias/categoriaRoutes.js";
import estabelecimentoRoutes from "./modules/estabelecimentos/estabelecimentoRoutes.js";
import recursoRoutes from "./modules/recursos/recursoRoutes.js";
import solicitacaoRoutes from "./modules/solicitacoes/solicitacaoRoutes.js";
import adminSolicitacaoRoutes from "./modules/solicitacoes/adminSolicitacaoRoutes.js";
import dashboardRoutes from "./modules/dashboard/dashboardRoutes.js";

import { falha, sucesso } from "./utils/response.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(value => value.trim()),
  }),
);

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (['POST', 'PUT', 'PATCH'].includes(request.method) &&
      (!request.body || typeof request.body !== 'object' || Array.isArray(request.body))) {
    return falha(response, { status: 400, mensagem: 'Envie um objeto JSON no corpo da requisição' });
  }
  next();
});
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/favoritos', favoritoRoutes);

app.get("/", (request, response) => {
  return sucesso(response, {
    mensagem: "API funcionando corretamente",
    dados: {
      projeto: "Way Four All",
      rotas: {
        autenticacao: "/api/auth",
        estabelecimentos: "/api/estabelecimentos",
        categorias: "/api/categorias",
        recursos: "/api/recursos",
        solicitacoesUsuario: "/api/solicitacoes",
        solicitacoesAdmin: "/api/admin/solicitacoes",
        dashboard: "/api/admin/dashboard",
      },
    },
  });
});

app.use('/api/admin/estabelecimentos', adminEstabelecimentoRoutes);
app.use("/api/auth", authRoutes);

app.use(
  "/api/estabelecimentos",
  estabelecimentoRoutes,
);

app.use(
  "/api/categorias",
  categoriaRoutes,
);

app.use(
  "/api/recursos",
  recursoRoutes,
);

app.use(
  "/api/solicitacoes",
  solicitacaoRoutes,
);

app.use(
  "/api/admin/solicitacoes",
  adminSolicitacaoRoutes,
);

app.use("/api/admin/dashboard", dashboardRoutes);

app.use((request, response) => {
  return falha(response, {
    status: 404,
    mensagem: "Rota não encontrada",
  });
});

app.use(errorMiddleware);

export default app;
