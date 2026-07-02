import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Teste {
  id: string;
  nome: string;
  email: string;
  senha: string;
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

  async function copiarLista(teste: Teste) {
    const url = `https://thtitecno.onrender.com/get.php?user=${teste.nome}&pass=${teste.senha}`;

    await navigator.clipboard.writeText(url);

    alert('✅ Lista M3U copiada');
  }

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
    <>
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-plus"></i>
          </span>

          <div>
            <p className="eyebrow mb-1">Testes</p>

            <h1 className="h3 mb-1">Testes Gratuitos</h1>

            <p className="text-muted mb-0">Gerencie usuários de avaliação.</p>
          </div>
        </div>
      </div>

      {/* NOVO TESTE */}

      <div className="panel mb-4">
        <div className="panel-header">
          <h2 className="h5 mb-0 section-title">
            <i className="bi bi-person-plus"></i>
            <span>Criar Teste</span>
          </h2>
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <input
              type="password"
              className="form-control"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value)}
            >
              <option value="">Selecione o plano</option>

              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={criarTeste}>
              Criar Teste
            </button>
          </div>
        </div>
      </div>

      {/* LISTA */}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-clock-history"></i>
              <span>Testes Ativos</span>
            </h2>

            <p className="text-muted mb-0">
              Controle dos usuários de avaliação.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Expiração</th>
                <th>Lista M3U</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>

            <tbody>
              {testes.map((t) => {
                const vencido =
                  t.data_expiracao && new Date(t.data_expiracao) < new Date();

                return (
                  <tr key={t.id} className={vencido ? 'table-danger' : ''}>
                    <td>
                      <strong>{t.nome}</strong>
                    </td>

                    <td>{t.email}</td>

                    <td>
                      {t.ativo ? (
                        <span className="badge text-bg-success">Ativo</span>
                      ) : (
                        <span className="badge text-bg-danger">Expirado</span>
                      )}
                    </td>

                    <td>
                      {t.data_expiracao
                        ? new Date(t.data_expiracao).toLocaleString('pt-BR')
                        : '-'}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => copiarLista(t)}
                      >
                        <i className="bi bi-clipboard"></i> Copiar
                      </button>
                    </td>

                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => adicionar2Horas(t)}
                        >
                          +2 horas
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => excluirTeste(t.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
