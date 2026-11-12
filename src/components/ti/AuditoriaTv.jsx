import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { obter } from './cadastro/api';
import { BTN_SECUNDARIO, CAMPO, CARD, FAIXA, ROTULO, AVISO_AMBAR, AVISO_ERRO, AVISO_INFO } from './cadastro/estilos';

/**
 * Auditoria de assinaturas de TV — SOMENTE LEITURA.
 *
 * Duas listas, ambas vindas de /api/ti/auditoria-tv (cruzamento tv_usuarios ×
 * cliente_contrato × vd_contratos_produtos feito no backend):
 *   1. pagandoSemDireito   — assinatura ligada, contrato sem direito a ela.
 *   2. cobrandoSemEntregar — produto de TV cobrado, assinatura não ativa.
 *
 * Não mostra "último acesso"/uso: o IXC não guarda esse dado.
 */

const LISTAS = [
    {
        id: 'pagandoSemDireito',
        label: 'Assinatura ativa, contrato sem direito',
        curto: 'Possível custo à toa',
        vazio: 'Nenhuma assinatura ativa com contrato inativo ou bloqueado.',
        ajuda: 'A plataforma continua com a assinatura ligada, mas o contrato está inativo ou com a internet bloqueada. Candidatas a cancelamento na plataforma.',
    },
    {
        id: 'cobrandoSemEntregar',
        label: 'Cobrando sem assinatura ativa',
        curto: 'Possível cobrança indevida',
        vazio: 'Nenhum contrato ativo com produto de TV cobrado e assinatura inativa.',
        ajuda: 'O contrato está ativo e o produto de TV tem valor cobrado, mas o login não está ativo na plataforma. Conferir antes de reativar ou estornar. Produtos de valor zero (cortesia) ficam de fora.',
    },
];

const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Neutraliza injeção de fórmula em planilha: o login vem do cliente final.
const celulaCsv = (v) => {
    let t = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
    return `"${t.replace(/"/g, '""')}"`;
};

