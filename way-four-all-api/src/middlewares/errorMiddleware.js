export function errorMiddleware(error, request, response, next) {
  console.error(error);

  return response.status(error.statusCode || 500).json({
    erro: error.message || "Erro interno do servidor",
  });
}
