export default function Feedback({ loading, error, empty, children, retry }) {
  if (loading)
    return (
      <div className="feedback" role="status">
        <span className="spinner" /> Buscando informações…
      </div>
    );
  if (error)
    return (
      <div className="feedback error" role="alert">
        <strong>Não foi possível carregar</strong>
        <p>{error}</p>
        {retry && (
          <button className="button outline" onClick={retry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  if (empty)
    return (
      <div className="feedback">
        <strong>Nenhum resultado por aqui ainda</strong>
        <p>Tente outros filtros ou contribua indicando um novo local.</p>
      </div>
    );
  return children;
}
