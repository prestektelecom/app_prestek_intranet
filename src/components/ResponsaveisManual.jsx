import { useState, useEffect, useCallback, useMemo } from 'react';
import BentoAvatar from './common/Avatar';
import EquipeSetor from './admin/EquipeSetor';
import { useBentoTheme, BENTO_LIGHT } from '../hooks/useBentoTheme';

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

export default function ResponsaveisManual() {
    const C = useBentoTheme();
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const [setores, setSetores] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [responsaveisManuais, setResponsaveisManuais] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(null);
    const [erro, setErro] = useState(null);
    const [busca, setBusca] = useState('');
    const [setorAberto, setSetorAberto] = useState(null);
    // Painel de equipe do setor (ajustes de membros só na intranet), separado do
    // seletor de responsável: os dois não ficam abertos ao mesmo tempo.
    const [equipeAberta, setEquipeAberta] = useState(null);
    const [buscaFunc, setBuscaFunc] = useState('');
    // Clicar num nome gravava na hora, sem confirmação — mesma classe do
    // achado de conceder admin (Fase 15, P0), um degrau abaixo em
    // consequência (aqui sempre reversível com 1 clique em "Resetar", lá não
    // havia undo nenhum). Por ser reversível e a lista ser curta, uma
    // confirmação inline (não um modal) já cobre o risco.
    const [candidato, setCandidato] = useState(null);

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const [resSetores, resFunc, resManuais] = await Promise.all([
                fetch('/api/setores'),
                fetch('/api/colaboradores?all=true'),
                fetch('/api/admin/responsaveis-manuais')
            ]);
            const dSetores = await resSetores.json();
            const dFunc = await resFunc.json();
            const dManuais = await resManuais.json();

            if (dSetores.sucesso) setSetores(dSetores.setores || []);
            if (dFunc.sucesso) setFuncionarios(dFunc.colaboradores || []);
            if (dManuais.sucesso) {
                const mapa = {};
                (dManuais.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
            }
        } catch {
            setErro('Erro ao carregar dados. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    // Depois de um ajuste de equipe: o POST devolve a lista completa de ajustes.
    // Reaplica nas pessoas já carregadas e recarrega os setores (totais e marca
    // "equipe ajustada"), já que o cache do backend foi invalidado.
    const aoAjustarEquipe = useCallback(async (ajustes) => {
        const porPessoa = {};
        (ajustes || []).forEach(a => {
            (porPessoa[String(a.id_funcionario)] ||= []).push({ id_setor: String(a.id_setor), acao: a.acao });
        });
        setFuncionarios(prev => prev.map(f => ({ ...f, ajustes_setores: porPessoa[String(f.funcionario_id ?? f.id)] || [] })));
        try {
            const res = await fetch('/api/setores');
            const data = await res.json();
            if (data.sucesso) setSetores(data.setores || []);
        } catch { /* a lista de pessoas já está atualizada; os totais voltam no próximo "Atualizar" */ }
    }, []);

    const confirmarResponsavel = async () => {
        if (!candidato) return;
        const { id_setor, funcionario } = candidato;
        setCandidato(null);
        await definirResponsavel(id_setor, funcionario);
    };

    const definirResponsavel = async (id_setor, funcionario) => {
        setSalvando(id_setor);
        try {
            const res = await fetch('/api/admin/responsaveis-manuais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_setor: String(id_setor),
                    id_funcionario: String(funcionario.funcionario_id || funcionario.id),
                    nome: funcionario.funcionario_nome || funcionario.nome,
                    acao: 'definir'
                })
            });
            const data = await res.json();
            if (data.sucesso) {
                const mapa = {};
                (data.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
                setSetorAberto(null);
                setBuscaFunc('');
            } else {
                setErro('Erro ao salvar. Tente novamente.');
            }
        } catch {
            setErro('Erro ao salvar. Tente novamente.');
        } finally {
            setSalvando(null);
        }
    };

    const limparResponsavel = async (id_setor) => {
        setSalvando(id_setor);
        try {
            const res = await fetch('/api/admin/responsaveis-manuais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_setor: String(id_setor), acao: 'limpar' })
            });
            const data = await res.json();
            if (data.sucesso) {
                const mapa = {};
                (data.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
            } else {
                setErro('Erro ao limpar. Tente novamente.');
            }
        } catch {
            setErro('Erro ao limpar. Tente novamente.');
        } finally {
            setSalvando(null);
        }
    };

    const funcionariosFiltrados = useMemo(() => {
        const termo = buscaFunc.toLowerCase().trim();
        return funcionarios
            .filter(f => f.ativo === 'S' || f.ativo === true || f.status === 'online')
            .filter(f => !termo || (f.funcionario_nome || f.nome || '').toLowerCase().includes(termo))
            .slice(0, 30);
    }, [funcionarios, buscaFunc]);

    const setoresFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return setores;
        return setores.filter(s => s.nome.toLowerCase().includes(termo));
    }, [setores, busca]);

    const totalManuais = Object.keys(responsaveisManuais).length;
    const totalSetores = setores.length;
    const totalAutomaticos = Math.max(0, totalSetores - totalManuais);

    const stats = [
        { label: 'Total de Setores', valor: totalSetores, icon: 'domain', cor: C.accent, bg: C.accentSoft },
        { label: 'Definidos Manualmente', valor: totalManuais, icon: 'edit_note', cor: C.success, bg: C.successSoft },
        { label: 'Automáticos', valor: totalAutomaticos, icon: 'autorenew', cor: C.info, bg: tone(C.info, 0.15) },
    ];

    if (carregando) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: C.accent }}>refresh</span>
                <p className="text-sm" style={{ color: C.ink2 }}>Carregando setores e colaboradores...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Responsável por Setor</h1>
                    <p className="mt-1 text-sm" style={{ color: C.ink2 }}>
                        Defina manualmente o responsável exibido em cada card do Diretório de Setores (tem prioridade sobre os Grupos de Supervisor) e, em "Equipe", quem faz parte de cada setor. Tudo vale só na intranet; o IXC não muda.
                    </p>
                </div>
                <button
                    onClick={carregarDados}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
                    style={{ background: C.accent, color: C.onAccent }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDark; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
                >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Atualizar
                </button>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map(s => (
                    <div
                        key={s.label}
                        className="flex items-center gap-4 rounded-2xl border p-4"
                        style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                    >
                        <div style={sIconBox(s.cor, s.bg)}>
                            <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: C.ink }}>{s.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Erro */}
            {erro && (
                <div
                    className="flex items-center gap-2 rounded-xl border p-3 text-sm"
                    style={{ background: C.dangerSoft, borderColor: tone(C.danger, 0.35), color: C.danger }}
                >
                    <span className="material-symbols-outlined text-base">error</span>
                    {erro}
                </div>
            )}

            {/* Aviso informativo */}
            <div
                className="flex items-start gap-2 rounded-xl border p-3 text-xs"
                style={{ background: C.accentSoft, borderColor: C.accent, color: C.accentDeep }}
            >
                <span className="material-symbols-outlined shrink-0 text-base">info</span>
                <span>Setores <strong>sem definição manual</strong> continuam usando a lógica automática dos <strong>Grupos de Supervisor</strong>.</span>
            </div>

            {/* Busca de setor */}
            <div
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{ background: C.surface, borderColor: C.line }}
            >
                <span className="material-symbols-outlined text-xl" style={{ color: C.muted }}>search</span>
                <input
                    type="text"
                    placeholder="Buscar setor..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: C.ink }}
                />
                {busca && (
                    <button
                        onClick={() => setBusca('')}
                        className="transition-colors"
                        style={{ color: C.muted }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = C.ink2; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                )}
            </div>

            {/* Lista de setores */}
            <div className="flex flex-col gap-3">
                {setoresFiltrados.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10" style={{ color: C.ink2 }}>
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full"
                            style={{ background: C.accentSoft, color: C.accent }}
                        >
                            <span className="material-symbols-outlined text-2xl">search_off</span>
                        </div>
                        <p className="text-sm">Nenhum setor encontrado.</p>
                    </div>
                )}
                {setoresFiltrados.map(setor => {
                    const manual = responsaveisManuais[String(setor.id)];
                    const isAberto = setorAberto === setor.id;
                    const isSalvando = salvando === setor.id;
                    const responsavelAtual = manual
                        ? { nome: manual.nome, isManual: true }
                        : setor.responsavel
                            ? { nome: setor.responsavel.nome, isManual: false }
                            : null;

                    return (
                        <div
                            key={setor.id}
                            className="overflow-hidden rounded-2xl border transition-all"
                            style={{
                                background: manual ? C.accentSoft : C.surface,
                                borderColor: manual ? C.accent : C.line,
                                boxShadow: manual ? `0 1px 3px ${tone(C.accentDeep, 0.08)}` : `0 1px 3px ${tone(C.accentDeep, 0.03)}`,
                            }}
                        >
                            {/* Linha principal */}
                            <div className="flex items-center justify-between gap-4 p-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    {/* Ícone do setor */}
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                        style={{
                                            background: manual ? C.accent : C.surfaceSoft,
                                            color: manual ? '#fff' : C.accent,
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">domain</span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold" style={{ color: C.ink }}>{setor.nome}</span>
                                            <span className="text-xs" style={{ color: C.ink2 }}>{setor.totalMembros} membro{setor.totalMembros !== 1 ? 's' : ''}</span>
                                            {setor.ajustado && (
                                                <span className="text-xs font-semibold" style={{ color: C.ink2 }}>
                                                    · equipe ajustada na intranet
                                                </span>
                                            )}
                                            {manual && (
                                                <span
                                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                                                    style={{ background: C.accent, color: '#fff' }}
                                                >
                                                    <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>edit_note</span>
                                                    MANUAL
                                                </span>
                                            )}
                                        </div>
                                        {/* Responsável atual */}
                                        <p className="mt-0.5 text-xs" style={{ color: C.ink2 }}>
                                            {responsavelAtual ? (
                                                <>
                                                    <span
                                                        className="font-semibold"
                                                        style={{ color: responsavelAtual.isManual ? (isDark ? C.accentDark : C.accentDeep) : C.ink2 }}
                                                    >
                                                        {responsavelAtual.nome}
                                                    </span>
                                                    <span className="ml-1 text-[10px] opacity-70">
                                                        ({responsavelAtual.isManual ? 'definido manualmente' : 'automático'})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="italic opacity-60">Sem responsável definido</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex shrink-0 items-center gap-2">
                                    {manual && (
                                        <button
                                            onClick={() => limparResponsavel(setor.id)}
                                            disabled={isSalvando}
                                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ background: C.dangerSoft, color: C.danger }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = C.danger; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = C.dangerSoft; e.currentTarget.style.color = C.danger; }}
                                        >
                                            {isSalvando ? (
                                                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">undo</span>
                                            )}
                                            <span className="hidden sm:inline">Resetar</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEquipeAberta(equipeAberta === setor.id ? null : setor.id);
                                            setSetorAberto(null);
                                            setCandidato(null);
                                        }}
                                        aria-expanded={equipeAberta === setor.id}
                                        aria-label={`Equipe de ${setor.nome}`}
                                        className="flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors"
                                        style={{ background: C.surface, color: C.ink2, borderColor: C.line }}
                                    >
                                        <span className="material-symbols-outlined text-sm" aria-hidden="true">groups</span>
                                        <span className="hidden sm:inline">Equipe</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSetorAberto(isAberto ? null : setor.id);
                                            setEquipeAberta(null);
                                            setBuscaFunc('');
                                            setCandidato(null);
                                        }}
                                        disabled={isSalvando}
                                        className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{ background: C.accent, color: C.onAccent }}
                                        onMouseEnter={(e) => { if (!isSalvando) e.currentTarget.style.background = C.accentDark; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
                                    >
                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                        <span className="hidden sm:inline">{manual ? 'Alterar' : 'Definir'}</span>
                                    </button>
                                </div>
                            </div>

                            {equipeAberta === setor.id && (
                                <EquipeSetor setor={setor} colaboradores={funcionarios} onAjustes={aoAjustarEquipe} />
                            )}

                            {/* Dropdown de seleção de funcionário */}
                            {isAberto && candidato?.id_setor === setor.id && (
                                <div className="px-4 pb-4">
                                    <div
                                        role="alertdialog"
                                        aria-label="Confirmar responsável"
                                        className="flex flex-col gap-3 rounded-xl border p-4"
                                        style={{ background: C.accentSoft, borderColor: C.accent }}
                                    >
                                        <p className="text-sm" style={{ color: C.ink }}>
                                            Definir <strong>{candidato.funcionario.funcionario_nome || candidato.funcionario.nome}</strong> como
                                            responsável por <strong>{setor.nome}</strong>?
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCandidato(null)}
                                                className="min-h-[40px] flex-1 rounded-lg px-3 text-sm font-bold transition-colors"
                                                style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={confirmarResponsavel}
                                                disabled={salvando === setor.id}
                                                className="min-h-[40px] flex-1 rounded-lg px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                style={{ background: C.accent, color: C.onAccent }}
                                            >
                                                {salvando === setor.id ? 'Salvando…' : 'Confirmar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isAberto && !candidato && (
                                <div className="px-4 pb-4">
                                    <div
                                        className="overflow-hidden rounded-xl border"
                                        style={{ background: C.surface, borderColor: C.line }}
                                    >
                                        {/* Campo de busca do funcionário */}
                                        <div
                                            className="flex items-center gap-2 border-b px-3 py-2.5"
                                            style={{ background: C.surfaceSoft, borderColor: C.line }}
                                        >
                                            <span className="material-symbols-outlined text-lg" style={{ color: C.muted }}>search</span>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Buscar colaborador ativo..."
                                                value={buscaFunc}
                                                onChange={e => setBuscaFunc(e.target.value)}
                                                className="flex-1 bg-transparent text-sm outline-none"
                                                style={{ color: C.ink }}
                                            />
                                        </div>
                                        {/* Lista de funcionários */}
                                        <div className="max-h-56 overflow-y-auto scrollbar-hide">
                                            {funcionariosFiltrados.length === 0 && (
                                                <p className="py-6 text-center text-xs" style={{ color: C.ink2 }}>
                                                    Nenhum colaborador encontrado.
                                                </p>
                                            )}
                                            {funcionariosFiltrados.map(func => {
                                                const nome = func.funcionario_nome || func.nome || '—';
                                                return (
                                                    <button
                                                        key={func.funcionario_id || func.id}
                                                        onClick={() => setCandidato({ id_setor: setor.id, funcionario: func })}
                                                        className="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-0"
                                                        style={{ borderColor: C.lineSoft }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = C.accentSoft; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <BentoAvatar name={nome} size={32} color={[C.accent, '#fff']} />
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold" style={{ color: C.ink }}>{nome}</p>
                                                            {func.usuario_email && (
                                                                <p className="truncate text-xs" style={{ color: C.ink2 }}>{func.usuario_email}</p>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}