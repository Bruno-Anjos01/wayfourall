import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
      throw new Error('Configure JWT_SECRET com pelo menos 32 bytes aleatórios');
    }
    await pool.query("SELECT 1");

    console.log("Conexão com o PostgreSQL realizada com sucesso.");

    const server = app.listen(PORT, () => {
      console.log(`Servidor executando em http://localhost:${PORT}`);
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => {
        const timeout = setTimeout(() => process.exit(1), 10000);
        timeout.unref();
        server.close(async () => {
          await pool.end();
          clearTimeout(timeout);
        });
      });
    }
  } catch (error) {
    console.error("Não foi possível iniciar o servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();
