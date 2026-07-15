import express from "express";
import cors from "cors";

import categoriaRoutes from "./routes/categoriaRoutes.js";
import estabelecimentoRoutes from "./routes/estabelecimentoRoutes.js";
import recursoRoutes from "./routes/recursoRoutes.js";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/", (request, response) => {
  return response.status(200).json({
    projeto: "Way Four All",
    mensagem: "API funcionando corretamente",
    rotas: {
      estabelecimentos: "/api/estabelecimentos",
      categorias: "/api/categorias",
      recursos: "/api/recursos",
    },
  });
});

app.use("/api/estabelecimentos", estabelecimentoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/recursos", recursoRoutes);

app.use((request, response) => {
  return response.status(404).json({
    erro: "Rota não encontrada",
  });
});

app.use(errorMiddleware);

export default app;
