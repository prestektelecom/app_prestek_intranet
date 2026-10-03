import { useState, useMemo, useRef } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../../hooks/useDismissable';
import { useComunicados } from '../../hooks/useComunicados';
import { relativeTimeShort } from '../../utils/relativeTime';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORM_VAZIO = { titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '' };
const COMUNICADO_MODAL_TITULO_ID = 'admin-comunicado-modal-titulo';

// ── Paleta Bento Blue ─────────────────────────────────────────────────────

const tone = (hex, a) => {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
};

const sIconBox = (color, bg) => ({
    width: 34,
    height: 34,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
});

// Retorna as definições visuais por tipo de comunicado com base no tema atual
const getTypeMeta = (C) => ({
    Urgente: { color: C.danger, soft: C.dangerSoft, icon: 'priority_high', label: 'URGENTE' },
    Importante: { color: C.warning, soft: C.warningSoft, icon: 'notification_important', label: 'IMPORTANTE' },
    Geral: { color: C.success, soft: C.successSoft, icon: 'article', label: 'GERAL' }
});

export default function AdminComunicados({ adminEmail }) {
    const C = useBentoTheme();
    const { comunicados, loaded, erro, recarregar } = useComunicados();
    const carregando = !loaded;
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);
    const [erroModal, setErroModal] = useState('');
    const [confirmExcluirId, setConfirmExcluirId] = useState(null);
    const [erroExcluir, setErroExcluir] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const modalRef = useRef(null);

    // O modal (edita o feed publicado para a empresa inteira) não tinha
    // NENHUMA semântica de diálogo — Escape não fechava, foco não entrava
    // nem retornava (achado ao vivo, Fase 15). Mesmo padrão já em produção
    // no CrudModal de Comunicados.jsx.
    useDismissable(modalRef, { open: modalAberto, onClose: () => setModalAberto(false), lockScroll: true, closeOnOutside: true });

    const trapTab = makeTrapTab(modalRef);

    const abrirNovo = () => { setEditando(null); setForm(FORM_VAZIO); setErroModal(''); setModalAberto(true); };
    const abrirEditar = (c) => {
        setEditando(c);
        setForm({ titulo: c.titulo, descricao: c.descricao || '', tipo: c.tipo || 'Geral', departamento_autor: c.departamento_autor || '', link_opcional: c.link_opcional || '' });
        setErroModal('');
        setModalAberto(true);
    };

    const salvar = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.descricao.trim() || !form.departamento_autor.trim()) return;
        setSalvando(true);
        setErroModal('');
        try {
            const method = editando ? 'PUT' : 'POST';
            const url = editando ? `${API}/api/comunicados/${editando.id}` : `${API}/api/comunicados`;
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, criado_por: adminEmail || 'Admin' }),
            });
            const data = await res.json();
            if (!data.sucesso && !data.comunicado) throw new Error(data.erro || 'Erro ao salvar');
            setModalAberto(false); await recarregar();
        } catch (e) { setErroModal(e.message); } finally { setSalvando(false); }
    };

    // Sem window.confirm: confirmação inline no próprio card, com foco e
    // Escape tratados pelo estado local em vez de um diálogo nativo bloqueante
    // (mesmo padrão já usado em Processos.jsx/CategoriasAdminModal).
    const excluir = async (id) => {
        setExcluindo(id);
        setErroExcluir('');
        try {
            const res = await fetch(`${API}/api/comunicados/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.sucesso && !data.ok) throw new Error(data.erro || 'Erro ao excluir');
            await recarregar();
            setConfirmExcluirId(null);
        } catch (e) {
            // Mantém o card em modo de confirmação para o erro aparecer ali,
            // com a opção de tentar de novo ou cancelar.
            setErroExcluir(e.message);
        } finally {
            setExcluindo(null);
        }
    };

    const comunicadosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return comunicados.filter(c => {
            const matchBusca = !termo ||
                c.titulo.toLowerCase().includes(termo) ||
                (c.descricao || '').toLowerCase().includes(termo) ||
                (c.departamento_autor || '').toLowerCase().includes(termo);
            const matchTipo = filtroTipo === 'Todos' || c.tipo === filtroTipo;
            return matchBusca && matchTipo;
        });
    }, [comunicados, busca, filtroTipo]);

    const total = comunicados.length;
    const totalUrgentes = comunicados.filter(c => c.tipo === 'Urgente').length;
    const totalImportantes = comunicados.filter(c => c.tipo === 'Importante').length;
    const totalGerais = comunicados.filter(c => c.tipo === 'Geral').length;

    const stats = [
        { label: 'Total', valor: total, icon: 'campaign', cor: C.accent, bg: C.accentSoft },
        { label: 'Urgentes', valor: totalUrgentes, icon: 'priority_high', cor: C.danger, bg: C.dangerSoft },
        { label: 'Importantes', valor: totalImportantes, icon: 'notification_important', cor: C.warning, bg: C.warningSoft },
        { label: 'Gerais', valor: totalGerais, icon: 'article', cor: C.success, bg: C.successSoft },
    ];

    const getInputStyle = (name) => ({
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: C.surfaceSoft,
        border: `1.5px solid ${focusedInput === name ? C.accent : C.line}`, borderRadius: 10,
        fontSize: 14, color: C.ink, outline: 'none', transition: 'all 0.15s',
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Gerenciar Comunicados</h1>
                    <p className="mt-1 text-sm" style={{ color: C.ink2 }}>Crie, edite e exclua os comunicados exibidos na intranet.</p>
                </div>
                <button
                    onClick={abrirNovo}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
                    style={{ background: C.accent, color: C.onAccent }}
                    onMouseEnter={e => e.currentTarget.style.background = C.accentDark}
                    onMouseLeave={e => e.currentTarget.style.background = C.accent}
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Comunicado
                </button>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map(s => (
                    <div
                        key={s.label}
                        className="flex items-center gap-3 rounded-2xl border p-4"
                        style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                    >
                        <div style={sIconBox(s.cor, s.bg)}>
                            <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: C.ink }}>{carregando ? '—' : s.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Erro */}
            {erro && (
                <div
                    role="alert"
                    className="rounded-xl border p-4 text-sm"
                    style={{ background: C.dangerSoft, borderColor: tone(C.danger, 0.35), color: C.dangerStrong }}
                >
                    {erro.message || 'Erro ao carregar comunicados.'}
                </div>
            )}

            {/* Filtros */}
            {!carregando && comunicados.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <div
                        className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
                        style={{ background: C.surface, borderColor: C.line, minWidth: 220 }}
                    >
                        <span className="material-symbols-outlined" style={{ color: C.muted }}>search</span>
                        <input
                            type="text"
                            placeholder="Buscar comunicado..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none"
                            style={{ color: C.ink }}
                        />
                        {busca && (
                            <button onClick={() => setBusca('')} style={{ color: C.muted }}>
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {['Todos', 'Urgente', 'Importante', 'Geral'].map(tipo => (
                            <button
                                key={tipo}
                                onClick={() => setFiltroTipo(tipo)}
                                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                                style={{
                                    background: filtroTipo === tipo ? C.accent : C.surfaceSoft,
                                    color: filtroTipo === tipo ? C.onAccent : C.ink2,
                                    border: `1px solid ${filtroTipo === tipo ? C.accent : C.line}`,
                                }}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista */}
            {carregando ? (
                <div className="flex flex-col items-center gap-3 py-16" style={{ color: C.ink2 }}>
                    <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: C.accent }}>progress_activity</span>
                    Carregando comunicados...
                </div>
            ) : comunicados.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border py-16" style={{ background: C.surface, borderColor: C.line, color: C.ink2 }}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <p className="text-sm font-medium">Nenhum comunicado cadastrado.</p>
                    <button
                        onClick={abrirNovo}
                        className="mt-1 min-h-[44px] rounded-lg px-4 py-2 text-sm font-bold"
                        style={{ background: C.accent, color: C.onAccent }}
                    >
                        Criar primeiro comunicado
                    </button>
                </div>
            ) : comunicadosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16" style={{ color: C.ink2 }}>
                    <span className="material-symbols-outlined text-3xl">search_off</span>
                    <p className="text-sm">Nenhum comunicado encontrado com os filtros aplicados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {comunicadosFiltrados.map(c => {
                        const typeMeta = getTypeMeta(C);
                        const meta = typeMeta[c.tipo] || typeMeta.Geral;
                        return (
                            <div
                                key={c.id}
                                className="flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
                                style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                            >
                                <div style={{ height: 4, background: meta.color }} />
                                <div className="flex flex-1 flex-col gap-3 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                                                style={{ background: meta.soft, color: meta.color, fontFamily: '"JetBrains Mono", monospace' }}
                                            >
                                                <span className="material-symbols-outlined text-xs">{meta.icon}</span>
                                                {meta.label}
                                            </span>
                                            <span className="text-[11px] font-medium" style={{ color: C.ink2, fontFamily: '"JetBrains Mono", monospace' }}>{relativeTimeShort(c.criado_em)}</span>
                                        </div>
                                        {confirmExcluirId === c.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setConfirmExcluirId(null); setErroExcluir(''); }}
                                                    className="rounded-lg px-2.5 py-1 text-xs font-bold transition-colors"
                                                    style={{ color: C.ink2 }}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => excluir(c.id)}
                                                    disabled={excluindo === c.id}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white transition-colors disabled:opacity-60"
                                                    style={{ background: C.danger }}
                                                >
                                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">{excluindo === c.id ? 'sync' : 'delete'}</span>
                                                    Excluir
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => abrirEditar(c)}
                                                    className="inline-flex items-center rounded-lg p-1.5 transition-colors"
                                                    style={{ color: C.muted }}
                                                    onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                                    title="Editar"
                                                    aria-label="Editar comunicado"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => { setConfirmExcluirId(c.id); setErroExcluir(''); }}
                                                    className="inline-flex items-center rounded-lg p-1.5 transition-colors"
                                                    style={{ color: C.muted }}
                                                    onMouseEnter={e => e.currentTarget.style.color = C.dangerStrong}
                                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                                    title="Excluir"
                                                    aria-label="Excluir comunicado"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {confirmExcluirId === c.id && (
                                        <p role={erroExcluir ? 'alert' : 'status'} className="text-[11px] font-semibold" style={{ color: C.dangerStrong }}>
                                            {erroExcluir || 'Excluir este comunicado do feed da intranet? Esta ação não pode ser desfeita.'}
                                        </p>
                                    )}
                                    <h3 className="text-base font-bold leading-snug" style={{ color: C.ink }}>{c.titulo}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: C.ink2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descricao}</p>
                                    <div className="mt-auto flex items-center justify-between border-t pt-3 text-[11px] font-bold" style={{ borderColor: C.lineSoft, color: C.ink2, fontFamily: '"JetBrains Mono", monospace' }}>
                                        <span>DEPTO. {c.departamento_autor || 'GERAL'}</span>
                                        {c.link_opcional && (
                                            <a
                                                href={c.link_opcional}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-0.5 transition-colors hover:underline"
                                                style={{ color: C.accent }}
                                            >
                                                Link <span className="material-symbols-outlined text-xs">open_in_new</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modalAberto && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" style={{ background: 'rgba(11, 27, 46, 0.5)', backdropFilter: 'blur(4px)' }}>
                    <div
                        ref={modalRef}
                        onKeyDown={trapTab}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={COMUNICADO_MODAL_TITULO_ID}
                        className="w-full max-w-[520px] overflow-hidden rounded-2xl border shadow-2xl"
                        style={{ background: C.surface, borderColor: C.line }}
                    >
                        <div
                            className="flex items-center justify-between px-5 py-4 text-white"
                            style={{ background: `linear-gradient(120deg, ${C.accentDeep}, #C2410C)` }}
                        >
                            <h2 id={COMUNICADO_MODAL_TITULO_ID} className="font-display flex items-center gap-2 text-xl font-bold">
                                <span className="material-symbols-outlined text-xl">{editando ? 'edit' : 'campaign'}</span>
                                {editando ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>
                            <button onClick={() => setModalAberto(false)} aria-label="Fechar" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-white">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={salvar} className="flex flex-col gap-4 p-5">
                            <div>
                                <label htmlFor="admin-comunicado-titulo" className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Título *</label>
                                <input id="admin-comunicado-titulo" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} onFocus={() => setFocusedInput('titulo')} onBlur={() => setFocusedInput(null)} style={getInputStyle('titulo')} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="admin-comunicado-tipo" className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Tipo *</label>
                                    <select id="admin-comunicado-tipo" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={getInputStyle('tipo')}>
                                        <option value="Geral">Geral — Verde</option>
                                        <option value="Importante">Importante — Amarelo</option>
                                        <option value="Urgente">Urgente — Vermelho</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="admin-comunicado-depto" className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Depto. Autor *</label>
                                    <input id="admin-comunicado-depto" required value={form.departamento_autor} onChange={e => setForm({ ...form, departamento_autor: e.target.value })} onFocus={() => setFocusedInput('depto')} onBlur={() => setFocusedInput(null)} style={getInputStyle('depto')} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="admin-comunicado-descricao" className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Conteúdo *</label>
                                <textarea id="admin-comunicado-descricao" required rows={4} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} onFocus={() => setFocusedInput('descricao')} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle('descricao'), resize: 'none' }} />
                            </div>
                            <div>
                                <label htmlFor="admin-comunicado-link" className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>Link Adicional (Opcional)</label>
                                <input id="admin-comunicado-link" type="url" value={form.link_opcional} onChange={e => setForm({ ...form, link_opcional: e.target.value })} onFocus={() => setFocusedInput('link')} onBlur={() => setFocusedInput(null)} style={getInputStyle('link')} />
                            </div>
                            {erroModal && (
                                <p role="alert" className="text-sm font-semibold" style={{ color: C.dangerStrong }}>
                                    {erroModal}
                                </p>
                            )}
                            <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                                <button
                                    type="button"
                                    onClick={() => setModalAberto(false)}
                                    className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                                    style={{ borderColor: C.line, background: C.surface, color: C.ink2 }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="min-h-[44px] rounded-lg px-5 py-2 text-sm font-bold transition-all disabled:opacity-60"
                                    style={{ background: C.accent, color: C.onAccent }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.accentDark}
                                    onMouseLeave={e => e.currentTarget.style.background = C.accent}
                                >
                                    {salvando ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}