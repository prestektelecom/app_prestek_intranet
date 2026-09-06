import React, { useState } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { neumorfismo, relevo, reentrancia } from '../directory/neumorfismo';
import { useDeptColor } from '../directory/deptColors';
import { getDescricaoForSetor, getIconForSetor } from './sectorMeta';

/**
 * Card de setor — mesma superfície neumórfica do EmployeeCard, com o conteúdo
 * remapeado: no lugar do avatar central, o tile do ícone na cor categórica do
 * setor (useDeptColor), que substitui o laranja uniforme da versão anterior e
 * devolve identidade a cada card.
 *
 * Sem scale no hover: os cards têm altura variável (descrição expansível) e o
 * scale desalinha a fileira. translateY basta.
 */
export default function SectorCard({ setor, isAdmin, onSaveDescription, setCurrentView }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const n = neumorfismo(C);
    const { tinta, marca } = corDe(setor.nome);

    const [hover, setHover] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDesc, setEditDesc] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState('');

    const description = setor.descricao_customizada || getDescricaoForSetor(setor.nome);
    const icon = getIconForSetor(setor.nome);
    const ramal = setor.responsavel?.ramal && setor.responsavel.ramal !== '0' ? setor.responsavel.ramal : null;
    const managerName = setor.responsavel?.nome || null;
    const managerImg = setor.responsavel?.foto || null;
    const podeExpandir = description && description.length > 90;

    const handleSave = async () => {
        setSalvando(true);
        setErroSalvar('');
        const resultado = await onSaveDescription(setor.id, editDesc);
        setSalvando(false);
        if (resultado.ok) setIsEditing(false);
        else setErroSalvar(resultado.mensagem || 'Não foi possível salvar.');
    };

    const handleVerEquipe = () => {
        sessionStorage.setItem('@Stitch:directoryFilter', setor.id);
        setCurrentView('directory');
    };

    return (
        <li
            className="flex flex-col gap-4 rounded-3xl p-6 transition-all duration-300"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: n.face,
                boxShadow: hover ? relevo(n, 20, 40) : relevo(n, 12, 24),
                transform: hover ? 'translateY(-4px)' : 'none',
                // Sempre presente e transparente, para a transição não empurrar
                // o layout em 1px.
                border: `1px solid ${hover ? tone(marca, 0.45) : 'transparent'}`,
            }}
        >
            {/* Topo: ícone na cor do setor + ramal do responsável */}
            <div className="flex items-start justify-between gap-3">
                <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: tone(marca, 0.12) }}
                >
                    <span className="material-symbols-outlined text-[26px]" style={{ color: tinta }} aria-hidden="true">{icon}</span>
                </div>
                {ramal && (
                    <span
                        className="rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] tabular-nums"
                        style={{ background: tone(marca, 0.12), color: tinta }}
                    >
                        Ramal {ramal}
                    </span>
                )}
            </div>

            {/* Título + descrição */}
            <div>
                <h3 className="m-0 mb-2 text-[19px] font-extrabold tracking-[-0.01em]" style={{ color: C.ink }}>
                    {setor.nome}
                </h3>

                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            rows={3}
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            placeholder="Digite a descrição do setor..."
                            aria-label={`Descrição do setor ${setor.nome}`}
                            disabled={salvando}
                            className="w-full resize-none rounded-xl p-3 text-[13.5px] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-60"
                            style={{ background: C.surfaceSoft, color: C.ink, border: `1px solid ${C.line}` }}
                        />
                        {erroSalvar && (
                            <p role="alert" className="m-0 text-[12.5px] font-semibold" style={{ color: 'var(--danger-bento)' }}>
                                {erroSalvar}
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setErroSalvar(''); }}
                                disabled={salvando}
                                className="min-h-[40px] cursor-pointer rounded-lg px-3 text-[12.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
                                style={{ color: C.muted, background: 'none', border: 'none' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={salvando}
                                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg px-4 text-[12.5px] font-bold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-70"
                                style={{ background: C.accent, border: 'none' }}
                            >
                                {salvando && (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                                )}
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {description && (
                            <p
                                title={description}
                                className="m-0 text-[13.5px] leading-[1.55]"
                                style={{
                                    color: C.ink2,
                                    display: isExpanded ? 'block' : '-webkit-box',
                                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    paddingRight: isAdmin ? 32 : 0,
                                }}
                            >
                                {description}
                            </p>
                        )}
                        {podeExpandir && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(v => !v)}
                                aria-expanded={isExpanded}
                                className="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded p-0 text-[12px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                style={{ color: tinta, background: 'none', border: 'none' }}
                            >
                                {isExpanded ? 'Ver menos' : 'Ver mais'}
                                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                            </button>
                        )}
                        {isAdmin && (
                            // Sempre visível (nada de revelar no hover — AGENTS.md);
                            // after:-inset-3 leva o alvo de 26px para 50px sem
                            // ocupar layout.
                            <button
                                type="button"
                                onClick={() => { setEditDesc(setor.descricao_customizada || description || ''); setErroSalvar(''); setIsEditing(true); }}
                                aria-label={`Editar descrição do setor ${setor.nome}`}
                                title="Editar descrição"
                                className="absolute -top-0.5 right-0 flex cursor-pointer items-center justify-center rounded-lg p-1 opacity-60 transition-opacity after:absolute after:-inset-3 after:content-[''] hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                style={{ background: 'none', border: `1px solid ${C.line}`, color: tinta }}
                            >
                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">edit</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Responsável + Equipe */}
            <div
                className="flex items-center gap-3 py-4"
                style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}
            >
                {managerName ? (
                    <>
                        {managerImg ? (
                            <div
                                className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${managerImg}')`, boxShadow: `0 0 0 2px ${marca}` }}
                            />
                        ) : (
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{ background: tone(marca, 0.12), boxShadow: `0 0 0 2px ${marca}` }}
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ color: tinta }} aria-hidden="true">person</span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="m-0 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.muted }}>Responsável</p>
                            <p className="m-0 mt-0.5 truncate text-[13.5px] font-bold" style={{ color: C.ink }}>{managerName}</p>
                        </div>
                    </>
                ) : (
                    <div className="min-w-0 flex-1">
                        <p className="m-0 text-[12.5px] font-semibold" style={{ color: C.muted }}>Sem responsável definido</p>
                    </div>
                )}
                <div className="shrink-0 pl-3 text-right" style={{ borderLeft: `1px solid ${C.line}` }}>
                    <p className="m-0 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.muted }}>Equipe</p>
                    <p className="m-0 mt-0.5 text-[13.5px] font-bold tabular-nums" style={{ color: C.ink }}>{setor.totalMembros}</p>
                </div>
            </div>

            <ComposicaoGrupos grupos={setor.grupos} marca={marca} tinta={tinta} C={C} />

            {/* Ações — mt-auto ancora no rodapé mesmo com descrição expandida */}
            <div className="mt-auto flex gap-2">
                <AcaoRelevo
                    onClick={handleVerEquipe}
                    aria={`Ver equipe do setor ${setor.nome}`}
                    n={n}
                    C={C}
                    corHover={tinta}
                    fundoHover={tone(marca, 0.12)}
                    className="flex-1"
                >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">groups</span>
                    Ver Equipe
                </AcaoRelevo>
                {ramal && (
                    <AcaoRelevo
                        href={`tel:${ramal}`}
                        aria={`Ligar para o ramal ${ramal}${managerName ? ` de ${managerName}` : ''}`}
                        title={`Ramal ${ramal}`}
                        n={n}
                        C={C}
                        corHover={tinta}
                        fundoHover={tone(marca, 0.12)}
                        className="w-14"
                    >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
                    </AcaoRelevo>
                )}
            </div>
        </li>
    );
}

