import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  data_expiracao?: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [planos, setPlanos] = useState<any[]>([]);
  const [planoId, setPlanoId] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [quantidadeCreditos, setQuantidadeCreditos] = useState(1);
  const [dataCalculada, setDataCalculada] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
    carregarPlanos();
    calcularExpiracao(1);
  }, []);

  function calcularExpiracao(qtd: number) {
    const hoje = new Date();
    const novaData = new Date();

    novaData.setDate(hoje.getDate() + qtd * 30);

    setDataCalculada(novaData.toISOString());
  }

  // ✅ CARREGAR CLIENTES
  async function carregarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('tipo', 'cliente')
      .order('nome', { ascending: true });

    if (error) return;

    const hoje = new Date();

    const atualizados = await Promise.all(
      (data || []).map(async (c: Cliente) => {
        if (c.data_expiracao && new Date(c.data_expiracao) < hoje && c.ativo) {
          await supabase
            .from('clientes')
            .update({ ativo: false })
            .eq('id', c.id);

          return { ...c, ativo: false };
        }

        return c;
      })
    );

    setClientes(atualizados);
  }

  // ✅ CARREGAR PLANOS
  async function carregarPlanos() {
    const { data } = await supabase.from('planos').select('*');
    setPlanos(data || []);
  }

  // ✅ CADASTRO
  async function adicionarCliente() {
    if (!nome || !email || !senha || !planoId) {
      alert('Preencha tudo');
      return;
    }

    const { error } = await supabase.from('clientes').insert([
      {
        nome,
        email,
        senha,
        plano_id: planoId,
        ativo: true,
        tipo: 'cliente',
        data_expiracao: dataCalculada,
        dias: quantidadeCreditos * 30,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert('✅ Cliente cadastrado');

    setNome('');
    setEmail('');
    setSenha('');
    setPlanoId('');
    setQuantidadeCreditos(1);

    carregarClientes();
  }

  // ✅ ATIVAR / DESATIVAR
  async function alterarStatus(id: string, statusAtual: boolean) {
    let updateData: any = {};

    if (statusAtual) {
      updateData = { ativo: false };
    } else {
      const novaData = new Date();
      novaData.setDate(new Date().getDate() + 30);

      updateData = {
        ativo: true,
        data_expiracao: novaData.toISOString(),
      };
    }

    await supabase.from('clientes').update(updateData).eq('id', id);

    carregarClientes();
  }

  // ✅ +30 DIAS (CRÉDITO)
  async function adicionarCredito(cliente: Cliente) {
    let base = new Date();

    if (cliente.data_expiracao) {
      const dataAtual = new Date(cliente.data_expiracao);

      if (dataAtual > new Date()) {
        base = dataAtual;
      }
    }

    const novaData = new Date(base);
    novaData.setDate(base.getDate() + 30);

    const { error } = await supabase
      .from('clientes')
      .update({
        data_expiracao: novaData.toISOString(),
        ativo: true,
      })
      .eq('id', cliente.id);

    if (!error) {
      alert('✅ +30 dias adicionados');
      carregarClientes();
    }
  }

  return (
    <div>
      <h2>Clientes</h2>

      {/* FORM */}
      <div
        style={{
          marginBottom: 20,
          display: '-ms-flexbox',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
          maxWidth: 800,
        }}
      >
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <br />
        <select
          value={planoId}
          onChange={(e) => setPlanoId(e.target.value)}
          style={{
            padding: 5,
            margin: 5,
          }}
        >
          <option value="">Selecione um plano</option>
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        <br />
        <label>
          Créditos:
          <input
            type="number"
            min="1"
            max="12"
            value={quantidadeCreditos}
            onChange={(e) => {
              const valor = Number(e.target.value);
              setQuantidadeCreditos(valor);
              calcularExpiracao(valor);
            }}
            style={{ marginLeft: 10 }}
          />
        </label>

        {dataCalculada && (
          <p>Expiração: {new Date(dataCalculada).toLocaleDateString()}</p>
        )}
        <button onClick={adicionarCliente}>Adicionar</button>
      </div>

      <hr />

      <input
        placeholder="Pesquisar por email"
        value={filtroEmail}
        onChange={(e) => setFiltroEmail(e.target.value)}
        style={{
          width: '93%',
          padding: 5,
          marginBottom: 5,
        }}
      />
      <br />

      {/* LISTA */}
      {clientes
        .filter((c) =>
          c.email.toLowerCase().includes(filtroEmail.toLowerCase())
        )
        .map((c) => {
          const hoje = new Date();
          const vencido = c.data_expiracao && new Date(c.data_expiracao) < hoje;

          return (
            <div
              key={c.id}
              style={{
                border: '1px solid #ccc',
                padding: 10,
                marginBottom: 10,
                background: vencido ? '#ffe6e6' : '#fff',
              }}
            >
              <strong>{c.nome}</strong>
              <br />
              Email: {c.email}
              <br />
              Status: {c.ativo ? 'Ativo ✅' : 'Inativo ❌'}
              <br />
              Expiração:{' '}
              {c.data_expiracao
                ? new Date(c.data_expiracao).toLocaleDateString()
                : 'N/A'}
              <br />
              <br />
              <button onClick={() => alterarStatus(c.id, c.ativo)}>
                {c.ativo ? 'Desativar' : 'Ativar +30'}
              </button>
              <button onClick={() => adicionarCredito(c)}>+30 dias</button>
            </div>
          );
        })}
    </div>
  );
}
