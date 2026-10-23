import { Link } from "react-router-dom";
import Icon from "../components/Icon";
export default function NotFound() {
  return (
    <main className="not-found">
      <Icon name="map" size={70} />
      <span className="eyebrow">404 · CAMINHO NÃO ENCONTRADO</span>
      <h1>
        Vamos encontrar
        <br />
        uma nova direção?
      </h1>
      <p>Esta página não existe ou mudou de endereço.</p>
      <Link className="button" to="/">
        Voltar ao início <Icon name="arrow" />
      </Link>
    </main>
  );
}
