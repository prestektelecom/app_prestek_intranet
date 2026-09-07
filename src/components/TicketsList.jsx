import { useState, useEffect, useMemo } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import ResponsiveTable from './responsive/ResponsiveTable';
import FilterBar from './responsive/FilterBar';
import { fundoHero } from './ui/heroGradiente';

// Paleta Bento Blue Prestek (alinhada com Dashboard/Serviços/Escala/Escritórios/Processos)

function tone(hex, a) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

function truncateText(texto, maxLength = 150) {
  if (!texto || typeof texto !== 'string') return '';
  const trimmed = texto.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 3) + '...';
}

function parseTicketMessage(texto) {
  if (!texto || typeof texto !== 'string') return '';

  // Normalizar quebras de linha e espaços excessivos
  const normalized = texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Extrair conteúdo entre o primeiro e segundo delimitador de = (3 ou mais)
  const match = normalized.match(/={3,}\s*([\s\S]*?)\s*={3,}/);

  if (match) {
    const content = match[1];
    const lines = content.split('\n')
      .map((line) => {
        // Remover labels de seção em maiúsculas no início da linha (ex: "DESCREVA A SITUAÇÃO: ")
        return line.replace(/^[A-ZÀ-Ú0-9\s/()-]+:\s*/i, '').trim();
      })
      .filter((line) => {
        if (!line) return false;
        // Remover metadados de solicitante
        if (line.toLowerCase().startsWith('solicitante:')) return false;
        if (line.toLowerCase().startsWith('solicitação:')) return false;
        if (line.toLowerCase().startsWith('observação:')) return false;
        if (line.toLowerCase().startsWith('obs:')) return false;
        return true;
      });

    const clean = lines.join(' ').trim();
    return truncateText(clean, 150);
  }

  // Fallback: mensagem sem delimitadores de template
  return truncateText(normalized, 150);
}

function formatTicketDate(row) {
  // Campo de data de agendamento da OS
  if (row.data_agenda) {
    const date = new Date(row.data_agenda);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
  }

  // Fallback: extrair data do protocolo quando no formato YYYYMMDD...
  if (row.protocolo && /^\d{8}/.test(row.protocolo)) {
    const p = row.protocolo;
    const y = p.slice(0, 4);
    const m = p.slice(4, 6);
    const d = p.slice(6, 8);
    return `${d}/${m}/${y}`;
  }

  return '—';
}

const OPEN_STATUSES = ['AG', 'A', 'AS', 'EN', 'AN', 'EX'];

function getStatusCategory(status) {
  const s = String(status).toUpperCase();
  if (s === 'F') return 'finalizado';
  if (s === 'C') return 'cancelado';
  if (OPEN_STATUSES.includes(s)) return 'aberto';
  return 'pendente';
}

const STATUS_FILTERS = [
  { key: 'aberto', label: 'Abertos' },
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'todos', label: 'Todos' },
];

const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

