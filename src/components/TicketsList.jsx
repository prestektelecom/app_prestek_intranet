import { useState, useEffect, useMemo } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import ResponsiveTable from './responsive/ResponsiveTable';

// Paleta Bento Blue Prestek (alinhada com Dashboard/Serviços/Escala/Escritórios/Processos)

function tone(hex, a) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

function TicketsHero({ total, abertos, finalizados, pendentes }) {
  const C = useBentoTheme();
  const kpis = [
    { label: 'Total', value: total, icon: 'confirmation_number' },
    { label: 'Abertos', value: abertos, icon: 'check_circle' },
    { label: 'Finalizados', value: finalizados, icon: 'task_alt' },
    { label: 'Pendentes', value: pendentes, icon: 'hourglass_empty' },
  ];

  return (
    <div style={{
      background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
      borderRadius: 24,
      padding: '28px 32px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
    }}>
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width="100%" height="100%">
        <defs>
          <pattern id="tickets-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tickets-hero-grid)" />
      </svg>
      <div style={{ position: 'absolute', top: -100, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -80, right: 60, width: 180, height: 180, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)' }} />

      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 11px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
          fontSize: 11.5, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7FD8B8' }} />
          Suporte Técnico
        </div>
        <h1 style={{ margin: '14px 0 6px', fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
          Meus Chamados
        </h1>
        <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5, maxWidth: 560 }}>
          Acompanhe o status de todos os seus tickets de suporte abertos no sistema.
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
            </div>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>{kpi.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const C = useBentoTheme();
  const config =
    status === 'F' ? { label: 'Finalizado', bg: C.successSoft, text: C.success } :
    status === 'T' ? { label: 'Aberto', bg: C.accentSoft, text: C.accentDeep } :
    { label: 'Pendente', bg: C.warningSoft, text: C.warning };

  return (
    <span
      className="px-2.5 py-1 inline-flex text-xs leading-5 font-black rounded-full"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

export default function TicketsList({ user }) {
    const C = useBentoTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ixc/su-ticket/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaborador_id: user?.funcionario?.id }),
      });

      if (!res.ok) throw new Error('Falha ao buscar chamados.');

      const data = await res.json();
      if (data.sucesso) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.erro || 'Erro ao carregar lista.');
      }
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.funcionario?.id]);

  const { total, abertos, finalizados, pendentes } = useMemo(() => ({
    total: tickets.length,
    abertos: tickets.filter(t => t.status === 'T').length,
    finalizados: tickets.filter(t => t.status === 'F').length,
    pendentes: tickets.filter(t => t.status !== 'T' && t.status !== 'F').length,
  }), [tickets]);

  return (
    <main
      className="flex-1 overflow-y-auto py-6 px-4 md:px-10"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}
    >
      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-6">
        <TicketsHero
          total={total}
          abertos={abertos}
          finalizados={finalizados}
          pendentes={pendentes}
        />

        <div className="bg-white border border-[#E4ECF5] rounded-[20px] overflow-hidden shadow-sm flex-1 flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <span className="w-10 h-10 border-4 border-[#EAF4FF] border-t-[#4A9EF5] rounded-full animate-spin" />
              <p className="text-[#475467] font-bold animate-pulse">Buscando chamados no IXC...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <span className="material-symbols-outlined text-6xl text-[#E84545]">error</span>
              <div className="space-y-1">
                <p className="text-[#0B1B2E] font-black text-lg">Ops! Algo deu errado.</p>
                <p className="text-[#475467]">{error}</p>
              </div>
              <button
                onClick={fetchTickets}
                className="mt-2 px-6 py-2 text-sm font-bold bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:brightness-110 text-white rounded-lg shadow-md shadow-[#4A9EF5]/30 transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <span className="material-symbols-outlined text-6xl text-[#8896A8]">confirmation_number</span>
              <div className="space-y-1">
                <p className="text-[#0B1B2E] font-black text-lg">Nenhum chamado encontrado.</p>
                <p className="text-[#475467]">Você ainda não abriu nenhum ticket de suporte.</p>
              </div>
            </div>
          ) : (
            <div className="p-2 md:p-4">
              <ResponsiveTable
                columns={[
                  { key: 'id', header: 'ID', render: (v) => <span className="font-black text-[#4A9EF5]">#{v}</span> },
                  { key: 'protocolo', header: 'Protocolo', render: (v) => v || <span className="text-[#8896A8] italic">Aguardando...</span> },
                  { key: 'titulo', header: 'Assunto / Mensagem', fullWidth: true, render: (v, row) => (
                    <div>
                      <div className="font-bold truncate">{v || 'Suporte de TI'}</div>
                      <div className="text-[#475467] text-xs line-clamp-1">{row.menssagem}</div>
                    </div>
                  )},
                  { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} /> },
                  { key: 'data_cadastro', header: 'Data', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '--/--/--' },
                ]}
                rows={tickets}
                keyExtractor={(row) => row.id}
                cardTitle={(row) => row.titulo || 'Suporte de TI'}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}