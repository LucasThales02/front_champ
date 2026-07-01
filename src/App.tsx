import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Clientes from './Clientes';
import Teste from './Teste';
import Conexoes from './Conexoes';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [pagina, setPagina] = useState('conexoes');
  const [menuAberto, setMenuAberto] = useState(true);

  useEffect(() => {
    verificarSessao();
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

    if (!error) {
      verificarSessao();
    } else {
      alert('Email ou senha inválidos');
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  function renderConteudo() {
    switch (pagina) {
      case 'clientes':
        return <Clientes />;

      case 'conexoes':
        return <Conexoes />;

      case 'teste':
        return <Teste />;

      default:
        return <Conexoes />;
    }
  }

  // ==========================
  // PAINEL LOGADO
  // ==========================
  if (usuario) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 9999,
          }}
        >
          ☰
        </button>

        {menuAberto && (
          <aside className="sidebar">
            <img
              src="/logo.png"
              alt="ChampPlay"
              className="logo-menu"
            />

            <p onClick={() => setPagina('conexoes')}>
              📡 Conexões Ativas
            </p>

            <p onClick={() => setPagina('clientes')}>
              👤 Clientes
            </p>

            <p onClick={() => setPagina('teste')}>
              🧪 Criar Teste
            </p>

            <hr style={{ margin: '20px 0' }} />

            <button className="btn" onClick={logout}>
              Sair
            </button>
          </aside>
        )}

        <main
          style={{
            flex: 1,
            padding: '20px',
          }}
        >
          {renderConteudo()}
        </main>
      </div>
    );
  }

  // ==========================
  // LOGIN
  // ==========================
  return (
    <div className="login-container">
      <img
        src="/ogo.png"
        alt="ChampPlay"
        className="logo-login"
      />

      <h1>Login</h1>
      <br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button className="btn" onClick={login}>
        Entrar
      </button>
    </div>
  );
}

export default App;
