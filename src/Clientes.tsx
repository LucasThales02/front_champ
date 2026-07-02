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
    <>
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-people"></i>
          </span>

          <div>
            <p className="eyebrow mb-1">Clientes</p>

            <h1 className="h3 mb-1">Gerenciamento de Clientes</h1>

            <p className="text-muted mb-0">
              Cadastre, renove e gerencie seus clientes.
            </p>
          </div>
        </div>
      </div>

      {/* CADASTRO */}

      <div className="panel mb-4">
        <div className="panel-header">
          <h2 className="h5 mb-0 section-title">
            <i className="bi bi-person-plus"></i>
            <span>Novo Cliente</span>
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
            <input
              type="number"
              min="1"
              max="12"
              className="form-control"
              value={quantidadeCreditos}
              onChange={(e) => {
                const valor = Number(e.target.value);

                setQuantidadeCreditos(valor);

                calcularExpiracao(valor);
              }}
            />
          </div>

          <div className="col-12">
            <small className="text-muted">
              Expiração:{' '}
              {dataCalculada
                ? new Date(dataCalculada).toLocaleDateString()
                : '-'}
            </small>
          </div>

          <div className="col-12">
            <button className="btn btn-primary" onClick={adicionarCliente}>
              <i className="bi bi-plus-circle"></i> Adicionar Cliente
            </button>
          </div>
        </div>
      </div>

      {/* LISTA */}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-table"></i>
              <span>Clientes</span>
            </h2>

            <p className="text-muted mb-0">Lista completa de clientes.</p>
          </div>

          <input
            className="form-control table-search"
            placeholder="Pesquisar email..."
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Expiração</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes
                .filter((c) =>
                  c.email.toLowerCase().includes(filtroEmail.toLowerCase())
                )
                .map((c) => {
                  const vencido =
                    c.data_expiracao && new Date(c.data_expiracao) < new Date();

                  return (
                    <tr key={c.id} className={vencido ? 'table-danger' : ''}>
                      <td>
                        <strong>{c.nome}</strong>
                      </td>

                      <td>{c.email}</td>

                      <td>
                        {c.ativo ? (
                          <span className="badge text-bg-success">Ativo</span>
                        ) : (
                          <span className="badge text-bg-danger">Inativo</span>
                        )}
                      </td>

                      <td>
                        {c.data_expiracao
                          ? new Date(c.data_expiracao).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => alterarStatus(c.id, c.ativo)}
                          >
                            {c.ativo ? 'Desativar' : 'Ativar'}
                          </button>

                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => adicionarCredito(c)}
                          >
                            +30 dias
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
