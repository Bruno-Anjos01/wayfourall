import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await pool.query("SELECT 1");

    console.log("Conexão com o PostgreSQL realizada com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor executando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível iniciar o servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();