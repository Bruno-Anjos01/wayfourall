import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
export default function SearchBar({
  initial = "",
  onSearch,
  placeholder = "Busque lugares, bairros ou cidades…",
}) {
  const navigate = useNavigate();
  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const busca = new FormData(event.currentTarget).get("busca").trim();
        if (onSearch) onSearch(busca);
        else navigate("/buscar?busca=" + encodeURIComponent(busca));
      }}
    >
      <Icon name="search" />
      <input
        name="busca"
        aria-label="Buscar locais"
        placeholder={placeholder}
        defaultValue={initial}
      />
      <button className="button" type="submit" aria-label="Buscar locais">
        <Icon name="search" />
        <span>Buscar</span>
      </button>
    </form>
  );
}
