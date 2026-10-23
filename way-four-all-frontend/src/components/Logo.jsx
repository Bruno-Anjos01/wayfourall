import { Link } from "react-router-dom";
export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Way Four All — início">
      <span className="brand-symbol" aria-hidden="true">
        <img
          src="/images/logo-way-four-all.png"
          alt=""
          width="1254"
          height="1254"
        />
      </span>
      <span className="brand-wordmark" aria-hidden="true">
        <img
          src="/images/logo-way-four-all.png"
          alt=""
          width="1254"
          height="1254"
        />
      </span>
    </Link>
  );
}
