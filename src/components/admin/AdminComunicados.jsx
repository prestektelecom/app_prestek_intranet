import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORM_VAZIO = { titulo: '', conteudo: '', urgente: false, ativo: true };

export default function AdminComunicados({ adminEmail }) {
    const [comunicados, setComunicados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const res = await fetch(`${API}/api/comunicados`);
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao carregar comunicados');
            setComunicados(data.comunicados || []);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const abrirNovo = () => { setEditando(null); setForm(FORM_VAZIO); setModalAberto(true); };
    const abrirEditar = (c) => {
        setEditando(c);
        setForm({ titulo: c.titulo, conteudo: c.conteudo, urgente: c.urgente, ativo: c.ativo });
        setModalAberto(true);
    };

    const salvar = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.conteudo.trim()) return;
        setSalvando(true);
        try {
            const method = editando ? 'PUT' : 'POST';
            const url = editando ? `${API}/api/comunicados/${editando.id}` : `${API}/api/comunicados`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-admin-email': adminEmail },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.sucesso && !data.comunicado) throw new Error(data.erro || 'Erro ao salvar');
            setModalAberto(false);
            await carregar();
        } catch (e) {
            alert(`Erro: ${e.message}`);
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async (id) => {
        if (!window.confirm('Excluir este comunicado?')) return;
        setExcluindo(id);
        try {
            const res = await fetch(`${API}/api/comunicados/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-email': adminEmail },
            });
            const data = await res.json();
            if (!data.sucesso && !data.ok) throw new Error(data.erro || 'Erro ao excluir');
            setComunicados(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            alert(`Erro: ${e.message}`);
        } finally {
            setExcluindo(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-foreground text-3xl font-extrabold tracking-tight">Gerenciar Comunicados</h1>
                    <p className="text-muted text-sm mt-1">Crie, edite e exclua os comunicados exibidos na intranet.</p>
                </div>
                <button onClick={abrirNovo} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-md">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Novo Comunicado
                </button>
            </div>

            {erro && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">{erro}</div>
            )}

            {carregando ? (
                <div className="text-center py-16 text-muted">Carregando...</div>
            ) : comunicados.length === 0 ? (
                <div className="text-center py-16 text-muted">Nenhum comunicado cadastrado.</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {comunicados.map(c => (
                        <div key={c.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between card-elevated">
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-foreground truncate">{c.titulo}</span>
                                    {c.urgente && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">Urgente</span>}
                                    {!c.ativo  && <span className="text-xs bg-surface-raised text-muted px-2 py-0.5 rounded-full font-medium">Inativo</span>}
                                </div>
                                <p className="text-sm text-muted line-clamp-2">{c.conteudo}</p>
                                <p className="text-xs text-faint/60 mt-1">
                                    {c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => abrirEditar(c)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-raised transition-colors">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Editar
                                </button>
                                <button
                                    onClick={() => excluir(c.id)}
                                    disabled={excluindo === c.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-base">{excluindo === c.id ? 'sync' : 'delete'}</span>
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-foreground">
                                {editando ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>
                            <button onClick={() => setModalAberto(false)} className="text-muted hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={salvar} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-faint uppercase mb-1">Título *</label>
                                <input
                                    required
                                    value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-faint uppercase mb-1">Conteúdo *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.conteudo}
                                    onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                />
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={form.urgente} onChange={e => setForm(f => ({ ...f, urgente: e.target.checked }))} className="accent-primary w-4 h-4" />
                                    <span className="text-sm text-foreground">Urgente</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} className="accent-primary w-4 h-4" />
                                    <span className="text-sm text-foreground">Ativo</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-raised transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={salvando} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                                    {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Criar Comunicado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