function baixarCsv(nome, linhas) {
    const cab = ['Plataforma', 'Contrato', 'Login', 'Produto', 'Valor mensal', 'Situação do contrato', 'Gravidade', 'Motivo'];
    const corpo = linhas.map(i => [
        i.plataforma, i.idContrato, i.login, i.produto,
        String(i.valorMensal).replace('.', ','), i.statusContrato,
        i.gravidade === 'critico' ? 'Crítico' : 'Atenção', i.motivo,
    ]);
    // BOM + ';' para o Excel pt-BR abrir com acento e colunas certas.
    const texto = '\uFEFF' + [cab, ...corpo].map(l => l.map(celulaCsv).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
}

function Gravidade({ nivel }) {
    // Texto + ícone, nunca só cor.
    const critico = nivel === 'critico';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
            critico
                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
        }`}>
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{critico ? 'error' : 'warning'}</span>
            {critico ? 'Crítico' : 'Atenção'}
        </span>
    );
}

export default function AuditoriaTv({ user, onLog, onHero }) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [listaId, setListaId] = useState(LISTAS[0].id);
    const [plataforma, setPlataforma] = useState('');
    const [busca, setBusca] = useState('');

    const carregar = useCallback(async (forcar = false) => {
        setCarregando(true);
        setErro('');
        try {
            const r = await obter(`/api/ti/auditoria-tv${forcar ? '?atualizar=1' : ''}`, user);
            setDados(r);
            onLog?.(
                `Auditoria de TV ${r.doCache ? '(cache)' : 'consultada no IXC'}: ` +
                `${r.resumo.pagandoSemDireito} com assinatura sem direito, ${r.resumo.cobrandoSemEntregar} cobrando sem assinatura.`,
                'sucesso',
            );
        } catch (e) {
            setErro(e.message);
            onLog?.(`Falha na auditoria de TV: ${e.message}`, 'erro');
        } finally {
            setCarregando(false);
        }
    }, [user, onLog]);

    useEffect(() => { carregar(false); }, [carregar]);

    useEffect(() => {
        const r = dados?.resumo;
        onHero?.({
            isLoading: carregando && !dados,
            etapa: carregando ? 'Consultando o IXC' : dados ? 'Atualizado' : 'Sem dados',
            kpis: [
                { label: 'Assinaturas', valor: r?.totalAssinaturas ?? '—', sub: `${r?.assinaturasAtivas ?? '—'} ativas` },
                { label: 'Sem direito', valor: r?.pagandoSemDireito ?? '—', sub: r ? `${brl(r.pagandoSemDireitoValor)}/mês` : '' },
                { label: 'Sem assinatura', valor: r?.cobrandoSemEntregar ?? '—', sub: r ? `${brl(r.cobrandoSemEntregarValor)}/mês` : '' },
                { label: 'Gravação', valor: 'leitura', sub: 'nada é alterado' },
            ],
        });
    }, [dados, carregando, onHero]);

    const lista = LISTAS.find(l => l.id === listaId);
    const itens = dados?.[listaId] ?? [];

    const plataformas = useMemo(
        () => [...new Set([...(dados?.pagandoSemDireito ?? []), ...(dados?.cobrandoSemEntregar ?? [])].map(i => i.plataforma))].sort(),
        [dados],
    );

    const filtrados = useMemo(() => {
        const q = busca.trim().toLowerCase();
        return itens.filter(i =>
            (!plataforma || i.plataforma === plataforma) &&
            (!q || i.login.toLowerCase().includes(q) || i.idContrato.includes(q) || i.produto.toLowerCase().includes(q)),
        );
    }, [itens, plataforma, busca]);

    const totalValor = filtrados.reduce((a, i) => a + i.valorMensal, 0);
    const geradoEm = dados?.geradoEm ? new Date(dados.geradoEm).toLocaleString('pt-BR') : '';

    return (
        <section className="flex flex-col gap-6" aria-busy={carregando}>
            <div className={AVISO_INFO}>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">info</span>
                <span>
                    Esta auditoria mostra se a assinatura está <strong>ativa</strong>, não se o cliente está
                    assistindo. O IXC não guarda último acesso nem uso. Os dados vêm só de leitura do IXC;
                    nenhuma plataforma de TV é consultada e nada é gravado.
                </span>
            </div>

            <div className={CARD}>
                <div className={FAIXA} />
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                    <div role="tablist" aria-label="Listas da auditoria" className="flex flex-wrap gap-2">
                        {LISTAS.map(l => {
                            const sel = l.id === listaId;
                            const n = dados?.[l.id]?.length;
                            return (
                                <button
                                    key={l.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={sel}
                                    onClick={() => setListaId(l.id)}
                                    className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                                        sel
                                            ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)] ring-1 ring-inset ring-[var(--accent)]/50'
                                            : 'bg-surface-raised text-faint hover:bg-background'
                                    }`}
                                >
                                    {l.label}
                                    {n != null ? <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[11px]">{n}</span> : null}
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-[13px] leading-relaxed text-faint">{lista.ajuda}</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto_auto]">
                        <div>
                            <label htmlFor="tv-busca" className={ROTULO}>Buscar</label>
                            <input id="tv-busca" type="search" value={busca} onChange={e => setBusca(e.target.value)}
                                   placeholder="Login, contrato ou produto" className={`${CAMPO} mt-1`} />
                        </div>
                        <div>
                            <label htmlFor="tv-plataforma" className={ROTULO}>Plataforma</label>
                            <select id="tv-plataforma" value={plataforma} onChange={e => setPlataforma(e.target.value)} className={`${CAMPO} mt-1`}>
                                <option value="">Todas</option>
                                {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <button type="button" className={`${BTN_SECUNDARIO} self-end`} disabled={!filtrados.length}
                                onClick={() => {
                                    baixarCsv(`auditoria-tv-${listaId}.csv`, filtrados);
                                    onLog?.(`CSV exportado: ${filtrados.length} linha(s) de "${lista.label}".`, 'info');
                                }}>
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
                            Exportar CSV
                        </button>
                        <button type="button" className={`${BTN_SECUNDARIO} self-end`} disabled={carregando} onClick={() => carregar(true)}>
                            <span className={`material-symbols-outlined text-[18px] ${carregando ? 'animate-spin' : ''}`} aria-hidden="true">refresh</span>
                            {carregando ? 'Consultando…' : 'Atualizar'}
                        </button>
                    </div>

                    {erro ? <div role="alert" className={AVISO_ERRO}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>{erro}</div> : null}
                    {carregando && !dados ? (
                        <div className={AVISO_AMBAR} role="status">
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">hourglass_top</span>
                            Cruzando ~62 mil registros do IXC. A primeira consulta leva cerca de 40 segundos.
                        </div>
                    ) : null}

                    {dados ? (
                        <>
                            <p className="font-mono text-[11px] text-faint" aria-live="polite">
                                {filtrados.length} de {itens.length} · {brl(totalValor)}/mês
                                {geradoEm ? ` · gerado em ${geradoEm}${dados.doCache ? ' (cache de até 10 min)' : ''}` : ''}
                            </p>

                            {filtrados.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-faint">
                                    {itens.length === 0 ? lista.vazio : 'Nenhum resultado para o filtro atual.'}
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-border" tabIndex={0} role="region" aria-label={lista.label}>
                                    <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
                                        <thead className="bg-surface-raised">
                                            <tr>
                                                {['Gravidade', 'Plataforma', 'Contrato', 'Login', 'Produto', 'Valor/mês', 'Situação', 'Motivo'].map(h => (
                                                    <th key={h} scope="col" className={`${ROTULO} px-3 py-2.5`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtrados.slice(0, 300).map(i => (
                                                <tr key={i.idUsuario} className="border-t border-border align-top">
                                                    <td className="px-3 py-2.5"><Gravidade nivel={i.gravidade} /></td>
                                                    <td className="px-3 py-2.5 font-semibold">{i.plataforma}</td>
                                                    <td className="px-3 py-2.5 font-mono">{i.idContrato}</td>
                                                    <td className="max-w-[220px] break-all px-3 py-2.5">{i.login}</td>
                                                    <td className="px-3 py-2.5">{i.produto || '—'}</td>
                                                    <td className="px-3 py-2.5 font-mono tabular-nums">{brl(i.valorMensal)}</td>
                                                    <td className="px-3 py-2.5">{i.statusContrato}</td>
                                                    <td className="min-w-[240px] px-3 py-2.5 text-faint">{i.motivo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {filtrados.length > 300 ? (
                                <p className="text-xs text-faint">Mostrando as 300 primeiras de {filtrados.length}. O CSV exporta todas.</p>
                            ) : null}
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
