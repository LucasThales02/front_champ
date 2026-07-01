import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Clientes from './Clientes';
import Teste from './Teste';
import Conexoes from './Conexoes';

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [pagina, setPagina] = useState('dashboard');
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

    if (!error) verificarSessao();
    else alert('Erro no login');
  }

  async function logout() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  // ✅ TELAS (AGORA LIMPO E CORRETO)
  function renderConteudo() {
    if (pagina === 'dashboard') return <h2>Dashboard</h2>;
    if (pagina === 'clientes') return <Clientes />;
    if (pagina === 'conexoes') return <Conexoes />;
    if (pagina === 'teste') return <Teste />;
    if (pagina === 'revendedores') return <h2>Revendedores</h2>;
    if (pagina === 'config') return <h2>Configurações</h2>;
  }

  // ✅ DASHBOARD
  if (usuario) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1000,
          }}
        >
          ☰
        </button>

        {menuAberto && (
          <aside
            style={{
              width: 150,
              background: '#1e1e2f',
              color: 'white',
              padding: 20,
              minHeight: '200vh',
            }}
          >
            <h2
              style={{ color: 'white', marginBottom: 30, textAlign: 'center' }}
            >
              Champ Play
            </h2>

            <p onClick={() => setPagina('conexoes')}>Conexões ativas</p>
            <p onClick={() => setPagina('teste')}>Criar teste</p>
            <p onClick={() => setPagina('clientes')}>Clientes</p>

            <hr />

            <button onClick={logout}>Sair</button>
          </aside>
        )}

        <main
          style={{
            flex: 1,
            padding: 20,
            marginLeft: menuAberto ? 0 : 0,
          }}
        >
          {renderConteudo()}
        </main>
      </div>
    );
  }

  // ✅ LOGIN
  return (
    <div className="login-container">
      <img
        src="/logo.png"
        alt="ChampPlay"
        className="logo"
      />
      <br />
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <br />
      <br />

      <button onClick={login}>Entrar</button>
    </div>
  );
}

export default App;
