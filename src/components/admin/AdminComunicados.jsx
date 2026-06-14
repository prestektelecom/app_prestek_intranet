import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORM_VAZIO = { titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '' };

const C = { bg: '#F5F9FF', surface: '#FFFFFF', surfaceSoft: '#F7FAFD', accent: '#4A9EF5', accentDark: '#2D7BD4', accentDeep: '#1F5BA8', accentSoft: '#EAF4FF', ink: '#0B1B2E', ink2: '#475467', muted: '#8896A8', line: '#E4ECF5', success: '#1F8A5B', successSoft: '#E6F4EC', warning: '#D97706', warningSoft: '#FEF3E2', danger: '#E84545', dangerSoft: '#FDEDED' };

const TYPE_META = {
    Urgente: { color: C.danger, soft: C.dangerSoft, icon: 'priority_high', label: 'URGENTE' },
    Importante: { color: C.warning, soft: C.warningSoft, icon: 'notification_important', label: 'IMPORTANTE' },
    Geral: { color: C.success, soft: C.successSoft, icon: 'article', label: 'GERAL' }
};

function relativeTime(d) {
    if (!d) return ''; const diff = (new Date() - new Date(d)) / 1000;
    if (diff < 60) return 'agora'; if (diff < 3600) return `há ${Math.floor(diff/60)}min`;
    if (diff < 86400) return `há ${Math.floor(diff/3600)}h`; if (diff < 604800) return `há ${Math.floor(diff/86400)}d`;
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function AdminComunicados({ adminEmail }) {
    const [comunicados, setComunicados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);

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

    const getInputStyle = (name) => ({
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: C.surfaceSoft,
        border: `1.5px solid ${focusedInput === name ? C.accent : C.line}`, borderRadius: 8,
        fontSize: 14, color: C.ink, outline: 'none', transition: 'all 0.15s',
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'end', gap: 16 }}>
                <div>
                    <h1 style={{ margin: 0, color: C.ink, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Gerenciar Comunicados</h1>
                    <p style={{ margin: '4px 0 0', color: C.ink2, fontSize: 14 }}>Crie, edite e exclua os comunicados exibidos na intranet.</p>
                </div>
                <button onClick={abrirNovo} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: C.accent, color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = C.accentDark} onMouseLeave={e => e.currentTarget.style.background = C.accent}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Novo Comunicado
                </button>
            </div>

            {erro && <div style={{ background: C.dangerSoft, border: `1px solid ${C.danger}`, borderRadius: 10, padding: 16, color: C.danger, fontSize: 14 }}>{erro}</div>}

            {carregando ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: C.muted }}>Carregando...</div>
            ) : comunicados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: C.muted }}>Nenhum comunicado cadastrado.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {comunicados.map(c => {
                        const meta = TYPE_META[c.tipo] || TYPE_META.Geral;
                        return (
                            <div key={c.id} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, borderLeft: `4px solid ${meta.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, background: meta.soft, color: meta.color, fontSize: 10.5, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{meta.icon}</span>{meta.label}
                                            </span>
                                            <span style={{ fontSize: 11, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>{relativeTime(c.criado_em)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => abrirEditar(c)} style={{ border: 'none', background: 'none', padding: 4, borderRadius: 6, color: C.muted, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.color = C.accent} onMouseLeave={e => e.currentTarget.style.color = C.muted}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span></button>
                                            <button onClick={() => excluir(c.id)} disabled={excluindo === c.id} style={{ border: 'none', background: 'none', padding: 4, borderRadius: 6, color: C.muted, cursor: 'pointer', opacity: excluindo === c.id ? 0.5 : 1, display: 'inline-flex', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.color = C.danger} onMouseLeave={e => e.currentTarget.style.color = C.muted}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>{excluindo === c.id ? 'sync' : 'delete'}</span></button>
                                        </div>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750, color: C.ink, lineHeight: 1.4 }}>{c.titulo}</h3>
                                    <p style={{ margin: 0, fontSize: 13.5, color: C.ink2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.descricao}</p>
                                    <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>
                                        <span>DEPTO: {c.departamento_autor || 'GERAL'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modalAberto && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(11, 27, 46, 0.5)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: C.surface, borderRadius: 16, boxShadow: '0 20px 48px rgba(11,27,46,0.15)', width: '100%', maxWidth: 480, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                        <div style={{ background: `linear-gradient(120deg, ${C.accentDeep}, ${C.accent})`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{editando ? 'edit' : 'campaign'}</span>{editando ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>
                            <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span></button>
                        </div>
                        <form onSubmit={salvar} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>TÍTULO *</label>
                                <input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} onFocus={() => setFocusedInput('titulo')} onBlur={() => setFocusedInput(null)} style={getInputStyle('titulo')} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>TIPO *</label>
                                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={getInputStyle('tipo')}>
                                        <option value="Geral">Geral — Verde</option>
                                        <option value="Importante">Importante — Amarelo</option>
                                        <option value="Urgente">Urgente — Vermelho</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>DEPTO. AUTOR *</label>
                                    <input required value={form.departamento_autor} onChange={e => setForm({ ...form, departamento_autor: e.target.value })} onFocus={() => setFocusedInput('depto')} onBlur={() => setFocusedInput(null)} style={getInputStyle('depto')} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>CONTEÚDO *</label>
                                <textarea required rows={4} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} onFocus={() => setFocusedInput('descricao')} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle('descricao'), resize: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>LINK ADICIONAL (OPCIONAL)</label>
                                <input type="url" value={form.link_opcional} onChange={e => setForm({ ...form, link_opcional: e.target.value })} onFocus={() => setFocusedInput('link')} onBlur={() => setFocusedInput(null)} style={getInputStyle('link')} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'end', gap: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'white', color: C.ink2, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Cancelar</button>
                                <button type="submit" disabled={salvando} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: C.accent, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{salvando ? 'Salvando...' : 'Salvar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
