import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Icon from "../components/Icon";
import useRemote from "../hooks/useRemote";
import Feedback from "../components/Feedback";
import Card from "../components/CardEstabelecimento";
const categorias = [
  ["food", "Restaurantes"],
  ["health", "Saúde"],
  ["bus", "Transporte"],
  ["park", "Lazer"],
  ["building", "Educação"],
  ["map", "Todos os locais"],
];
export default function Home() {
  const remote = useRemote("/estabelecimentos?limite=3");
  const categoriasRemote = useRemote("/categorias");
  function destinoCategoria(label) {
    const termos = {
      Restaurantes: "Restaurante",
      Saúde: "Hospital",
      Transporte: "Transporte",
      Lazer: "Parque",
      Educação: "Escola",
    };
    const categoria = categoriasRemote.data?.dados?.find(
      (c) => c.nome === termos[label],
    );
    return categoria ? "/buscar?categoriaId=" + categoria.id : "/buscar";
  }
  return (
    <>
      <section className="hero">
        <div className="hero-photo" />
        <div className="hero-content">
          <span className="pill">
            <span className="dot" /> A cidade é de todos. O caminho também.
          </span>
          <h1>
            Mapeando
            <br />
            acessibilidade,
            <br />
            <em>conectando pessoas.</em>
          </h1>
          <p>
            Encontre lugares realmente acessíveis.
            <br />
            Viva a cidade com mais autonomia e menos barreiras.
          </p>
          <SearchBar />
          <div className="hero-categories">
            {categorias.map(([icon, label]) => (
              <Link key={label} to={destinoCategoria(label)}>
                <span>
                  <Icon name={icon} />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-note">
          <Icon name="access" />
          <span>
            Mais autonomia.
            <br />
            <strong>Novos caminhos.</strong>
          </span>
        </div>
      </section>
      <div className="impact-strip">
        <div>
          <Icon name="pin" />
          <span>
            <strong>Encontre seu lugar</strong>Informação para ir mais longe
          </span>
        </div>
        <div>
          <Icon name="user" />
          <span>
            <strong>Feito em comunidade</strong>Experiências que conectam
          </span>
        </div>
        <div>
          <Icon name="access" />
          <span>
            <strong>Diferentes necessidades</strong>Acessibilidade em cada
            detalhe
          </span>
        </div>
        <div>
          <Icon name="heart" />
          <span>
            <strong>Uma cidade mais inclusiva</strong>Começa com todos nós
          </span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DESCUBRA NOVAS POSSIBILIDADES</span>
            <h2>Seu próximo destino, sem barreiras.</h2>
            <p>Conheça os locais e confira os recursos antes de sair.</p>
          </div>
          <Link className="text-link" to="/buscar">
            Explorar o mapa <Icon name="arrow" size={18} />
          </Link>
        </div>
        <Feedback {...remote} empty={!remote.data?.dados?.length}>
          <div className="cards-grid">
            {remote.data?.dados?.map((local) => (
              <Card key={local.id} local={local} />
            ))}
          </div>
        </Feedback>
      </section>
      <section className="how-section" id="como-funciona">
        <div className="container">
          <span className="eyebrow">SIMPLES. COLABORATIVO. PARA TODOS.</span>
          <h2>Mais liberdade em três passos.</h2>
          <div className="steps">
            {[
              [
                "01",
                "Encontre",
                "Busque um lugar e filtre pelos recursos de acessibilidade que você precisa.",
                "search",
              ],
              [
                "02",
                "Conheça",
                "Confira as informações e avaliações compartilhadas pela comunidade.",
                "eye",
              ],
              [
                "03",
                "Faça parte",
                "Indique locais, compartilhe experiências e ajude mais pessoas a chegar.",
                "heart",
              ],
            ].map(([n, title, desc, icon]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <Icon name={icon} size={30} />
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="contribute container">
        <div>
          <span className="eyebrow">CADA CONTRIBUIÇÃO ABRE UM CAMINHO</span>
          <h2>Conhece um lugar acessível?</h2>
          <p>Ajude outras pessoas a descobrir a cidade com confiança.</p>
        </div>
        <Link to="/adicionar-local" className="button">
          Indicar um local <Icon name="plus" />
        </Link>
      </section>
    </>
  );
}
