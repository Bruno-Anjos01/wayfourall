export default function Pagination({ pagina, setPagina, quantidade, loading }) {
  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        disabled={pagina === 1 || loading}
        onClick={() => setPagina(pagina - 1)}
      >
        ← Anterior
      </button>
      <span>Página {pagina}</span>
      <button
        disabled={quantidade !== 10 || loading}
        onClick={() => setPagina(pagina + 1)}
      >
        Próxima →
      </button>
    </nav>
  );
}
