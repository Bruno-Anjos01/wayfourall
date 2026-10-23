import { useEffect } from "react";
import AdminLocais from "../pages/AdminLocais";
import AdicionarLocal from "../pages/AdicionarLocal";
import Conta from "../pages/Conta";
import Rota from "../pages/Rota";
import Sobre from "../pages/Sobre";
import Privacidade from "../pages/Privacidade";
import AdminAvaliacoes from "../pages/AdminAvaliacoes";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

import AdminDashboard from "../pages/AdminDashboard.jsx";
import AdminSolicitacoes from "../pages/AdminSolicitacoes.jsx";
import Buscar from "../pages/Buscar.jsx";
import Cadastro from "../pages/Cadastro.jsx";
import Estabelecimento from "../pages/Estabelecimento.jsx";
import Favoritos from "../pages/Favoritos.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import MinhasSolicitacoes from "../pages/MinhasSolicitacoes.jsx";
import NotFound from "../pages/NotFound.jsx";

import useAuth from "../hooks/useAuth.js";

function TelaDeCarregamento() {
  return (
    <main className="pagina-carregamento" aria-busy="true" aria-live="polite">
      <div className="pagina-carregamento__indicador" aria-hidden="true" />

      <p>Carregando...</p>
    </main>
  );
}

function LayoutPrincipal() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const titulos = {
      "/": "A cidade é para todos",
      "/buscar": "Explorar mapa",
      "/login": "Entrar",
      "/cadastro": "Criar conta",
      "/favoritos": "Meus favoritos",
      "/conta": "Minha conta",
      "/adicionar-local": "Indicar local",
      "/minhas-solicitacoes": "Minhas contribuições",
      "/admin": "Administração",
      "/sobre": "Sobre o projeto",
      "/privacidade": "Privacidade",
    };
    document.title =
      (titulos[pathname] || "Explore novos caminhos") + " | Way Four All";
  }, [pathname]);
  return (
    <div className="app-layout">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar />

      <div id="conteudo" className="app-layout__conteudo">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

function RotaPrivada() {
  const { autenticado, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <TelaDeCarregamento />;
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirecionarPara: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  return <Outlet />;
}

function RotaAdministrador() {
  const { autenticado, administrador, carregando } = useAuth();

  const location = useLocation();

  if (carregando) {
    return <TelaDeCarregamento />;
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirecionarPara: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  if (!administrador) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function RotaSomenteVisitantes() {
  const { autenticado, administrador, carregando } = useAuth();

  if (carregando) {
    return <TelaDeCarregamento />;
  }

  if (autenticado) {
    return <Navigate to={administrador ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<LayoutPrincipal />}>
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/rota/:id" element={<Rota />} />
        <Route path="/" element={<Home />} />

        <Route path="/buscar" element={<Buscar />} />

        <Route path="/estabelecimentos/:id" element={<Estabelecimento />} />

        <Route element={<RotaSomenteVisitantes />}>
          <Route path="/login" element={<Login />} />

          <Route path="/cadastro" element={<Cadastro />} />
        </Route>

        <Route element={<RotaPrivada />}>
          <Route path="/conta" element={<Conta />} />
          <Route path="/adicionar-local" element={<AdicionarLocal />} />
          <Route path="/favoritos" element={<Favoritos />} />

          <Route path="/minhas-solicitacoes" element={<MinhasSolicitacoes />} />
        </Route>

        <Route element={<RotaAdministrador />}>
          <Route path="/admin/locais" element={<AdminLocais />} />
          <Route path="/admin/avaliacoes" element={<AdminAvaliacoes />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/solicitacoes" element={<AdminSolicitacoes />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
