import { useState, useMemo, useEffect, useRef } from 'react';
import { STATUS_CONFIG } from '../data/processosData';
import { useBentoTheme, BENTO_LIGHT } from '../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../hooks/useDismissable';
import { tone } from '../utils/tone';
import { fundoHero } from './ui/heroGradiente';

// Pseudo-categoria "todas" — só existe no front, nunca é persistida no banco
const CATEGORIA_TODOS = { id: 'todos', label: 'Todas as Categorias', icon: 'grid_view' };

// Paleta Bento Blue Prestek (alinhada com Dashboard/Serviços/Escala/Escritórios)

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

// ─── Componentes auxiliares ──────────────────────────────────────────────────

// Cores por token do tema (útil `C`), não classes Tailwind cruas com `dark:`
// manual — aquele padrão só distinguia claro/escuro, ignorando as 3
// variantes escuras (Cyber/Aurora/AMOLED) que o resto do produto respeita.
// Mesmo par "soft bg + texto saturado" já usado no StatusBadge de
// TicketsList.jsx (`C.successSoft`/`C.success` etc.), não o par "Fill"
// (`dangerFill`/`onDanger`) — este badge é informativo, não uma contagem.
function StatusBadge({ status }) {
    const C = useBentoTheme();
    const label = STATUS_CONFIG[status]?.label || STATUS_CONFIG.rascunho.label;
    const cor = {
        ativo: { bg: C.successSoft, texto: C.success },
        revisao: { bg: C.warningSoft, texto: C.warning },
        rascunho: { bg: C.lineSoft, texto: C.ink2 },
        arquivado: { bg: C.dangerSoft, texto: C.danger },
    }[status] || { bg: C.lineSoft, texto: C.ink2 };
    return (
        <span
            className="px-2.5 py-0.5 inline-flex text-[11px] leading-5 font-extrabold uppercase tracking-wider rounded-full"
            style={{ backgroundColor: cor.bg, color: cor.texto }}
        >
            {label}
        </span>
    );
}

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