/**
 * Composição da equipe por grupo IXC — o segundo eixo do diretório.
 *
 * Mostra 3 grupos e resume o resto: com até 8 grupos por setor, a lista inteira
 * roubaria a hierarquia do card, que é setor → responsável → equipe.
 *
 * Sem sombra neumórfica: o card já carrega duas, e uma terceira camada de relevo
 * nesta escala vira ruído. Reusa a mesma forma do chip de ramal lá em cima.
 */
function ComposicaoGrupos({ grupos, marca, tinta, C }) {
    // 10 dos 29 setores estão vazios — sem isto, ficariam com um rótulo órfão.
    if (!grupos?.length) return null;

    const MOSTRAR = 3;

    // Ordem por MASSA, não pela hierárquica que o backend devolve. O Diretório
    // lista a equipe inteira e ali a supervisão vem primeiro, que é o que se
    // procura ao abrir um setor. Aqui só cabem 3 chips: com a ordem hierárquica,
    // ATENDIMENTO exibia três grupos de supervisão de 1–3 pessoas e escondia o
    // grupo de 14 dentro do "+22" — o resumo omitia justamente a maioria da
    // equipe. O ★ continua marcando a supervisão onde quer que ela caia.
    const porMassa = [...grupos].sort((a, b) =>
        (!a.id !== !b.id) ? (a.id ? -1 : 1) : b.total - a.total);
    const visiveis = porMassa.slice(0, MOSTRAR);
    const restante = porMassa.slice(MOSTRAR).reduce((acc, g) => acc + g.total, 0);

    return (
        <div>
            <p className="m-0 mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: C.muted }}>
                Composição
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {visiveis.map(g => (
                    <li
                        key={g.id ?? 'sem'}
                        // O grupo sem rótulo cadastrado aparece como "Grupo 109".
                        // É pouco, mas é honesto: identifica a célula e permite
                        // batizá-la depois sem tocar na interface.
                        title={g.supervisor ? `${g.nome} — grupo de supervisão` : g.nome}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold"
                        style={
                            // "Sem grupo" é ausência de dado, não uma equipe: fica
                            // neutro para não competir com os grupos reais.
                            g.id
                                ? { background: tone(marca, 0.12), color: tinta }
                                : { background: C.surfaceSoft, color: C.muted }
                        }
                    >
                        {g.supervisor && (
                            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">stars</span>
                        )}
                        <span className="max-w-[13rem] truncate">{g.nome}</span>
                        <span className="font-mono tabular-nums opacity-70">{g.total}</span>
                    </li>
                ))}
                {restante > 0 && (
                    <li
                        title={porMassa.slice(MOSTRAR).map(g => `${g.nome}: ${g.total}`).join('\n')}
                        className="inline-flex items-center rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold tabular-nums"
                        style={{ background: C.surfaceSoft, color: C.muted }}
                    >
                        +{restante}
                    </li>
                )}
            </ul>
        </div>
    );
}

