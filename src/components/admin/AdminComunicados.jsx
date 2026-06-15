import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORM_VAZIO = { titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '' };

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

function relativeTime(d) {
    if (!d) return '';
    const diff = (new Date() - new Date(d)) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `há ${Math.floor(diff / 86400)}d`;
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function AdminComunicados({ adminEmail }) {
    const C = useBentoTheme();
    const [comunicados, setComunicados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    const carregar = useCallback(async () => {
        setCarregando(true); setErro(null);
        try {
            const res = await fetch(`${API}/api/comunicados`);
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao carregar');
            setComunicados(data.comunicados || []);
        } catch (e) { setErro(e.message); } finally { setCarregando(false); }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const abrirNovo = () => { setEditando(null); setForm(FORM_VAZIO); setModalAberto(true); };
    const abrirEditar = (c) => {
        setEditando(c);
        setForm({ titulo: c.titulo, descricao: c.descricao || '', tipo: c.tipo || 'Geral', departamento_autor: c.departamento_autor || '', link_opcional: c.link_opcional || '' });
        setModalAberto(true);
    };

    const salvar = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.descricao.trim() || !form.departamento_autor.trim()) return;
        setSalvando(true);
        try {
            const method = editando ? 'PUT' : 'POST';
            const url = editando ? `${API}/api/comunicados/${editando.id}` : `${API}/api/comunicados`;
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', 'x-admin-email': adminEmail },
                body: JSON.stringify({ ...form, criado_por: adminEmail || 'Admin' }),
            });
            const data = await res.json();
            if (!data.sucesso && !data.comunicado) throw new Error(data.erro || 'Erro ao salvar');
            setModalAberto(false); await carregar();
        } catch (e) { alert(`Erro: ${e.message}`); } finally { setSalvando(false); }
    };

    const excluir = async (id) => {
        if (!window.confirm('Excluir este comunicado?')) return;
        setExcluindo(id);
        try {
            const res = await fetch(`${API}/api/comunicados/${id}`, { method: 'DELETE', headers: { 'x-admin-email': adminEmail } });
            const data = await res.json();
            if (!data.sucesso && !data.ok) throw new Error(data.erro || 'Erro ao excluir');
            setComunicados(prev => prev.filter(c => c.id !== id));
        } catch (e) { alert(`Erro: ${e.message}`); } finally { setExcluindo(null); }
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
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Gerenciar Comunicados</h1>
                    <p className="mt-1 text-sm" style={{ color: C.muted }}>Crie, edite e exclua os comunicados exibidos na intranet.</p>
                </div>
                <button
                    onClick={abrirNovo}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                    style={{ background: C.accent }}
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
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: C.ink }}>{carregando ? '—' : s.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Erro */}
            {erro && (
                <div
                    className="rounded-xl border p-4 text-sm"
                    style={{ background: C.dangerSoft, borderColor: '#F5B0B0', color: C.danger }}
                >
                    {erro}
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
                                    color: filtroTipo === tipo ? '#fff' : C.ink2,
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
                <div className="flex flex-col items-center gap-3 py-16" style={{ color: C.muted }}>
                    <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: C.accent }}>progress_activity</span>
                    Carregando comunicados...
                </div>
            ) : comunicados.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border py-16" style={{ background: C.surface, borderColor: C.line, color: C.muted }}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <p className="text-sm font-medium">Nenhum comunicado cadastrado.</p>
                    <button
                        onClick={abrirNovo}
                        className="mt-1 rounded-lg px-4 py-2 text-sm font-bold text-white"
                        style={{ background: C.accent }}
                    >
                        Criar primeiro comunicado
                    </button>
                </div>
            ) : comunicadosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16" style={{ color: C.muted }}>
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
                                className="flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md"
                                style={{ borderColor: C.line, borderLeft: `4px solid ${meta.color}`, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                            >
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
                                            <span className="text-[11px] font-medium" style={{ color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>{relativeTime(c.criado_em)}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => abrirEditar(c)}
                                                className="inline-flex items-center rounded-lg p-1.5 transition-colors"
                                                style={{ color: C.muted }}
                                                onMouseEnter={e => e.currentTarget.style.color = C.accent}
                                                onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => excluir(c.id)}
                                                disabled={excluindo === c.id}
                                                className="inline-flex items-center rounded-lg p-1.5 transition-colors disabled:opacity-50"
                                                style={{ color: C.muted }}
                                                onMouseEnter={e => e.currentTarget.style.color = C.danger}
                                                onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                            >
                                                <span className="material-symbols-outlined text-lg">{excluindo === c.id ? 'sync' : 'delete'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold leading-snug" style={{ color: C.ink }}>{c.titulo}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: C.ink2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descricao}</p>
                                    <div className="mt-auto flex items-center justify-between border-t pt-3 text-[11px] font-bold" style={{ borderColor: C.lineSoft, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>
                                        <span>DEPTO: {c.departamento_autor || 'GERAL'}</span>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(11, 27, 46, 0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border shadow-2xl" style={{ background: C.surface, borderColor: C.line }}>
                        <div
                            className="flex items-center justify-between px-5 py-4 text-white"
                            style={{ background: `linear-gradient(120deg, ${C.accentDeep}, ${C.accent})` }}
                        >
                            <h2 className="flex items-center gap-2 text-base font-bold">
                                <span className="material-symbols-outlined text-xl">{editando ? 'edit' : 'campaign'}</span>
                                {editando ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>
                            <button onClick={() => setModalAberto(false)} className="inline-flex items-center text-white">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={salvar} className="flex flex-col gap-4 p-5">
                            <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Título *</label>
                                <input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} onFocus={() => setFocusedInput('titulo')} onBlur={() => setFocusedInput(null)} style={getInputStyle('titulo')} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Tipo *</label>
                                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={getInputStyle('tipo')}>
                                        <option value="Geral">Geral — Verde</option>
                                        <option value="Importante">Importante — Amarelo</option>
                                        <option value="Urgente">Urgente — Vermelho</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Depto. Autor *</label>
                                    <input required value={form.departamento_autor} onChange={e => setForm({ ...form, departamento_autor: e.target.value })} onFocus={() => setFocusedInput('depto')} onBlur={() => setFocusedInput(null)} style={getInputStyle('depto')} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Conteúdo *</label>
                                <textarea required rows={4} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} onFocus={() => setFocusedInput('descricao')} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle('descricao'), resize: 'none' }} />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Link Adicional (Opcional)</label>
                                <input type="url" value={form.link_opcional} onChange={e => setForm({ ...form, link_opcional: e.target.value })} onFocus={() => setFocusedInput('link')} onBlur={() => setFocusedInput(null)} style={getInputStyle('link')} />
                            </div>
                            <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                                <button
                                    type="button"
                                    onClick={() => setModalAberto(false)}
                                    className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                                    style={{ borderColor: C.line, background: C.surface, color: C.ink2 }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="rounded-lg px-5 py-2 text-sm font-bold text-white transition-all disabled:opacity-60"
                                    style={{ background: C.accent }}
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