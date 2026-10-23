import { Link } from "react-router-dom";
import Icon from "../components/Icon";
export default function Sobre() {
  return (
    <main className="container page narrow">
      <span className="eyebrow">NOSSO PROPÓSITO</span>
      <h1>
        O caminho é melhor
        <br />
        quando é para todos.
      </h1>
      <div className="about-lead">
        <Icon name="globe" size={100} />
        <p>
          O Way Four All conecta pessoas a informações de acessibilidade.
          Queremos ajudar você a conhecer os lugares antes de sair de casa,
          respeitando diferentes necessidades e formas de viver a cidade.
        </p>
      </div>
      <div className="panel prose">
        <h2>Informação que abre portas</h2>
        <p>
          Nosso mapa reúne estabelecimentos e recursos informados pela
          comunidade. As contribuições e avaliações passam por análise antes da
          publicação.
        </p>
        <h2>A sua experiência importa</h2>
        <p>
          Você pode indicar um novo local, sugerir uma correção ou compartilhar
          como foi sua visita. Cada informação ajuda outra pessoa a planejar seu
          caminho.
        </p>
        <h2>Confirme antes de ir</h2>
        <p>
          A infraestrutura dos locais pode mudar. Os registros não substituem
          uma avaliação técnica nem garantem a acessibilidade de todo o
          percurso. Consulte o estabelecimento sobre suas necessidades
          específicas.
        </p>
        <Link to="/adicionar-local" className="button">
          Faça parte dessa construção
        </Link>
      </div>
    </main>
  );
}
