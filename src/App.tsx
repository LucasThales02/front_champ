import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Clientes from './Clientes';
import Teste from './Teste';
import Conexoes from './Conexoes';

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [pagina, setPagina] = useState('conexoes');
  const [tema, setTema] = useState('light');

  useEffect(() => {
    verificarSessao();

    return () => {
      document.body.classList.remove('sidebar-mini');
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  useEffect(() => {
    const temaSalvo = localStorage.getItem('adminHMD.colorTheme');

    const temaInicial = temaSalvo === 'dark' ? 'dark' : 'light';

    setTema(temaInicial);

    document.documentElement.setAttribute('data-theme', temaInicial);

    document.documentElement.setAttribute('data-bs-theme', temaInicial);
  }, []);

  async function verificarSessao() {
    const { data } = await supabase.auth.getSession();

    setUsuario(data.session?.user ?? null);
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert('Email ou senha inválidos');
      return;
    }

    verificarSessao();
  }

  async function logout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  function toggleSidebar() {
    if (window.innerWidth >= 992) {
      document.body.classList.toggle('sidebar-mini');
    } else {
      document.body.classList.toggle('sidebar-open');
    }
  }

  function fecharSidebarMobile() {
    document.body.classList.remove('sidebar-open');
  }

  function alternarTema() {
    const novoTema = tema === 'dark' ? 'light' : 'dark';

    setTema(novoTema);

    document.documentElement.setAttribute('data-theme', novoTema);

    document.documentElement.setAttribute('data-bs-theme', novoTema);

    localStorage.setItem('adminHMD.colorTheme', novoTema);
  }

  function renderConteudo() {
    switch (pagina) {
      case 'clientes':
        return <Clientes />;

      case 'teste':
        return <Teste />;

      case 'conexoes':
        return <Conexoes />;

      default:
        return <Conexoes />;
    }
  }

  // ====================
  // LOGIN
  // ====================

  if (!usuario) {
    return (
      <div className="auth-page">
        <div className="navbar-actions ms-auto">
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={alternarTema}
            title="Alterar tema"
          >
            <i
              className={tema === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'}
            ></i>
          </button>
        </div>
        <div className="auth-card">
          <div className="text-center mb-4">
            <img
              src="/assets/images/brand/logo/logo.png"
              alt="ChampPlay"
              style={{
                width: '280px',
                maxWidth: '100%',
              }}
            />
          </div>

          <h2 className="text-center mb-4">Login</h2>

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-4"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button className="btn btn-primary w-100" onClick={login}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ====================
  // PAINEL
  // ====================

  return (
    <div className="admin-shell">
      <div className="sidebar-backdrop" onClick={fecharSidebarMobile}></div>

      <aside className="admin-sidebar" id="adminSidebar">
        <div className="sidebar-header">
          <a
            href="#"
            className="brand-mark"
            onClick={(e) => e.preventDefault()}
          >
            <span className="brand-copy">
              <img
                src="/assets/images/brand/logo/logo.png"
                alt="ChampPlay"
                style={{
                  width: '180px',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#"
            className={`nav-link ${pagina === 'conexoes' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setPagina('conexoes');
              fecharSidebarMobile();
            }}
          >
            <span className="nav-icon">
              <i className="bi bi-broadcast"></i>
            </span>

            <span className="nav-text">Conexões</span>
          </a>

          <a
            href="#"
            className={`nav-link ${pagina === 'clientes' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setPagina('clientes');
              fecharSidebarMobile();
            }}
          >
            <span className="nav-icon">
              <i className="bi bi-people"></i>
            </span>

            <span className="nav-text">Clientes</span>
          </a>

          <a
            href="#"
            className={`nav-link ${pagina === 'teste' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setPagina('teste');
              fecharSidebarMobile();
            }}
          >
            <span className="nav-icon">
              <i className="bi bi-person-plus"></i>
            </span>

            <span className="nav-text">Criar Teste</span>
          </a>
        </nav>

        <div className="sidebar-user">
          <strong>{usuario.email}</strong>
          <small>Administrador</small>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-primary w-100" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <nav className="navbar admin-navbar navbar-expand bg-white">
          <div className="container-fluid px-3 px-lg-4">
            <button
              className="sidebar-toggle"
              type="button"
              onClick={toggleSidebar}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="ms-3">
              <h5 className="mb-0 fw-bold">ChampPlay</h5>
            </div>

            <div className="navbar-actions ms-auto">
              <button
                className="icon-button theme-toggle"
                type="button"
                onClick={alternarTema}
                title="Alterar tema"
              >
                <i
                  className={tema === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'}
                ></i>
              </button>

              <span className="ms-3">{usuario.email}</span>
            </div>
          </div>
        </nav>

        <main className="dashboard-content">
          <div className="container-fluid px-3 px-lg-4 py-4">
            {renderConteudo()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
