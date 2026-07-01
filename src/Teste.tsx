import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Teste {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  data_expiracao?: string;
}

export default function Teste() {
  const [testes, setTestes] = useState<Teste[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [planos, setPlanos] = useState<any[]>([]);
  const [planoId, setPlanoId] = useState('');

  useEffect(() => {
    carregarTestes();
    carregarPlanos();
  }, []);

  async function excluirTeste(id: string) {
    const confirmar = confirm('Deseja realmente excluir este teste?');

    if (!confirmar) return;

    const { error } = await supabase.from('clientes').delete().eq('id', id);

    if (error) {
      alert('Erro ao excluir');
    } else {
      alert('✅ Teste excluído');
      carregarTestes();
    }
  }

  // ✅ CARREGAR PLANOS
  async function carregarPlanos() {
    const { data } = await supabase.from('planos').select('*');
    setPlanos(data || []);
  }

  // ✅ CARREGAR TESTES
  async function carregarTestes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('tipo', 'teste')
      .order('nome', { ascending: true });

    if (error) return;

    const hoje = new Date();

    const atualizados = await Promise.all(
      (data || []).map(async (c: Teste) => {
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

    setTestes(atualizados);
  }

  // ✅ CRIAR TESTE (4 HORAS)
  async function criarTeste() {
    if (!nome || !email || !senha || !planoId) {
      alert('Preencha todos os campos');
      return;
    }

    const agora = new Date();
    const expira = new Date(agora.getTime() + 4 * 60 * 60 * 1000);

    const { error } = await supabase.from('clientes').insert([
      {
        nome,
        email,
        senha,
        plano_id: planoId,
        ativo: true,
        tipo: 'teste',
        dias: 1,
        data_expiracao: expira.toISOString(),
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('✅ Teste criado (4 horas)');
      setNome('');
      setEmail('');
      setSenha('');
      setPlanoId('');
      carregarTestes();
    }
  }

  // ✅ +2 HORAS
  async function adicionar2Horas(cliente: Teste) {
    const agora = Date.now();

    let baseTime = agora;

    if (cliente.data_expiracao) {
      const dataBanco = new Date(cliente.data_expiracao).getTime();

      if (dataBanco > agora) {
        baseTime = dataBanco;
      }
    }

    // ✅ soma exatamente 2 horas (em ms)
    const novaData = new Date(baseTime + 2 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('clientes')
      .update({
        data_expiracao: novaData.toISOString(),
        ativo: true,
      })
      .eq('id', cliente.id);

    if (!error) {
      alert('✅ +2 horas funcionando corretamente');
      carregarTestes();
    }
  }

  return (
    <div>
      <h2>Teste</h2>

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
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

        <button onClick={criarTeste}>Criar Teste (4h)</button>
      </div>

      <hr />

      {/* LISTA */}
      {testes.map((t) => {
        const agora = new Date();
        const vencido = t.data_expiracao && new Date(t.data_expiracao) < agora;

        return (
          <div
            key={t.id}
            style={{
              border: '1px solid #ccc',
              padding: 10,
              marginBottom: 10,
              background: vencido ? '#ffe6e6' : '#fff',
            }}
          >
            <strong>{t.nome}</strong>
            <br />
            Email: {t.email}
            <br />
            Status: {t.ativo ? 'Ativo ✅' : 'Inativo ❌'}
            <br />
            Expiração:{' '}
            {t.data_expiracao
              ? new Date(t.data_expiracao).toLocaleString()
              : 'N/A'}
            <br />
            <br />
            <button onClick={() => adicionar2Horas(t)}>+2 horas</button>
            <button
              onClick={() => excluirTeste(t.id)}
              style={{ marginLeft: 10, background: 'red', color: 'white' }}
            >
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}