/**
 * Botão/link em relevo com a mesma rampa do EmployeeCard: saliente em repouso,
 * a sombra encolhe no hover (o botão desce em direção à superfície) e a
 * reentrância no pressionado atravessa o plano.
 */
function AcaoRelevo({ href, onClick, aria, title, corHover, fundoHover, n, C, className = '', children }) {
    const [hover, setHover] = useState(false);
    const [pressionado, setPressionado] = useState(false);
    const aceso = hover || pressionado;

    const Tag = href ? 'a' : 'button';

    return (
        <Tag
            href={href}
            type={href ? undefined : 'button'}
            onClick={onClick}
            aria-label={aria}
            title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => { setHover(false); setPressionado(false); }}
            onMouseDown={() => setPressionado(true)}
            onMouseUp={() => setPressionado(false)}
            onFocus={() => setHover(true)}
            onBlur={() => { setHover(false); setPressionado(false); }}
            className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`}
            style={{
                background: aceso && fundoHover ? fundoHover : n.face,
                color: aceso && corHover ? corHover : C.ink2,
                border: 'none',
                boxShadow: pressionado ? reentrancia(n, 4, 8) : hover ? relevo(n, 3, 6) : relevo(n, 6, 12),
                transform: pressionado ? 'scale(0.97)' : 'none',
            }}
        >
            {children}
        </Tag>
    );
}
