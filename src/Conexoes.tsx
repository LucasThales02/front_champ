import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Conexoes() {
  const [conexoes, setConexoes] = useState<any[]>([]);

  useEffect(() => {
    carregarConexoes();

    const interval = setInterval(() => {
      carregarConexoes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function carregarConexoes() {
    const { data, error } = await supabase
      .from('conexoes')
      .select('*')
      .eq('ativo', true)
      .order('inicio', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setConexoes(data || []);
  }

  return (
    <>
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-broadcast"></i>
          </span>

          <div>
            <p className="eyebrow mb-1">Monitoramento</p>

            <h1 className="h3 mb-1">Conexões Ativas</h1>

            <p className="text-muted mb-0">
              Clientes conectados neste momento.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {conexoes.length === 0 && (
          <div className="col-12">
            <div className="panel text-center py-5">
              <i className="bi bi-wifi-off fs-1 text-muted"></i>

              <h5 className="mt-3">Nenhuma conexão ativa</h5>
            </div>
          </div>
        )}

        {conexoes.map((c) => (
          <div key={c.cliente_id} className="col-12 col-md-6 col-xl-4">
            <div className="metric-card metric-primary">
              <div className="metric-top">
                <span className="metric-label">ONLINE</span>

                <span className="metric-icon">
                  <i className="bi bi-broadcast"></i>
                </span>
              </div>

              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  marginTop: '15px',
                }}
              >
                {c.nome_cliente}
              </div>

              <div className="metric-meta">
                <span>
                  <strong>E-mail:</strong> {c.email_cliente}
                </span>
              </div>

              <div className="metric-meta">
                <span>
                  <strong>IP:</strong> {c.ip}
                </span>
              </div>

              <div className="metric-meta">
                <span>
                  <strong>Início:</strong>{' '}
                  {new Date(c.inicio).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
