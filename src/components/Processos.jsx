import { useState, useMemo, useEffect } from 'react';
import { CATEGORIAS, PROCESSOS, STATUS_CONFIG } from '../data/processosData';
import { useBentoTheme } from '../hooks/useBentoTheme';

// Paleta Bento Blue Prestek (alinhada com Dashboard/Serviços/Escala/Escritórios)

function tone(hex, a) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function contarPorCategoria(lista) {
    return lista.reduce((acc, p) => { acc[p.categoria] = (acc[p.categoria] || 0) + 1; return acc; }, {});
}

function percentualAtivosPorCategoria(lista) {
    const total = {};
    const ativos = {};
    lista.forEach(p => {
        total[p.categoria] = (total[p.categoria] || 0) + 1;
        if (p.status === 'ativo') ativos[p.categoria] = (ativos[p.categoria] || 0) + 1;
    });
    return Object.fromEntries(Object.keys(total).map(c => [c, Math.round(((ativos[c] || 0) / total[c]) * 100)]));
}

function gerarId(categoria, lista) {
    const cat = CATEGORIAS.find(c => c.id === categoria);
    const prefixo = cat?.prefixo || 'OP';
    const existentes = lista.filter(p => p.id.startsWith(prefixo + '-')).map(p => parseInt(p.id.split('-')[1], 10)).filter(n => !isNaN(n));
    const proximo = existentes.length ? Math.max(...existentes) + 1 : 1;
    return `${prefixo}-${String(proximo).padStart(3, '0')}`;
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho;
    return (
        <span className={`px-2.5 py-0.5 inline-flex text-[11px] leading-5 font-black uppercase tracking-wider rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

function ProcessosHero({ total, ativos, revisao, categorias, onAdd }) {
    const C = useBentoTheme();
    const kpis = [
        { label: 'Processos', value: total, icon: 'folder_open' },
        { label: 'Ativos', value: ativos, icon: 'check_circle' },
        { label: 'Em Revisão', value: revisao, icon: 'sync' },
        { label: 'Categorias', value: categorias, icon: 'grid_view' },
    ];

    return (
        <div style={{
            background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
            borderRadius: 24, padding: '28px 32px', color: 'white',
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
        }}>
            <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width="100%" height="100%">
                <defs><pattern id="processos-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#processos-hero-grid)" />
            </svg>
            <div style={{ position: 'absolute', top: -100, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: -80, right: 60, width: 180, height: 180, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)' }} />

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ maxWidth: 560 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 11px', borderRadius: 999,
                        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                        fontSize: 11.5, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7FD8B8' }} />
                        Procedimentos Internos
                    </div>
                    <h1 style={{ margin: '14px 0 6px', fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
                        Processos Operacionais
                    </h1>
                    <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5 }}>
                        Gerencie e visualize procedimentos internos, fluxos de trabalho e POPs para todos os departamentos.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <button onClick={onAdd} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 10,
                        background: C.surface, color: C.accentDeep,
                        fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: 'none',
                    }}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Novo Processo
                    </button>
                </div>
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

const FORM_VAZIO = {
    nome: '',
    descricao: '',
    categoria: 'atendimento',
    status: 'ativo',
    versao: '1.0',
    docUrl: '',
    responsavelNome: '',
    etapas: '',
    tempoEstimado: '',
    tags: '',
};

function ProcessoModal({ processo, onSalvar, onFechar }) {
    const isEdicao = Boolean(processo?.id);
    const [form, setForm] = useState(() => {
        if (!processo) return FORM_VAZIO;
        return {
            nome: processo.nome,
            descricao: processo.descricao,
            categoria: processo.categoria,
            status: processo.status,
            versao: processo.versao,
            docUrl: processo.docUrl || '',
            responsavelNome: processo.responsavel?.nome || '',
            etapas: processo.etapas ?? '',
            tempoEstimado: processo.tempoEstimado || '',
            tags: (processo.tags || []).join(', '),
        };
    });
    const [erro, setErro] = useState('');

    function set(campo, valor) {
        setForm(f => ({ ...f, [campo]: valor }));
        setErro('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.nome.trim()) return setErro('O nome do processo é obrigatório.');
        if (!form.descricao.trim()) return setErro('A descrição é obrigatória.');
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        const payload = {
            ...(processo || {}),
            nome: form.nome.trim(),
            descricao: form.descricao.trim(),
            categoria: form.categoria,
            status: form.status,
            versao: form.versao.trim() || '1.0',
            docUrl: form.docUrl.trim() || null,
            responsavel: {
                nome: form.responsavelNome.trim() || 'Não informado',
                setor: CATEGORIAS.find(c => c.id === form.categoria)?.label || '',
                funcionario_id: processo?.responsavel?.funcionario_id ?? null,
            },
            etapas: form.etapas !== '' ? Number(form.etapas) : null,
            tempoEstimado: form.tempoEstimado.trim() || '—',
            tags,
            ultimaAtualizacao: new Date().toISOString().split('T')[0],
        };
        onSalvar(payload);
    }

    const inputCls = "w-full px-3 py-2 border border-[#E4ECF5] rounded-lg bg-[#F7FAFD] text-[#0B1B2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all";
    const labelCls = "block text-[10px] font-black text-[#475467] uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0B1B2E]/60 backdrop-blur-sm" onClick={onFechar} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#E4ECF5]">
                {/* Header do modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4ECF5] bg-[#F7FAFD]">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#EAF4FF] p-2 rounded-lg">
                            <span className="material-symbols-outlined text-[#4A9EF5] text-xl">
                                {isEdicao ? 'edit' : 'add_circle'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-[#0B1B2E] font-black text-lg">
                                {isEdicao ? 'Editar Processo' : 'Novo Processo'}
                            </h2>
                            {isEdicao && (
                                <p className="text-xs text-[#8896A8] font-mono">{processo.id}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onFechar} className="text-[#8896A8] hover:text-[#E84545] p-1 rounded-full hover:bg-[var(--danger-soft)] transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Corpo do formulário */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Nome do Processo *</label>
                            <input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Onboarding de Clientes" />
                        </div>

                        <div>
                            <label className={labelCls}>Categoria *</label>
                            <select className={inputCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                                {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Status *</label>
                            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Descrição *</label>
                            <textarea className={`${inputCls} resize-none`} rows={3} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva o objetivo e escopo deste processo..." />
                        </div>

                        <div>
                            <label className={labelCls}>Versão</label>
                            <input className={inputCls} value={form.versao} onChange={e => set('versao', e.target.value)} placeholder="1.0" />
                        </div>

                        <div>
                            <label className={labelCls}>Responsável</label>
                            <input className={inputCls} value={form.responsavelNome} onChange={e => set('responsavelNome', e.target.value)} placeholder="Ex: Coordenador de TI" />
                        </div>

                        <div>
                            <label className={labelCls}>Nº de Etapas</label>
                            <input className={inputCls} type="number" min="0" value={form.etapas} onChange={e => set('etapas', e.target.value)} placeholder="Ex: 5" />
                        </div>

                        <div>
                            <label className={labelCls}>Tempo Estimado</label>
                            <input className={inputCls} value={form.tempoEstimado} onChange={e => set('tempoEstimado', e.target.value)} placeholder="Ex: 30min" />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Link do Google Docs (POP)</label>
                            <input className={inputCls} type="url" value={form.docUrl} onChange={e => set('docUrl', e.target.value)} placeholder="https://docs.google.com/..." />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Tags (separadas por vírgula)</label>
                            <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Ex: IXC, cadastro, ativação" />
                        </div>
                    </div>

                    {erro && (
                        <p className="text-[#E84545] text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">error</span>
                            {erro}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#E4ECF5] bg-white flex justify-end gap-3">
                    <button type="button" onClick={onFechar} className="px-4 py-2 text-sm font-bold text-[#0B1B2E] border border-[#E4ECF5] rounded-lg hover:bg-[#F7FAFD] transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:brightness-110 text-white rounded-lg shadow-md shadow-[#4A9EF5]/30 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">{isEdicao ? 'save' : 'add'}</span>
                        {isEdicao ? 'Salvar Alterações' : 'Criar Processo'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

export default function Processos({ setCurrentView }) {
    const C = useBentoTheme();
    const [lista, setLista] = useState(PROCESSOS);
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
    const [pagina, setPagina] = useState(1);
    const [modal, setModal] = useState(null); // null | { modo: 'novo' } | { modo: 'editar', processo }

    const contagem = useMemo(() => contarPorCategoria(lista), [lista]);
    const percentuaisAtivos = useMemo(() => percentualAtivosPorCategoria(lista), [lista]);

    const processosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return lista.filter(p => {
            const matchCategoria = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
            const matchBusca = !termo
                || p.id.toLowerCase().includes(termo)
                || p.nome.toLowerCase().includes(termo)
                || p.descricao.toLowerCase().includes(termo)
                || p.tags.some(t => t.toLowerCase().includes(termo));
            return matchCategoria && matchBusca;
        });
    }, [busca, categoriaAtiva, lista]);

    const totalPaginas = Math.max(1, Math.ceil(processosFiltrados.length / ROWS_PER_PAGE));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const inicio = (paginaSegura - 1) * ROWS_PER_PAGE;
    const processosPagina = processosFiltrados.slice(inicio, inicio + ROWS_PER_PAGE);

    function handleCategoria(id) { setCategoriaAtiva(id); setPagina(1); }
    function handleBusca(e) { setBusca(e.target.value); setPagina(1); }

    function abrirNovo() { setModal({ modo: 'novo' }); }
    function abrirEditar(p) { setModal({ modo: 'editar', processo: p }); }
    function fecharModal() { setModal(null); }

    function salvarProcesso(payload) {
        if (modal.modo === 'novo') {
            const novoId = gerarId(payload.categoria, lista);
            setLista(prev => [{ ...payload, id: novoId }, ...prev]);
        } else {
            setLista(prev => prev.map(p => p.id === payload.id ? payload : p));
        }
        setModal(null);
    }

    // Fechar modal com Escape
    useEffect(() => {
        if (!modal) return;
        function onKey(e) { if (e.key === 'Escape') fecharModal(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modal]);

    const categoriasComContagem = CATEGORIAS.filter(c => c.id !== 'todos');

    const totalAtivos = lista.filter(p => p.status === 'ativo').length;
    const totalRevisao = lista.filter(p => p.status === 'revisao').length;

    return (
        <>
        {modal && (
            <ProcessoModal
                processo={modal.modo === 'editar' ? modal.processo : null}
                onSalvar={salvarProcesso}
                onFechar={fecharModal}
            />
        )}

        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1400px] mx-auto w-full overflow-y-auto no-scrollbar" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}>
            {/* Hero */}
            <ProcessosHero
                total={lista.length}
                ativos={totalAtivos}
                revisao={totalRevisao}
                categorias={categoriasComContagem.length}
                onAdd={abrirNovo}
            />

            {/* Ações secundárias */}
            <div className="mt-5 mb-6 flex flex-wrap justify-end gap-3">
                <button className="flex items-center gap-2 px-4 h-10 bg-white border border-[#E4ECF5] rounded-lg text-[#0B1B2E] text-sm font-bold shadow-sm hover:bg-[#F7FAFD] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Exportar Lista</span>
                </button>
            </div>

            {/* Barra de busca e filtros */}
            <div className="bg-white p-5 rounded-[20px] border border-[#E4ECF5] shadow-sm mb-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                    <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8896A8]">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-[#E4ECF5] rounded-lg leading-5 bg-[#F7FAFD] text-[#0B1B2E] placeholder:text-[#8896A8] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent sm:text-sm transition-all"
                            placeholder="Buscar por Nome, ID (ex: TI-001) ou tag..."
                            type="text"
                            value={busca}
                            onChange={handleBusca}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex gap-2 overflow-x-auto lg:overflow-visible lg:flex-wrap pb-2 lg:pb-0 no-scrollbar snap-x">
                            {CATEGORIAS.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoria(cat.id)}
                                    className={`snap-start shrink-0 lg:shrink flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap lg:whitespace-normal transition-all ${
                                        categoriaAtiva === cat.id
                                            ? 'bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white shadow-md shadow-[#4A9EF5]/20'
                                            : 'bg-[#F7FAFD] border border-[#E4ECF5] text-[#475467] hover:border-[#4A9EF5] hover:text-[#4A9EF5]'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${categoriaAtiva === cat.id ? 'text-white' : 'text-[#8896A8]'}`}>
                                        {cat.icon}
                                    </span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista Mobile (Cards) — oculta em md+ */}
            <div className="block md:hidden bg-white border border-[#E4ECF5] rounded-[20px] overflow-hidden shadow-sm mb-8">
                {processosPagina.length === 0 ? (
                    <p className="px-6 py-12 text-center text-[#8896A8] text-sm">
                        Nenhum processo encontrado para os filtros aplicados.
                    </p>
                ) : processosPagina.map(p => {
                    const podeAbrirDoc = p.status !== 'rascunho' && p.docUrl;
                    return (
                        <div
                            key={p.id}
                            onClick={() => abrirEditar(p)}
                            className="p-4 border-b border-[#E4ECF5] last:border-b-0 cursor-pointer hover:bg-[#F7FAFD] transition-colors"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono font-bold text-[#4A9EF5] text-sm">{p.id}</span>
                                <StatusBadge status={p.status} />
                            </div>
                            <h3 className="font-black text-[#0B1B2E] text-base leading-snug">{p.nome}</h3>
                            <p className="text-xs text-[#475467] mb-1">{p.responsavel.setor} · v{p.versao}</p>
                            <p className="text-sm text-[#475467] line-clamp-2 mb-3">{p.descricao}</p>
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => abrirEditar(p)}
                                    title="Editar processo"
                                    className="p-1.5 rounded-md text-[#8896A8] hover:text-[#4A9EF5] hover:bg-[#EAF4FF] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                {podeAbrirDoc ? (
                                    <a
                                        href={p.docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Abrir POP no Google Docs"
                                        className="p-1.5 rounded-md text-[#4A9EF5] hover:bg-[#EAF4FF] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                    </a>
                                ) : (
                                    <span className="p-1.5 text-[#8896A8] cursor-default" title="Rascunho — sem POP publicado">
                                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* Paginação mobile */}
                <div className="px-4 py-3 border-t border-[#E4ECF5] flex items-center justify-between bg-[#F7FAFD]">
                    <span className="text-xs font-bold text-[#475467]">
                        {processosFiltrados.length === 0 ? 0 : inicio + 1}–{Math.min(inicio + ROWS_PER_PAGE, processosFiltrados.length)} de {processosFiltrados.length}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaSegura === 1} className="px-3 py-1 border border-[#E4ECF5] rounded-lg text-sm font-bold text-[#475467] hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                        <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} className="px-3 py-1 border border-[#E4ECF5] rounded-lg text-sm font-bold text-[#0B1B2E] hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Próximo</button>
                    </div>
                </div>
            </div>

            {/* Tabela Desktop — oculta em mobile */}
            <div className="hidden md:flex bg-white border border-[#E4ECF5] rounded-[20px] overflow-hidden shadow-sm flex-1 flex-col mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F7FAFD] border-b border-[#E4ECF5]">
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest w-28">ID</th>
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest w-1/4">PROCESSO</th>
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest">DESCRIÇÃO</th>
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest w-24 text-center">VERSÃO</th>
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest w-36 text-center">STATUS</th>
                                <th className="px-6 py-4 text-[11px] font-black text-[#475467] uppercase tracking-widest w-28 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4ECF5] bg-white">
                            {processosPagina.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#8896A8] text-sm">
                                        Nenhum processo encontrado para os filtros aplicados.
                                    </td>
                                </tr>
                            ) : processosPagina.map(p => {
                                const podeAbrirDoc = p.status !== 'rascunho' && p.docUrl;
                                return (
                                    <tr
                                        key={p.id}
                                        onClick={() => abrirEditar(p)}
                                        className="hover:bg-[#EAF4FF] transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-[#4A9EF5]">{p.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#0B1B2E]">{p.nome}</div>
                                            <div className="text-xs text-[#475467] mt-0.5">{p.responsavel.setor}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#475467] max-w-xs">
                                            <span className="line-clamp-2" title={p.descricao}>{p.descricao}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#0B1B2E] font-medium">
                                            v{p.versao}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => abrirEditar(p)}
                                                    title="Editar processo"
                                                    className="p-1.5 rounded-md text-[#8896A8] hover:text-[#4A9EF5] hover:bg-[#EAF4FF] transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                {podeAbrirDoc ? (
                                                    <a
                                                        href={p.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Abrir POP no Google Docs"
                                                        className="p-1.5 rounded-md text-[#4A9EF5] hover:bg-[#EAF4FF] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                                    </a>
                                                ) : (
                                                    <span className="p-1.5 text-[#8896A8] cursor-default" title="Rascunho — sem POP publicado">
                                                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="px-6 py-4 border-t border-[#E4ECF5] flex items-center justify-between bg-[#F7FAFD]">
                    <span className="text-sm text-[#475467]">
                        Mostrando{' '}
                        <span className="font-bold text-[#0B1B2E]">
                            {processosFiltrados.length === 0 ? 0 : inicio + 1}
                        </span>{' '}
                        a{' '}
                        <span className="font-bold text-[#0B1B2E]">
                            {Math.min(inicio + ROWS_PER_PAGE, processosFiltrados.length)}
                        </span>{' '}
                        de{' '}
                        <span className="font-bold text-[#0B1B2E]">{processosFiltrados.length}</span>{' '}
                        resultado{processosFiltrados.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={paginaSegura === 1}
                            className="px-3 py-1 border border-[#E4ECF5] rounded-lg text-sm font-bold text-[#475467] hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaSegura === totalPaginas}
                            className="px-3 py-1 border border-[#E4ECF5] rounded-lg text-sm font-bold text-[#0B1B2E] hover:bg-[#EAF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de resumo por categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoriasComContagem.map(cat => {
                    const total = contagem[cat.id] || 0;
                    const pct = percentuaisAtivos[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => { handleCategoria(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="bg-white p-6 rounded-[20px] border border-[#E4ECF5] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group text-left"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-[#EAF4FF] p-3 rounded-[14px] text-[#4A9EF5] group-hover:bg-gradient-to-br group-hover:from-[#1F5BA8] group-hover:to-[#4A9EF5] group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <span className="text-3xl font-black text-[#0B1B2E]">{total}</span>
                            </div>
                            <h3 className="text-base font-bold text-[#0B1B2E] mb-1">{cat.label}</h3>
                            <p className="text-[#475467] text-xs">
                                {total === 0 ? 'Nenhum processo cadastrado' : `${total} processo${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
                            </p>
                            <div className="mt-4 w-full bg-[#F7FAFD] rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-[#475467] mt-2 text-right">{pct}% Ativos</p>
                        </button>
                    );
                })}
            </div>
        </main>
        </>
    );
}