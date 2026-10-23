import { useSearchParams } from "react-router-dom";
import useRemote from "../hooks/useRemote";
import SearchBar from "../components/SearchBar";
import Feedback from "../components/Feedback";
import Card from "../components/CardEstabelecimento";
import Mapa from "../components/Mapa";
import Icon from "../components/Icon";
export default function Buscar() {
  const [params, setParams] = useSearchParams();
  const remote = useRemote("/estabelecimentos?" + params.toString());
  const categorias = useRemote("/categorias");
  const recursos = useRemote("/recursos");
  const pagina = Number(params.get("pagina") || 1);
  function filtro(campo, valor) {
    const next = new URLSearchParams(params);
    next.delete("pagina");
    if (valor) next.set(campo, valor);
    else next.delete(campo);
    setParams(next);
  }
  return (
    <main className="explore">
      <div className="explore-toolbar">
        <div>
          <span className="eyebrow">VÁ MAIS LONGE</span>
          <h1>Encontre seu próximo lugar.</h1>
        </div>
        <SearchBar
          initial={params.get("busca") || ""}
          onSearch={(v) => filtro("busca", v)}
        />
      </div>
      <div className="explore-grid">
        <aside className="filters">
          <h3>
            <Icon name="filter" /> Refine sua busca
          </h3>
          <label>
            Categoria
            <select
              value={params.get("categoriaId") || ""}
              onChange={(e) => filtro("categoriaId", e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categorias.data?.dados?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Acessibilidade
            <select
              value={params.get("recursoId") || ""}
              onChange={(e) => filtro("recursoId", e.target.value)}
            >
              <option value="">Todos os recursos</option>
              {recursos.data?.dados?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cidade
            <input
              defaultValue={params.get("cidade") || ""}
              key={params.get("cidade") || ""}
              placeholder="Ex.: São Paulo"
              onBlur={(e) => filtro("cidade", e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </label>
          <button className="text-link" onClick={() => setParams({})}>
            Limpar filtros
          </button>
          <div className="tip">
            <Icon name="shield" />
            <strong>Planeje com confiança</strong>
            <p>
              Confira os recursos informados e, se necessário, confirme as
              condições com o local.
            </p>
          </div>
        </aside>
        <Mapa locais={remote.data?.dados || []} />
        <section className="results">
          <div className="result-title">
            <h3>Locais encontrados</h3>
            <span>{remote.data?.dados?.length ?? "—"} nesta página</span>
          </div>
          <Feedback {...remote} empty={!remote.data?.dados?.length}>
            {remote.data?.dados?.map((local) => (
              <Card key={local.id} local={local} />
            ))}
          </Feedback>
          <div className="pagination">
            <button
              className="button outline small"
              disabled={pagina <= 1 || remote.loading}
              onClick={() =>
                setParams((p) => {
                  p.set("pagina", pagina - 1);
                  return p;
                })
              }
            >
              Anterior
            </button>
            <span>{pagina}</span>
            <button
              className="button outline small"
              disabled={
                remote.loading ||
                !remote.data?.dados ||
                remote.data.dados.length < 10
              }
              onClick={() =>
                setParams((p) => {
                  p.set("pagina", pagina + 1);
                  return p;
                })
              }
            >
              Próxima
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