function KpiTile({ label, value, icon }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="material-symbols-outlined shrink-0 text-white/70 text-[18px]" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <div className={LABEL_MONO}>{label}</div>
        <div className="mt-0.5 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">{value}</div>
      </div>
    </div>
  );
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
    <div
      className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
      style={{
        background: fundoHero(C),
        boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
      }}
    >
      <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
        <defs>
          <pattern id="tickets-hero-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tickets-hero-grid)" />
      </svg>

      <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
        <div className="flex flex-col gap-4 2xl:col-span-6">
          <div>
            <div className={LABEL_MONO}>Suporte Técnico</div>
            <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
              Meus Chamados
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
              Acompanhe o status de todos os seus chamados de suporte abertos no sistema.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
          <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
            <span className={LABEL_MONO}>Status</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map(k => <KpiTile key={k.label} {...k} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const C = useBentoTheme();
  const category = getStatusCategory(status);
  const config =
    category === 'finalizado' ? { label: 'Finalizado', bg: C.successSoft, text: C.success } :
    category === 'cancelado' ? { label: 'Cancelado', bg: C.dangerSoft, text: C.danger } :
    category === 'aberto' ? { label: 'Aberto', bg: C.accentSoft, text: C.accentDeep } :
    { label: 'Pendente', bg: C.warningSoft, text: C.warning };

  return (
    <span
      className="px-2.5 py-1 inline-flex text-xs leading-5 font-extrabold rounded-full"
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
  const [activeFilter, setActiveFilter] = useState('aberto');

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
    abertos: tickets.filter(t => getStatusCategory(t.status) === 'aberto').length,
    finalizados: tickets.filter(t => getStatusCategory(t.status) === 'finalizado').length,
    pendentes: tickets.filter(t => {
      const cat = getStatusCategory(t.status);
      return cat !== 'aberto' && cat !== 'finalizado';
    }).length,
  }), [tickets]);

  const filteredTickets = useMemo(() => {
    if (activeFilter === 'todos') return tickets;
    return tickets.filter(t => getStatusCategory(t.status) === activeFilter);
  }, [tickets, activeFilter]);

  return (
    <main
      className="flex-1 overflow-y-auto py-6 px-4 md:px-10"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}
    >
      <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-6">
        <TicketsHero
          total={total}
          abertos={abertos}
          finalizados={finalizados}
          pendentes={pendentes}
        />

        <div
          className="rounded-[20px] overflow-hidden shadow-sm flex-1 flex flex-col"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <span
                className="w-10 h-10 border-4 rounded-full animate-spin"
                style={{ borderColor: C.accentSoft, borderTopColor: C.accent }}
              />
              <p className="font-bold animate-pulse" style={{ color: C.ink2 }}>
                Buscando chamados no IXC...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <span className="material-symbols-outlined text-6xl" style={{ color: C.danger }}>error</span>
              <div className="space-y-1" title={error}>
                <p className="font-extrabold text-lg" style={{ color: C.ink }}>Não foi possível carregar seus chamados</p>
                <p style={{ color: C.ink2 }}>Tente novamente em instantes. Se o problema continuar, avise a TI.</p>
              </div>
              <button
                onClick={fetchTickets}
                className="mt-2 px-6 py-2 text-sm font-bold hover:brightness-110 text-white rounded-lg transition-all"
                style={{
                  background: `linear-gradient(to right, ${C.accentDeep}, ${C.accent})`,
                  boxShadow: `0 4px 12px ${tone(C.accent, 0.3)}`,
                }}
              >
                Tentar Novamente
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <span className="material-symbols-outlined text-6xl" style={{ color: C.muted }}>confirmation_number</span>
              <div className="space-y-1">
                <p className="font-extrabold text-lg" style={{ color: C.ink }}>Nenhum chamado encontrado.</p>
                <p style={{ color: C.ink2 }}>Você ainda não abriu nenhum chamado de suporte.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 md:px-6 md:py-4 border-b" style={{ borderColor: C.line }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-xl" style={{ color: C.ink }}>Chamados</h2>
                  <FilterBar
                    activeFilters={activeFilter === 'todos' ? [] : [STATUS_FILTERS.find(f => f.key === activeFilter)?.label]}
                    onClear={() => setActiveFilter('todos')}
                  >
                    {STATUS_FILTERS.map(filter => {
                      const isActive = activeFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          onClick={() => setActiveFilter(filter.key)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                          style={{
                            background: isActive ? C.accent : C.surfaceSoft,
                            color: isActive ? C.surface : C.ink2,
                            border: `1px solid ${isActive ? C.accent : C.line}`,
                          }}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </FilterBar>
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
                  <span className="material-symbols-outlined text-5xl" style={{ color: C.muted }}>filter_list</span>
                  <div className="space-y-1">
                    <p className="font-extrabold text-lg" style={{ color: C.ink }}>Nenhum chamado neste filtro.</p>
                    <p style={{ color: C.ink2 }}>Tente outro status ou visualize todos.</p>
                  </div>
                  <button
                    onClick={() => setActiveFilter('todos')}
                    className="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                    style={{
                      background: C.accentSoft,
                      color: C.accentDeep,
                    }}
                  >
                    Ver todos
                  </button>
                </div>
              ) : (
                <div className="p-2 md:p-4">
                  <ResponsiveTable
                    columns={[
                      { key: 'id', header: 'ID', render: (v, row) => <span className="font-extrabold" style={{ color: C.accent }}>#{v || row.id}</span> },
                      { key: 'mensagem', header: 'Assunto', fullWidth: true, render: (v) => (
                        <span className="font-bold text-xs line-clamp-2" style={{ color: C.ink2 }}>{parseTicketMessage(v) || 'Suporte de TI'}</span>
                      )},
                      { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} /> },
                      { key: 'data_agenda', header: 'Data', render: (_v, row) => (
                        <span className="text-sm whitespace-nowrap" style={{ color: C.ink2 }}>{formatTicketDate(row)}</span>
                      )},
                    ]}
                    rows={filteredTickets}
                    keyExtractor={(row) => row.id}
                    cardTitle={(row) => parseTicketMessage(row.mensagem) || 'Suporte de TI'}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}