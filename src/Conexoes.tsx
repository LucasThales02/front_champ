import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Conexoes() {
  const [conexoes, setConexoes] = useState<any[]>([]);

  useEffect(() => {
    carregarConexoes();

    // ✅ auto atualização a cada 5 segundos
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
      console.log('ERRO:', error);
    } else {
      console.log(data); // 👉 ajuda a confirmar se veio o email
      setConexoes(data || []);
    }
  }

  return (
    <div>
      <h2>Conexões Ativas</h2>

      {conexoes.length === 0 && <p>Nenhuma conexão ativa</p>}

      {conexoes.map((c) => (
        <div
          key={c.cliente_id}
          style={{
            border: '1px solid #ccc',
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            background: '#f9f9f9',
          }}
        >
          <strong>{c.nome_cliente}</strong>
          <br />
          E-mail: {c.email_cliente}
          <br />
          IP: {c.ip}
          <br />
          Início:{' '}
          {new Date(c.inicio).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
          })}
        </div>
      ))}
    </div>
  );
}
