import { Link } from "react-router-dom";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="footer">
      <Logo />
      <p>Uma cidade melhor começa com um caminho para todos.</p>
      <div>
        <Link to="/sobre">Sobre</Link>
        <Link to="/privacidade">Privacidade</Link>
        <span>© {new Date().getFullYear()} Way Four All</span>
      </div>
    </footer>
  );
}