function ProcessosHero({ total, ativos, revisao, categorias, onAdd, isAdmin }) {
    const C = useBentoTheme();
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const kpis = [
        { label: 'Processos', value: total, icon: 'folder_open' },
        { label: 'Ativos', value: ativos, icon: 'check_circle' },
        { label: 'Em Revisão', value: revisao, icon: 'sync' },
        { label: 'Categorias', value: categorias, icon: 'grid_view' },
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
                    <pattern id="processos-hero-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#processos-hero-grid)" />
            </svg>

            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={LABEL_MONO}>Procedimentos Internos</div>
                        <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                            Processos Operacionais
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Gerencie e visualize procedimentos internos, fluxos de trabalho e POPs para todos os departamentos.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={onAdd}
                            className="inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold shadow-sm transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            style={{ background: C.surface, color: isDark ? C.accentDark : C.accentDeep }}
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Novo Processo
                        </button>
                    )}
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={LABEL_MONO}>Panorama</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {kpis.map(k => <KpiTile key={k.label} {...k} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

const FORM_VAZIO = {
    nome: '',
    descricao: '',
    // Sobrescrita sempre com categorias[0]?.id ao abrir "Novo Processo" — ver
    // ProcessoModal. Um literal fixo aqui podia ficar órfão se essa categoria
    // fosse renomeada/excluída em "Gerenciar Categorias".
    categoria: '',
    status: 'ativo',
    versao: '1.0',
    docUrl: '',
    responsavelNome: '',
    etapas: '',
    tempoEstimado: '',
    tags: '',
    // '' = sem vínculo. String (não number) porque é o valor cru de um
    // <select>; convertido ao montar o payload de salvar.
    ixcWflProcessoId: '',
};

function CampoSecao({ titulo, children }) {
    return (
        <div>
            <h3 className="text-[11px] font-extrabold text-[var(--accent-dark)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#7C2D12] to-[#C2410C]" />
                {titulo}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );
}

function ProcessoModal({ processo, onSalvar, onFechar, categorias, salvando, erroSalvar, wflProcessos, wflEstado, onAtualizarVinculo, atualizandoVinculo }) {
    const isEdicao = Boolean(processo?.id);
    const [form, setForm] = useState(() => {
        // Categoria padrão vem da lista carregada, não de um id fixo no código
        // — 'atendimento' hardcoded podia ficar órfão assim que o admin
        // renomeasse ou excluísse essa categoria em "Gerenciar Categorias".
        if (!processo) return { ...FORM_VAZIO, categoria: categorias[0]?.id ?? '' };
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
            ixcWflProcessoId: processo.ixcWflProcessoId != null ? String(processo.ixcWflProcessoId) : '',
        };
    });
    const [erros, setErros] = useState({});
    const [sujo, setSujo] = useState(false);
    // Confirmação de descarte inline (nunca window.confirm) — mesmo dialog,
    // conteúdo coberto por overlay, trap de Tab reescopado para os 2 botões
    // enquanto ela está aberta.
    const [confirmDescartar, setConfirmDescartar] = useState(false);

    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const continuarEditandoRef = useRef(null);
    const nomeRef = useRef(null);
    const descricaoRef = useRef(null);
    const sujoRef = useRef(false);
    const confirmDescartarRef = useRef(false);

    const tituloId = 'processo-modal-titulo';
    const formId = 'processo-modal-form';

    useEffect(() => { sujoRef.current = sujo; }, [sujo]);
    useEffect(() => { confirmDescartarRef.current = confirmDescartar; }, [confirmDescartar]);
    useEffect(() => { if (confirmDescartar) continuarEditandoRef.current?.focus(); }, [confirmDescartar]);

    // Foco inicial no primeiro campo, ao abrir
    useEffect(() => { nomeRef.current?.focus(); }, []);

    // Prender o foco dentro do modal (Tab/Shift+Tab) e fechar com Escape,
    // confirmando antes se houver alterações não salvas
    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (confirmDescartarRef.current) { setConfirmDescartar(false); return; }
                if (sujoRef.current) { setConfirmDescartar(true); return; }
                onFechar();
                return;
            }
            if (e.key !== 'Tab') return;
            const container = confirmDescartarRef.current ? overlayRef.current : modalRef.current;
            if (!container) return;
            const focaveis = container.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focaveis.length === 0) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onFechar]);

    function set(campo, valor) {
        setForm(f => ({ ...f, [campo]: valor }));
        setSujo(true);
        setErros(e => (e[campo] ? { ...e, [campo]: undefined } : e));
    }

    function tentarFechar() {
        if (sujo) { setConfirmDescartar(true); return; }
        onFechar();
    }

    function handleSubmit(e) {
        e.preventDefault();
        const novosErros = {};
        if (!form.nome.trim()) novosErros.nome = 'O nome do processo é obrigatório.';
        if (!form.descricao.trim()) novosErros.descricao = 'A descrição é obrigatória.';
        // Categoria pode ter ficado órfã (renomeada/excluída em "Gerenciar
        // Categorias" depois deste processo ter sido criado) — bloqueia em vez
        // de gravar um id que não existe mais na lista atual.
        if (!categorias.some(c => c.id === form.categoria)) {
            novosErros.categoria = 'Esta categoria não existe mais. Selecione outra.';
        }
        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            (novosErros.nome ? nomeRef : novosErros.descricao ? descricaoRef : null)?.current?.focus();
            return;
        }
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        // '' no seletor = "Nenhum" (desvincular). O nome vem da própria lista
        // já carregada (wflProcessos), não é digitado — evita uma 2ª ida ao
        // servidor só pra saber o nome do processo escolhido.
        const wflEscolhido = form.ixcWflProcessoId
            ? wflProcessos.find(w => String(w.id) === form.ixcWflProcessoId)
            : null;
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
                setor: categorias.find(c => c.id === form.categoria)?.label || '',
                funcionario_id: processo?.responsavel?.funcionario_id ?? null,
            },
            etapas: form.etapas !== '' ? Number(form.etapas) : null,
            tempoEstimado: form.tempoEstimado.trim() || '—',
            tags,
            ultimaAtualizacao: new Date().toISOString().split('T')[0],
            ixcWflProcessoId: wflEscolhido?.id ?? null,
            ixcWflProcessoNome: wflEscolhido?.descricao ?? null,
        };
        onSalvar(payload);
    }

    const inputCls = "w-full px-3 py-2.5 border border-border rounded-lg bg-surface-raised text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all";
    const inputErroCls = "border-[var(--danger-strong)] focus:ring-[var(--danger-strong)]";
    const labelCls = "block text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            {/* z-[1100] fica acima de Header e Sidebar (ambos z-1000). */}
            <div aria-hidden="true" className="absolute inset-0 bg-[#0B1B2E]/60 backdrop-blur-sm" onClick={tentarFechar} />
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border"
            >
                {/* Escondido de leitor de tela e fora do trap de Tab enquanto a
                    confirmação de descarte está aberta — sem isso, Tab/leitura
                    por seta ainda alcançaria os campos do formulário embaixo
                    do overlay. */}
                <div className="contents" aria-hidden={confirmDescartar || undefined}>
                {/* Header do modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-raised">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#7C2D12] to-[#C2410C] p-2.5 rounded-xl shadow-md shadow-[#EC7D23]/30">
                            <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">
                                {isEdicao ? 'edit' : 'add_circle'}
                            </span>
                        </div>
                        <div>
                            <h2 id={tituloId} className="font-display text-foreground font-bold text-xl">
                                {isEdicao ? 'Editar Processo' : 'Novo Processo'}
                            </h2>
                            <p className="text-xs text-faint mt-0.5">
                                {isEdicao ? 'Atualize os dados deste procedimento.' : 'Cadastre um novo procedimento operacional.'}
                            </p>
                            {isEdicao && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-mono font-bold text-faint mt-1.5">
                                    {processo.id}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={tentarFechar}
                        aria-label="Fechar"
                        className="text-muted hover:text-[var(--danger-strong)] p-2.5 rounded-full hover:bg-[var(--danger-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Corpo do formulário */}
                <form id={formId} onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                    <CampoSecao titulo="Informações Básicas">
                        <div className="sm:col-span-2">
                            <div className="flex items-baseline justify-between mb-1.5">
                                <label htmlFor="processo-nome" className="text-[10px] font-extrabold text-faint uppercase tracking-widest">Nome do Processo *</label>
                                <span className="text-[10px] font-bold text-faint tabular-nums">{form.nome.length}/100</span>
                            </div>
                            <input
                                id="processo-nome"
                                ref={nomeRef}
                                className={`${inputCls} ${erros.nome ? inputErroCls : ''}`}
                                value={form.nome}
                                onChange={e => set('nome', e.target.value)}
                                placeholder="Ex: Onboarding de Clientes"
                                maxLength={100}
                                aria-invalid={Boolean(erros.nome)}
                                aria-describedby={erros.nome ? 'processo-nome-erro' : undefined}
                            />
                            {erros.nome && (
                                <p id="processo-nome-erro" role="alert" className="mt-1.5 text-xs text-[var(--danger-strong)] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                                    {erros.nome}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="processo-categoria" className={labelCls}>Categoria *</label>
                            <div className="relative">
                                <select
                                    id="processo-categoria"
                                    className={`${inputCls} appearance-none pr-9 ${erros.categoria ? inputErroCls : ''}`}
                                    value={form.categoria}
                                    onChange={e => set('categoria', e.target.value)}
                                    aria-invalid={Boolean(erros.categoria)}
                                    aria-describedby={erros.categoria ? 'processo-categoria-erro' : undefined}
                                >
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none" aria-hidden="true">expand_more</span>
                            </div>
                            {erros.categoria && (
                                <p id="processo-categoria-erro" role="alert" className="mt-1.5 text-xs text-[var(--danger-strong)] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                                    {erros.categoria}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="processo-status" className={labelCls}>Status *</label>
                            <div className="relative">
                                <select id="processo-status" className={`${inputCls} appearance-none pr-9`} value={form.status} onChange={e => set('status', e.target.value)}>
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none" aria-hidden="true">expand_more</span>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <div className="flex items-baseline justify-between mb-1.5">
                                <label htmlFor="processo-descricao" className="text-[10px] font-extrabold text-faint uppercase tracking-widest">Descrição *</label>
                                <span className="text-[10px] font-bold text-faint tabular-nums">{form.descricao.length}/500</span>
                            </div>
                            <textarea
                                id="processo-descricao"
                                ref={descricaoRef}
                                className={`${inputCls} resize-none ${erros.descricao ? inputErroCls : ''}`}
                                rows={3}
                                value={form.descricao}
                                onChange={e => set('descricao', e.target.value)}
                                placeholder="Descreva o objetivo e escopo deste processo..."
                                maxLength={500}
                                aria-invalid={Boolean(erros.descricao)}
                                aria-describedby={erros.descricao ? 'processo-descricao-erro' : undefined}
                            />
                            {erros.descricao && (
                                <p id="processo-descricao-erro" role="alert" className="mt-1.5 text-xs text-[var(--danger-strong)] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                                    {erros.descricao}
                                </p>
                            )}
                        </div>
                    </CampoSecao>

                    <CampoSecao titulo="Detalhes Operacionais">
                        <div>
                            <label htmlFor="processo-versao" className={labelCls}>Versão</label>
                            <input id="processo-versao" className={inputCls} value={form.versao} onChange={e => set('versao', e.target.value)} placeholder="1.0" />
                            {/* Espelha a classe/texto real da dica de "Tempo Estimado", só
                                invisível — a altura acompanha a rampa tipográfica sozinha
                                em vez de um min-h em pixel fixo que pode descolar dela. */}
                            <p className="mt-1 text-[11px] text-faint leading-snug invisible" aria-hidden="true">&nbsp;</p>
                        </div>

                        <div>
                            <label htmlFor="processo-responsavel" className={labelCls}>Responsável</label>
                            <input id="processo-responsavel" className={inputCls} value={form.responsavelNome} onChange={e => set('responsavelNome', e.target.value)} placeholder="Ex: Coordenador de TI" />
                            <p className="mt-1 text-[11px] text-faint leading-snug invisible" aria-hidden="true">&nbsp;</p>
                        </div>

                        <div>
                            <label htmlFor="processo-etapas" className={labelCls}>Nº de Etapas</label>
                            <input id="processo-etapas" className={inputCls} type="number" min="0" value={form.etapas} onChange={e => set('etapas', e.target.value)} placeholder="Ex: 5" />
                            <p className="mt-1 text-[11px] text-faint leading-snug invisible" aria-hidden="true">&nbsp;</p>
                        </div>

                        <div>
                            <label htmlFor="processo-tempo" className={labelCls}>Tempo Estimado</label>
                            <input id="processo-tempo" className={inputCls} value={form.tempoEstimado} onChange={e => set('tempoEstimado', e.target.value)} placeholder="Ex: 30min" aria-describedby="processo-tempo-dica" />
                            <div className="mt-1 min-h-[30px]">
                                <p id="processo-tempo-dica" className="text-[11px] text-faint leading-snug">Duração aproximada (ex: "30min", "2h", "1 dia útil").</p>
                            </div>
                        </div>
                    </CampoSecao>

                    <CampoSecao titulo="Documentação e Tags">
                        <div className="sm:col-span-2">
                            <label htmlFor="processo-doc" className={labelCls}>Link do Google Docs (POP)</label>
                            <input id="processo-doc" className={inputCls} type="url" value={form.docUrl} onChange={e => set('docUrl', e.target.value)} placeholder="https://docs.google.com/..." aria-describedby="processo-doc-dica" />
                            <p id="processo-doc-dica" className="text-[11px] text-faint mt-1">Use um link com permissão de visualização para "qualquer pessoa com o link".</p>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="processo-tags" className={labelCls}>Tags (separadas por vírgula)</label>
                            <input id="processo-tags" className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Ex: IXC, cadastro, ativação" aria-describedby="processo-tags-dica" />
                            <p id="processo-tags-dica" className="text-[11px] text-faint mt-1">Separe múltiplas tags por vírgula.</p>
                        </div>
                    </CampoSecao>

                    <CampoSecao titulo="Vínculo com o IXC">
                        <div className="sm:col-span-2">
                            <label htmlFor="processo-ixc-wfl" className={labelCls}>Processo do IXC (opcional)</label>
                            <div className="relative">
                                <select
                                    id="processo-ixc-wfl"
                                    className={`${inputCls} appearance-none pr-9`}
                                    value={form.ixcWflProcessoId}
                                    onChange={e => set('ixcWflProcessoId', e.target.value)}
                                    disabled={wflProcessos.length === 0}
                                    aria-describedby="processo-ixc-wfl-dica"
                                    aria-busy={wflEstado === 'carregando'}
                                >
                                    <option value="">
                                        {wflEstado === 'carregando' ? 'Carregando processos do IXC…' : 'Nenhum — sem vínculo'}
                                    </option>
                                    {wflProcessos.map(w => (
                                        <option key={w.id} value={w.id}>{w.descricao}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none" aria-hidden="true">expand_more</span>
                            </div>
                            <p
                                id="processo-ixc-wfl-dica"
                                className="text-[11px] text-faint mt-1"
                                role={wflEstado === 'erro' ? 'alert' : undefined}
                            >
                                {wflEstado === 'carregando'
                                    ? 'Buscando a lista de processos do IXC…'
                                    : wflEstado === 'erro'
                                        ? 'Não foi possível carregar a lista do IXC agora. Feche e reabra o formulário para tentar de novo — o Processo pode ser salvo sem vínculo.'
                                        : wflProcessos.length === 0
                                            ? 'Nenhum processo ativo no IXC — o Processo pode ser salvo normalmente sem vínculo.'
                                            : 'Quando vinculado, o ID exibido na listagem passa a ser o assunto do IXC resolvido a partir da primeira tarefa deste fluxo.'}
                            </p>

                            {isEdicao && processo.ixcAssuntoId && (
                                <div className="mt-3 rounded-lg border border-border bg-surface-raised px-3 py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className={labelCls}>Assunto vinculado no IXC</p>
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {processo.ixcAssuntoId} — {processo.ixcAssuntoNome || 'nome não disponível'}
                                        </p>
                                        {processo.ixcResolvidoEm && (
                                            <p className="text-[11px] text-faint mt-0.5">
                                                Resolvido em {new Date(processo.ixcResolvidoEm).toLocaleString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onAtualizarVinculo(processo.id)}
                                        disabled={atualizandoVinculo}
                                        className="shrink-0 h-11 px-3 text-xs font-bold text-[var(--accent-dark)] border border-[var(--accent-dark)] rounded-lg hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {atualizandoVinculo ? 'Atualizando…' : 'Atualizar vínculo agora'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </CampoSecao>
                </form>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-border bg-surface flex flex-col gap-2 shadow-[0_-4px_12px_rgba(11,27,46,0.05)]">
                    {erroSalvar && (
                        <p role="alert" className="text-xs font-semibold text-[var(--danger-strong)] flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                            {erroSalvar}
                        </p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={tentarFechar} disabled={salvando} className="h-11 px-4 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98] disabled:opacity-60">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form={formId}
                            disabled={salvando}
                            className="h-11 px-5 text-sm font-bold bg-gradient-to-r from-[#7C2D12] to-[#C2410C] hover:brightness-110 text-white rounded-lg shadow-md shadow-[#EC7D23]/30 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className={`material-symbols-outlined text-[18px] ${salvando ? 'animate-spin' : ''}`} aria-hidden="true">
                                {salvando ? 'autorenew' : isEdicao ? 'save' : 'add'}
                            </span>
                            {salvando ? 'Salvando…' : isEdicao ? 'Salvar Alterações' : 'Criar Processo'}
                        </button>
                    </div>
                </div>
                </div>

                {confirmDescartar && (
                    <div
                        ref={overlayRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="processo-confirm-descartar-titulo"
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0B1B2E]/70 backdrop-blur-sm p-6"
                    >
                        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 text-center shadow-2xl">
                            <h3 id="processo-confirm-descartar-titulo" className="font-display text-base font-bold text-foreground">
                                Descartar alterações?
                            </h3>
                            <p className="mt-1.5 text-sm text-faint">
                                Existem alterações não salvas neste processo. Elas serão perdidas.
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <button
                                    ref={continuarEditandoRef}
                                    type="button"
                                    onClick={() => setConfirmDescartar(false)}
                                    className="h-11 px-4 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98]"
                                >
                                    Continuar editando
                                </button>
                                <button
                                    type="button"
                                    onClick={onFechar}
                                    className="h-11 px-4 text-sm font-bold text-[var(--on-danger)] bg-[var(--danger-fill)] rounded-lg hover:brightness-110 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] active:scale-[0.98]"
                                >
                                    Descartar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Consulta somente-leitura — não-admin clicando num processo caía num
// `abrirEditar` que checava `isAdmin` e não fazia NADA (linha/card e o
// próprio ícone de lápis, ambos sem feedback nenhum de que a ação foi
// bloqueada). Um modal dedicado, mais simples que reaproveitar o
// `ProcessoModal` com todo campo virando condicional editável/somente-texto.
function ProcessoViewModal({ processo, categorias, onFechar }) {
    const modalRef = useRef(null);
    useDismissable(modalRef, { open: true, onClose: onFechar, lockScroll: true, closeOnOutside: true });
    const trapTab = makeTrapTab(modalRef);
    const tituloId = 'processo-view-titulo';
    const categoriaLabel = categorias.find(c => c.id === processo.categoria)?.label || processo.categoria;
    const podeAbrirDoc = processo.status !== 'rascunho' && processo.docUrl;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div aria-hidden="true" className="absolute inset-0 bg-[#0B1B2E]/60 backdrop-blur-sm" onClick={onFechar} />
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                onKeyDown={trapTab}
                className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-raised">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-gradient-to-br from-[#7C2D12] to-[#C2410C] p-2.5 rounded-xl shadow-md shadow-[#EC7D23]/30 shrink-0">
                            <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">visibility</span>
                        </div>
                        <div className="min-w-0">
                            <h2 id={tituloId} className="font-display text-foreground font-bold text-xl truncate">{processo.nome}</h2>
                            <p className="text-xs text-faint mt-0.5">Consulta — somente leitura</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-mono font-bold text-faint mt-1.5">
                                {processo.id}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onFechar}
                        aria-label="Fechar"
                        className="text-muted hover:text-[var(--danger-strong)] p-2.5 rounded-full hover:bg-[var(--danger-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] active:scale-[0.98] shrink-0"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={processo.status} />
                        <span className="text-xs font-bold text-faint">{categoriaLabel}</span>
                        <span className="text-xs text-faint" aria-hidden="true">·</span>
                        <span className="text-xs font-bold text-faint">v{processo.versao}</span>
                    </div>

                    <div>
                        <h3 className="text-[11px] font-extrabold text-[var(--accent-dark)] uppercase tracking-widest mb-1.5">Descrição</h3>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{processo.descricao}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1">Responsável</h3>
                            <p className="text-sm text-foreground">{processo.responsavel?.nome || 'Não informado'}</p>
                            <p className="text-xs text-faint">{processo.responsavel?.setor || categoriaLabel}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1">Tempo Estimado</h3>
                            <p className="text-sm text-foreground">{processo.tempoEstimado || '—'}</p>
                        </div>
                        {processo.etapas != null && (
                            <div>
                                <h3 className="text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1">Nº de Etapas</h3>
                                <p className="text-sm text-foreground">{processo.etapas}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1">Última Atualização</h3>
                            <p className="text-sm text-foreground">{processo.ultimaAtualizacao || '—'}</p>
                        </div>
                    </div>

                    {processo.tags?.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1.5">Tags</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {processo.tags.map(t => (
                                    <span key={t} className="px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs font-semibold text-faint">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-5 border-t border-border bg-surface flex justify-end gap-3">
                    {podeAbrirDoc && (
                        <a
                            href={processo.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-11 px-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-dark)] border border-border rounded-lg hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            Abrir POP
                        </a>
                    )}
                    <button
                        onClick={onFechar}
                        className="h-11 px-5 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98]"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

function slugify(texto) {
    return texto
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

const CATEGORIA_FORM_VAZIO = { id: '', label: '', icon: '', prefixo: '', ordem: 0 };

// Ícones Material Symbols mais comuns para categorias de processo — evita que o
// admin precise adivinhar/digitar o nome exato do ícone às cegas.
const ICONES_CATEGORIA = [
    'support_agent', 'headset_mic', 'router', 'dns', 'cloud',
    'sell', 'storefront', 'local_offer', 'shopping_cart',
    'payments', 'receipt_long', 'account_balance',
    'person', 'groups', 'badge', 'school',
    'computer', 'settings', 'build', 'engineering', 'security',
    'apartment', 'work', 'business_center', 'inventory_2',
    'forum', 'verified', 'category', 'folder', 'description',
];

function IconePicker({ value, onChange }) {
    const [busca, setBusca] = useState('');
    const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-surface-raised text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all";

    const termo = busca.trim().toLowerCase();
    const icones = termo ? ICONES_CATEGORIA.filter(i => i.includes(termo)) : ICONES_CATEGORIA;
    // Garante que o ícone atual (mesmo se vier de fora da lista curada, ex: dado legado) sempre apareça selecionável.
    const lista = value && !icones.includes(value) ? [value, ...icones] : icones;

    return (
        <div className="border border-border rounded-lg bg-surface-raised p-3">
            <div className="flex items-center gap-3 mb-2.5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-dark)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{value || 'help'}</span>
                </div>
                <input
                    className={inputCls}
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Buscar ícone... (ex: venda, pessoa, nuvem)"
                />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[132px] overflow-y-auto">
                {lista.length === 0 && (
                    <p className="text-xs text-faint px-1 py-2">Nenhum ícone encontrado para "{busca}".</p>
                )}
                {lista.map(nome => (
                    <button
                        key={nome}
                        type="button"
                        onClick={() => onChange(nome)}
                        title={nome}
                        aria-label={`Selecionar ícone ${nome}`}
                        aria-pressed={value === nome}
                        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                            value === nome
                                ? 'bg-gradient-to-br from-[#7C2D12] to-[#C2410C] text-white'
                                : 'bg-surface border border-border text-muted hover:border-[var(--accent)] hover:text-[var(--accent-dark)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{nome}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function CategoriasAdminModal({ categorias, onCategoriasChange, onFechar, adminEmail }) {
    const [form, setForm] = useState(CATEGORIA_FORM_VAZIO);
    const [editandoId, setEditandoId] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [confirmExcluirId, setConfirmExcluirId] = useState(null);

    // O único diálogo desta tela que grava/exclui dado REAL (categorias) não
    // tinha nenhuma semântica de teclado — só os atributos ARIA estáticos.
    // Escape não fechava e o Tab escapava para "Novo Processo" atrás do modal.
    // Mesmo padrão (foco inicial + trap de Tab + Escape) já usado no
    // ProcessoModal logo acima neste arquivo.
    const modalRef = useRef(null);
    const fecharRef = useRef(null);

    useEffect(() => { fecharRef.current?.focus(); }, []);

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                onFechar();
                return;
            }
            if (e.key !== 'Tab' || !modalRef.current) return;
            const focaveis = modalRef.current.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focaveis.length === 0) return;
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onFechar]);

    const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-surface-raised text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all";
    const labelCls = "block text-[10px] font-extrabold text-faint uppercase tracking-widest mb-1";

    function set(campo, valor) {
        setForm(f => ({ ...f, [campo]: valor }));
    }

    function editar(cat) {
        setEditandoId(cat.id);
        setForm({ id: cat.id, label: cat.label, icon: cat.icon, prefixo: cat.prefixo || '', ordem: cat.ordem ?? 0 });
        setErro('');
    }

    function cancelarEdicao() {
        setEditandoId(null);
        setForm(CATEGORIA_FORM_VAZIO);
        setErro('');
    }

    async function excluir(cat) {
        try {
            const res = await fetch(`/api/categorias-processos/${cat.id}`, {
                method: 'DELETE',
            });
            const dados = await res.json();
            if (!res.ok) throw new Error(dados.erro || 'Erro ao excluir categoria.');
            onCategoriasChange(categorias.filter(c => c.id !== cat.id));
            if (editandoId === cat.id) cancelarEdicao();
        } catch (e) {
            setErro(e.message);
        } finally {
            setConfirmExcluirId(null);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        if (!form.label.trim()) { setErro('O nome da categoria é obrigatório.'); return; }
        if (!form.icon.trim()) { setErro('Selecione um ícone para a categoria.'); return; }
        const id = editandoId || form.id || slugify(form.label);
        if (!id) { setErro('Informe um identificador para a categoria.'); return; }

        setSalvando(true);
        try {
            const payload = {
                id,
                label: form.label.trim(),
                icon: form.icon.trim(),
                prefixo: form.prefixo.trim().toUpperCase() || null,
                ordem: Number(form.ordem) || 0,
            };
            const url = editandoId ? `/api/categorias-processos/${editandoId}` : '/api/categorias-processos';
            const res = await fetch(url, {
                method: editandoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const dados = await res.json();
            if (!res.ok) throw new Error(dados.erro || 'Erro ao salvar categoria.');

            if (editandoId) {
                onCategoriasChange(categorias.map(c => c.id === dados.id ? dados : c));
            } else {
                onCategoriasChange([...categorias, dados].sort((a, b) => (a.ordem - b.ordem) || a.label.localeCompare(b.label)));
            }
            cancelarEdicao();
        } catch (e) {
            setErro(e.message);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div aria-hidden="true" className="absolute inset-0 bg-[#0B1B2E]/60 backdrop-blur-sm" onClick={onFechar} />
            <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="categorias-admin-titulo" className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-border">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-raised">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#7C2D12] to-[#C2410C] p-2.5 rounded-xl shadow-md shadow-[#EC7D23]/30">
                            <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">tune</span>
                        </div>
                        <div>
                            <h2 id="categorias-admin-titulo" className="font-display text-foreground font-bold text-xl">Gerenciar Categorias</h2>
                            <p className="text-xs text-faint mt-0.5">Adicione, edite ou remova as categorias de processos.</p>
                        </div>
                    </div>
                    <button ref={fecharRef} onClick={onFechar} aria-label="Fechar" className="text-muted hover:text-[var(--danger-strong)] p-2.5 rounded-full hover:bg-[var(--danger-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] active:scale-[0.98]">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                        {categorias.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-faint">Nenhuma categoria cadastrada.</p>
                        )}
                        {categorias.map(cat => (
                            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-surface">
                                {confirmExcluirId === cat.id ? (
                                    <>
                                        <span className="material-symbols-outlined text-[var(--danger-strong)]" aria-hidden="true">warning</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">Excluir "{cat.label}"?</p>
                                            <p className="text-xs text-faint">Processos que já usam essa categoria não serão afetados.</p>
                                        </div>
                                        <button type="button" onClick={() => setConfirmExcluirId(null)} className="h-9 px-3 text-xs font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98]">
                                            Cancelar
                                        </button>
                                        <button type="button" onClick={() => excluir(cat)} className="h-9 px-3 text-xs font-bold text-[var(--on-danger)] bg-[var(--danger-fill)] rounded-lg hover:brightness-110 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] active:scale-[0.98]">
                                            Excluir
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[var(--accent-dark)]">{cat.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{cat.label}</p>
                                            <p className="text-xs text-faint font-mono">{cat.id} · {cat.prefixo || '—'}</p>
                                        </div>
                                        <button type="button" onClick={() => editar(cat)} aria-label={`Editar ${cat.label}`} className="relative p-3 rounded-md text-muted hover:text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] after:absolute after:-inset-1 after:content-['']">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button type="button" onClick={() => setConfirmExcluirId(cat.id)} aria-label={`Excluir ${cat.label}`} className="relative p-3 rounded-md text-muted hover:text-[var(--danger-strong)] hover:bg-[var(--danger-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-strong)] after:absolute after:-inset-1 after:content-['']">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-5">
                        <h3 className="text-[11px] font-extrabold text-[var(--accent-dark)] uppercase tracking-widest">
                            {editandoId ? `Editando "${editandoId}"` : 'Nova categoria'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className={labelCls}>Nome *</label>
                                <input className={inputCls} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Ex: Marketing" />
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Ícone *</label>
                                <IconePicker value={form.icon} onChange={nome => set('icon', nome)} />
                            </div>
                            <div>
                                <label className={labelCls}>Prefixo</label>
                                <input className={inputCls} value={form.prefixo} onChange={e => set('prefixo', e.target.value)} placeholder="Ex: MKT" maxLength={10} />
                            </div>
                            <div>
                                <label className={labelCls}>Ordem</label>
                                <input className={inputCls} type="number" value={form.ordem} onChange={e => set('ordem', e.target.value)} />
                            </div>
                            {!editandoId && (
                                <div>
                                    <label className={labelCls}>Identificador</label>
                                    <input className={inputCls} value={form.id || slugify(form.label)} onChange={e => set('id', slugify(e.target.value))} placeholder="gerado automaticamente" />
                                </div>
                            )}
                        </div>
                        {erro && (
                            <p role="alert" className="text-xs text-[var(--danger-strong)] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                                {erro}
                            </p>
                        )}
                        <div className="flex justify-end gap-2 pt-1">
                            {editandoId && (
                                <button type="button" onClick={cancelarEdicao} className="h-10 px-4 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors">
                                    Cancelar edição
                                </button>
                            )}
                            <button type="submit" disabled={salvando} className="h-10 px-4 text-sm font-bold bg-gradient-to-r from-[#7C2D12] to-[#C2410C] hover:brightness-110 text-white rounded-lg shadow-md shadow-[#EC7D23]/30 transition-colors disabled:opacity-60 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{editandoId ? 'save' : 'add'}</span>
                                {editandoId ? 'Salvar Alterações' : 'Adicionar Categoria'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-border bg-surface flex justify-end">
                    <button type="button" onClick={onFechar} className="h-10 px-4 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-surface-raised transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ onAdd, isAdmin }) {
    return (
        <div className="bg-surface border border-border rounded-[20px] shadow-sm px-6 py-16 flex flex-col items-center text-center">
            <div className="bg-[var(--accent-soft)] p-4 rounded-2xl text-[var(--accent-dark)] mb-5">
                <span className="material-symbols-outlined text-4xl">folder_off</span>
            </div>
            <h2 className="font-display text-foreground font-bold text-xl mb-2">Nenhum processo cadastrado ainda</h2>
            <p className="text-faint text-sm max-w-md mb-6">
                {isAdmin
                    ? 'Cadastre o primeiro procedimento operacional para começar a organizar os fluxos de trabalho do seu setor.'
                    : 'Ainda não há procedimentos operacionais cadastrados para o seu setor.'}
            </p>
            {isAdmin && (
                <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7C2D12] to-[#C2410C] hover:brightness-110 text-white text-sm font-bold shadow-md shadow-[#EC7D23]/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Cadastrar Primeiro Processo
                </button>
            )}
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

export default function Processos({ user, setCurrentView }) {
    const C = useBentoTheme();
    const isAdmin = Boolean(user?.is_admin);
    const [lista, setLista] = useState([]);
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
    const [pagina, setPagina] = useState(1);
    const [modal, setModal] = useState(null); // null | { modo: 'novo' } | { modo: 'editar', processo }
    const [categorias, setCategorias] = useState([]);
    const [categoriasErro, setCategoriasErro] = useState(false);
    const [categoriasAbertas, setCategoriasAbertas] = useState(false);
    const [processosErro, setProcessosErro] = useState(false);
    const [salvandoProcesso, setSalvandoProcesso] = useState(false);
    const [erroSalvarProcesso, setErroSalvarProcesso] = useState('');
    const [wflProcessos, setWflProcessos] = useState([]);
    const [wflEstado, setWflEstado] = useState('carregando'); // 'carregando' | 'pronto' | 'erro'
    const [atualizandoVinculoId, setAtualizandoVinculoId] = useState(null);
    // Aviso transitório de vínculo com o IXC (sucesso ou erro da resolução) —
    // não é o mesmo erro de salvar o Processo em si (esse já fecha o modal
    // com sucesso; isso aqui é só a conferência do assunto resolvido).
    const [avisoVinculo, setAvisoVinculo] = useState(null); // { tipo: 'sucesso'|'erro', texto } | null

    useEffect(() => {
        // Só o aviso de sucesso some sozinho; o de erro fica até ser dispensado,
        // já que é o único sinal de que o vínculo não foi resolvido (WCAG 2.2.1).
        if (!avisoVinculo || avisoVinculo.tipo === 'erro') return;
        const t = setTimeout(() => setAvisoVinculo(null), 6000);
        return () => clearTimeout(t);
    }, [avisoVinculo]);

    useEffect(() => {
        fetch('/api/categorias-processos')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(dados => {
                if (!Array.isArray(dados)) throw new Error('Resposta inesperada da API de categorias.');
                setCategorias(dados);
            })
            .catch(err => {
                console.error('Erro ao buscar categorias de processos:', err);
                setCategoriasErro(true);
            });
    }, []);

    useEffect(() => {
        fetch('/api/processos')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(dados => {
                if (!Array.isArray(dados)) throw new Error('Resposta inesperada da API de processos.');
                setLista(dados);
            })
            .catch(err => {
                console.error('Erro ao buscar processos:', err);
                setProcessosErro(true);
            });
    }, []);

    // Admin-only (a rota exige adminAuth) — só quem pode abrir "Novo
    // Processo"/"Editar" precisa dessa lista. Falha aqui não bloqueia o
    // resto da tela: o seletor do formulário só fica sem opções (mesmo
    // padrão de degradação já usado para categorias).
    useEffect(() => {
        if (!isAdmin) return;
        fetch('/api/processos/ixc/wfl-processos')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(dados => {
                setWflProcessos(Array.isArray(dados) ? dados : []);
                setWflEstado('pronto');
            })
            .catch(err => {
                console.error('Erro ao buscar processos de workflow do IXC:', err);
                setWflEstado('erro');
            });
    }, [isAdmin]);

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

    function abrirNovo() { setErroSalvarProcesso(''); setModal({ modo: 'novo' }); }
    // Só admin pode editar — antes qualquer usuário autenticado abria o
    // formulário completo de edição de qualquer processo, sem nenhuma guarda
    // (ao contrário de "Gerenciar Categorias", que já era admin-only).
    function abrirEditar(p) { if (!isAdmin) return; setErroSalvarProcesso(''); setModal({ modo: 'editar', processo: p }); }
    // Ponto de entrada único do clique na linha/card: admin edita, quem só
    // quer consultar abre o mesmo processo em modo leitura — antes o clique
    // (e o próprio ícone de lápis) simplesmente não faziam nada pra não-admin.
    function abrirDetalhe(p) { if (isAdmin) abrirEditar(p); else setModal({ modo: 'visualizar', processo: p }); }
    function fecharModal() { setModal(null); }

    function exportarCSV() {
        if (processosFiltrados.length === 0) return;
        const cabecalho = ['ID', 'Nome', 'Categoria', 'Status', 'Versão', 'Responsável', 'Setor', 'Tempo Estimado', 'Última Atualização'];
        const linhas = processosFiltrados.map(p => [
            p.id, p.nome, categorias.find(c => c.id === p.categoria)?.label || p.categoria,
            STATUS_CONFIG[p.status]?.label || p.status, p.versao, p.responsavel?.nome || '', p.responsavel?.setor || '',
            p.tempoEstimado || '', p.ultimaAtualizacao || '',
        ]);
        const escapar = valor => `"${String(valor ?? '').replace(/"/g, '""')}"`;
        const csv = [cabecalho, ...linhas].map(linha => linha.map(escapar).join(';')).join('\r\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `processos-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async function salvarProcesso(payload) {
        const isEdicao = modal.modo === 'editar';
        setSalvandoProcesso(true);
        setErroSalvarProcesso('');
        try {
            const res = await fetch(isEdicao ? `/api/processos/${payload.id}` : '/api/processos', {
                method: isEdicao ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const dados = await res.json().catch(() => null);
            if (!res.ok) throw new Error(dados?.erro || `Erro ao salvar processo (HTTP ${res.status}).`);
            if (isEdicao) {
                setLista(prev => prev.map(p => p.id === dados.id ? dados : p));
            } else {
                setLista(prev => [dados, ...prev]);
            }
            setModal(null);
            // O Processo em si já foi salvo com sucesso (senão teria caído no
            // catch acima) — isso aqui é só a conferência do vínculo com o
            // IXC, tentado apenas quando o formulário mandou um `ixcWflProcessoId`.
            if (payload.ixcWflProcessoId) {
                if (dados.erroVinculo) {
                    setAvisoVinculo({ tipo: 'erro', texto: dados.erroVinculo });
                } else if (dados.ixcAssuntoId) {
                    setAvisoVinculo({
                        tipo: 'sucesso',
                        texto: `Processo vinculado ao assunto do IXC ${dados.ixcAssuntoId}${dados.ixcAssuntoNome ? ` — ${dados.ixcAssuntoNome}` : ''}.`,
                    });
                }
            }
        } catch (err) {
            console.error('Erro ao salvar processo:', err);
            setErroSalvarProcesso(err.message || 'Não foi possível salvar o processo. Tente novamente.');
        } finally {
            setSalvandoProcesso(false);
        }
    }

    async function atualizarVinculoIxc(processoId) {
        setAtualizandoVinculoId(processoId);
        try {
            const res = await fetch(`/api/processos/${processoId}/ixc/atualizar`, { method: 'POST' });
            const dados = await res.json().catch(() => null);
            if (!res.ok) throw new Error(dados?.erro || `Erro ao atualizar vínculo (HTTP ${res.status}).`);
            setLista(prev => prev.map(p => p.id === dados.id ? dados : p));
            // Mantém o modal aberto refletindo o dado novo, se ainda for o
            // mesmo processo sendo editado.
            setModal(m => (m?.modo === 'editar' && m.processo?.id === processoId ? { ...m, processo: dados } : m));
            setAvisoVinculo({
                tipo: 'sucesso',
                texto: `Vínculo atualizado — assunto do IXC ${dados.ixcAssuntoId}${dados.ixcAssuntoNome ? ` — ${dados.ixcAssuntoNome}` : ''}.`,
            });
        } catch (err) {
            console.error('Erro ao atualizar vínculo com o IXC:', err);
            setAvisoVinculo({ tipo: 'erro', texto: err.message || 'Não foi possível atualizar o vínculo agora.' });
        } finally {
            setAtualizandoVinculoId(null);
        }
    }

    const totalAtivos = lista.filter(p => p.status === 'ativo').length;
    const totalRevisao = lista.filter(p => p.status === 'revisao').length;

    return (
        <>
        {modal && (modal.modo === 'novo' || modal.modo === 'editar') && (
            <ProcessoModal
                processo={modal.modo === 'editar' ? modal.processo : null}
                onSalvar={salvarProcesso}
                onFechar={fecharModal}
                categorias={categorias}
                salvando={salvandoProcesso}
                erroSalvar={erroSalvarProcesso}
                wflProcessos={wflProcessos}
                onAtualizarVinculo={atualizarVinculoIxc}
                wflEstado={wflEstado}
                atualizandoVinculo={modal.modo === 'editar' && atualizandoVinculoId === modal.processo?.id}
            />
        )}
        {modal?.modo === 'visualizar' && (
            <ProcessoViewModal
                processo={modal.processo}
                categorias={categorias}
                onFechar={fecharModal}
            />
        )}
        {categoriasAbertas && (
            <CategoriasAdminModal
                categorias={categorias}
                onCategoriasChange={setCategorias}
                onFechar={() => setCategoriasAbertas(false)}
                adminEmail={user?.email || ''}
            />
        )}

        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1200px] mx-auto w-full overflow-y-auto no-scrollbar" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}>
            {/* Hero */}
            <ProcessosHero
                total={lista.length}
                ativos={totalAtivos}
                revisao={totalRevisao}
                categorias={categorias.length}
                onAdd={abrirNovo}
                isAdmin={isAdmin}
            />

            <div className="mt-8 flex flex-col gap-8">
            {processosErro && (
                <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-[13px] font-semibold" style={{ background: 'var(--danger-soft)', color: 'var(--danger-bento)' }}>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
                    Não foi possível carregar os processos agora. Tente recarregar a página.
                </div>
            )}
            {avisoVinculo && (
                <div
                    role={avisoVinculo.tipo === 'erro' ? 'alert' : 'status'}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-[13px] font-semibold"
                    style={avisoVinculo.tipo === 'erro'
                        ? { background: C.dangerSoft, color: C.danger }
                        : { background: C.successSoft, color: C.success }}
                >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        {avisoVinculo.tipo === 'erro' ? 'error' : 'check_circle'}
                    </span>
                    <span className="flex-1">{avisoVinculo.texto}</span>
                    {avisoVinculo.tipo === 'erro' && (
                        <button
                            type="button"
                            onClick={() => setAvisoVinculo(null)}
                            aria-label="Dispensar aviso"
                            className="shrink-0 -my-2 -mr-2 w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                        </button>
                    )}
                </div>
            )}

            {/* Ações secundárias — só faz sentido com processos cadastrados */}
            {lista.length > 0 && (
            <div className="flex flex-wrap justify-end gap-3">
                <button
                    onClick={exportarCSV}
                    disabled={processosFiltrados.length === 0}
                    aria-label="Exportar lista de processos filtrada em CSV"
                    className="flex items-center gap-2 px-4 h-10 bg-surface border border-border rounded-lg text-foreground text-sm font-bold shadow-sm hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Exportar Lista</span>
                </button>
            </div>
            )}

            {/* Barra de busca e filtros — também visível para admin com a lista vazia, para acesso a "Gerenciar Categorias" */}
            {(lista.length > 0 || user?.is_admin) && (
            <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                    <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg leading-5 bg-surface-raised text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent sm:text-sm transition-all"
                            placeholder="Buscar por Nome, ID (ex: TI-001) ou tag..."
                            type="text"
                            value={busca}
                            onChange={handleBusca}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex gap-2 overflow-x-auto lg:overflow-visible lg:flex-wrap pb-2 lg:pb-0 no-scrollbar snap-x">
                            {[CATEGORIA_TODOS, ...categorias].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoria(cat.id)}
                                    aria-pressed={categoriaAtiva === cat.id}
                                    className={`snap-start shrink-0 lg:shrink flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap lg:whitespace-normal transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                                        categoriaAtiva === cat.id
                                            ? 'bg-gradient-to-r from-[#7C2D12] to-[#C2410C] text-white shadow-md shadow-[#EC7D23]/20'
                                            : 'bg-surface-raised border border-border text-faint hover:border-[var(--accent)] hover:text-[var(--accent-dark)]'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${categoriaAtiva === cat.id ? 'text-white' : 'text-muted'}`}>
                                        {cat.icon}
                                    </span>
                                    {cat.label}
                                </button>
                            ))}
                            {user?.is_admin && (
                                <button
                                    onClick={() => setCategoriasAbertas(true)}
                                    className="snap-start shrink-0 lg:shrink flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap lg:whitespace-normal border border-dashed border-[var(--accent-dark)] text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">tune</span>
                                    Gerenciar Categorias
                                </button>
                            )}
                        </div>
                        {categoriasErro && (
                            <p className="mt-2 text-xs text-[var(--danger-strong)] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                                Não foi possível carregar as categorias agora. Tente recarregar a página.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            )}

            {lista.length === 0 ? (
                <EmptyState onAdd={abrirNovo} isAdmin={isAdmin} />
            ) : (
            <>
            {/* Lista Mobile (Cards) — oculta em md+ */}
            <div className="block md:hidden bg-surface border border-border rounded-[20px] overflow-hidden shadow-sm">
                {processosPagina.length === 0 ? (
                    <p className="px-6 py-12 text-center text-faint text-sm">
                        Nenhum processo encontrado para os filtros aplicados.
                    </p>
                ) : processosPagina.map(p => {
                    const podeAbrirDoc = p.status !== 'rascunho' && p.docUrl;
                    return (
                        <div
                            key={p.id}
                            onClick={() => abrirDetalhe(p)}
                            className="p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-surface-raised transition-colors"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    className="font-mono font-bold text-[var(--accent-dark)] text-sm"
                                    title={p.ixcAssuntoId ? `Assunto do IXC: ${p.ixcAssuntoId}${p.ixcAssuntoNome ? ` — ${p.ixcAssuntoNome}` : ''}` : undefined}
                                >
                                    {p.ixcAssuntoId ?? p.id}
                                    {p.ixcAssuntoId && (
                                        <span className="block font-sans text-[11px] font-semibold text-faint tracking-wide truncate max-w-[220px]">
                                            Assunto IXC{p.ixcAssuntoNome ? ` · ${p.ixcAssuntoNome}` : ''}
                                        </span>
                                    )}
                                </span>
                                <StatusBadge status={p.status} />
                            </div>
                            <h3 className="font-extrabold text-foreground text-base leading-snug">{p.nome}</h3>
                            <p className="text-xs text-faint mb-1">{p.responsavel.setor} · v{p.versao}</p>
                            <p className="text-sm text-faint line-clamp-2 mb-3">{p.descricao}</p>
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                {isAdmin && (
                                    <button
                                        onClick={() => abrirEditar(p)}
                                        aria-label={`Editar ${p.nome}`}
                                        title="Editar processo"
                                        className="p-3 rounded-md text-muted hover:text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                )}
                                {podeAbrirDoc ? (
                                    <a
                                        href={p.docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir POP de ${p.nome} no Google Docs`}
                                        title="Abrir POP no Google Docs"
                                        className="p-3 rounded-md text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                    </a>
                                ) : (
                                    <span className="p-3 text-muted cursor-default" title="Rascunho — sem POP publicado" aria-label="Rascunho, sem POP publicado">
                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit_note</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* Paginação mobile */}
                <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-surface-raised">
                    <span className="text-xs font-bold text-faint">
                        {processosFiltrados.length === 0 ? 0 : inicio + 1}–{Math.min(inicio + ROWS_PER_PAGE, processosFiltrados.length)} de {processosFiltrados.length}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaSegura === 1} className="px-3 py-2 min-h-[44px] border border-border rounded-lg text-sm font-bold text-faint hover:bg-[var(--accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Anterior</button>
                        <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} className="px-3 py-2 min-h-[44px] border border-border rounded-lg text-sm font-bold text-foreground hover:bg-[var(--accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Próximo</button>
                    </div>
                </div>
            </div>

            {/* Tabela Desktop — oculta em mobile */}
            <div className="hidden md:flex bg-surface border border-border rounded-[20px] overflow-hidden shadow-sm flex-1 flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-raised border-b border-border">
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest w-28">ID</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest w-1/4">PROCESSO</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest">DESCRIÇÃO</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest w-24 text-center">VERSÃO</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest w-36 text-center">STATUS</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-faint uppercase tracking-widest w-28 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-surface">
                            {processosPagina.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-faint text-sm">
                                        Nenhum processo encontrado para os filtros aplicados.
                                    </td>
                                </tr>
                            ) : processosPagina.map(p => {
                                const podeAbrirDoc = p.status !== 'rascunho' && p.docUrl;
                                return (
                                    <tr
                                        key={p.id}
                                        onClick={() => abrirDetalhe(p)}
                                        className="hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
                                    >
                                        <td
                                            className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-[var(--accent-dark)]"
                                            title={p.ixcAssuntoId ? `Assunto do IXC: ${p.ixcAssuntoId}${p.ixcAssuntoNome ? ` — ${p.ixcAssuntoNome}` : ''}` : undefined}
                                        >
                                            {p.ixcAssuntoId ?? p.id}
                                            {p.ixcAssuntoId && (
                                                <span className="block font-sans text-[11px] font-semibold text-faint tracking-wide">Assunto IXC</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Nome é texto livre do admin, sem limite de tamanho no
                                                formulário — sem truncar, um nome comprido alargava a
                                                tabela inteira (sem `table-layout: fixed`, o `w-1/4` do
                                                cabeçalho é só uma sugestão, o layout automático ignora
                                                e dimensiona pelo conteúdo). Latente até a Fase 12
                                                (`PROCESSOS` era um array vazio); virou real com a
                                                persistência de 2026-09-19. */}
                                            <div className="text-sm font-bold text-foreground truncate max-w-[280px]" title={p.nome}>{p.nome}</div>
                                            <div className="text-xs text-faint mt-0.5">{p.responsavel.setor}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-faint max-w-xs">
                                            <span className="line-clamp-2" title={p.descricao}>{p.descricao}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground font-medium">
                                            v{p.versao}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => abrirEditar(p)}
                                                        aria-label={`Editar ${p.nome}`}
                                                        title="Editar processo"
                                                        className="p-3 rounded-md text-muted hover:text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                )}
                                                {podeAbrirDoc ? (
                                                    <a
                                                        href={p.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`Abrir POP de ${p.nome} no Google Docs`}
                                                        title="Abrir POP no Google Docs"
                                                        className="p-3 rounded-md text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                                    </a>
                                                ) : (
                                                    <span className="p-3 text-muted cursor-default" title="Rascunho — sem POP publicado" aria-label="Rascunho, sem POP publicado">
                                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit_note</span>
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
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-raised">
                    <span className="text-sm text-faint">
                        Mostrando{' '}
                        <span className="font-bold text-foreground">
                            {processosFiltrados.length === 0 ? 0 : inicio + 1}
                        </span>{' '}
                        a{' '}
                        <span className="font-bold text-foreground">
                            {Math.min(inicio + ROWS_PER_PAGE, processosFiltrados.length)}
                        </span>{' '}
                        de{' '}
                        <span className="font-bold text-foreground">{processosFiltrados.length}</span>{' '}
                        resultado{processosFiltrados.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={paginaSegura === 1}
                            className="px-3 py-2 min-h-[44px] border border-border rounded-lg text-sm font-bold text-faint hover:bg-[var(--accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaSegura === totalPaginas}
                            className="px-3 py-2 min-h-[44px] border border-border rounded-lg text-sm font-bold text-foreground hover:bg-[var(--accent-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de resumo por categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categorias.map(cat => {
                    const total = contagem[cat.id] || 0;
                    const pct = percentuaisAtivos[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => { handleCategoria(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            aria-label={`Filtrar por ${cat.label}, ${total} processo${total !== 1 ? 's' : ''}`}
                            className="bg-surface p-6 rounded-[20px] border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-[var(--accent-soft)] p-3 rounded-[14px] text-[var(--accent-dark)] group-hover:bg-gradient-to-br group-hover:from-[#7C2D12] group-hover:to-[#C2410C] group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <span className="text-3xl font-extrabold text-foreground">{total}</span>
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-1">{cat.label}</h3>
                            <p className="text-faint text-xs">
                                {total === 0 ? 'Nenhum processo cadastrado' : `${total} processo${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
                            </p>
                            <div className="mt-4 w-full bg-surface-raised rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-[#7C2D12] to-[#C2410C] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-faint mt-2 text-right">{pct}% Ativos</p>
                        </button>
                    );
                })}
            </div>
            </>
            )}
            </div>
        </main>
        </>
    );
}