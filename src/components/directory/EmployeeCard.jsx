import React, { useState } from 'react';
import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { resolveAvatarUrl, AVATAR_PNGS } from '../../utils/avatarPngs';
import { useDeptColor } from './deptColors';
import { getWhatsAppUrl } from './contato';
import { situacaoColaborador } from './statusColaborador';

const ICONE_WHATSAPP = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" className="block">
        <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.854.507 3.593 1.39 5.093L2 22l5.09-1.336a9.96 9.96 0 0 0 4.914 1.34c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 1.796c4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208-1.637 0-3.155-.483-4.437-1.31l-.317-.208-3.003.787.801-2.92-.228-.363a8.167 8.167 0 0 1-1.228-4.194c0-4.526 3.682-8.208 8.208-8.208zm-1.895 2.873c-.237 0-.462.1-.634.27-.37.369-.748 1.077-.748 1.91 0 1.547 1.127 3.037 1.285 3.25 0 0 2.213 3.376 5.361 4.734.75.324 1.332.518 1.788.663.754.24 1.442.206 1.986.125.606-.09 1.862-.761 2.124-1.46.262-.697.262-1.296.184-1.42-.078-.125-.288-.2-.596-.356-.308-.156-1.821-.898-2.103-1.002-.281-.103-.487-.156-.693.156-.205.311-.8 1.002-.98 1.21-.18.206-.359.231-.667.076-.308-.155-1.303-.48-2.483-1.533-.918-.818-1.537-1.83-1.717-2.138-.18-.309-.02-.476.135-.63.139-.14.308-.36.462-.54.154-.18.205-.309.308-.515.103-.206.051-.386-.026-.54-.077-.155-.693-1.67-.95-2.288-.25-.6-.548-.515-.748-.525-.193-.01-.41-.01-.628-.01z" />
    </svg>
);

/**
 * Paleta do chip de situação. `ok` e `neutro` vêm dos tokens de tema; `info` e
 * `aviso` também, para que Férias e Afastado não precisem de hex fixo.
 */
export function coresSituacao(tom, C) {
    switch (tom) {
        case 'ok':    return { fundo: C.successSoft, texto: 'var(--success-strong)', borda: tone(C.success, 0.25) };
        case 'info':  return { fundo: tone(C.accent, 0.10), texto: C.accentDark,     borda: tone(C.accent, 0.28) };
        case 'aviso': return { fundo: C.warningSoft,  texto: 'var(--warning-strong)', borda: tone(C.warning, 0.3) };
        default:      return { fundo: C.surfaceSoft,  texto: C.muted,                borda: C.line };
    }
}

export default function EmployeeCard({ colab, departamentoNome, situacao: situacaoProp }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const [hover, setHover] = useState(false);

    const isDark = C.bg !== BENTO_LIGHT.bg;
    const { tinta, marca } = corDe(departamentoNome);
    // Normalmente vem pronta do Directory, calculada uma vez para os 478
    // registros em vez de uma vez por card renderizado.
    const situacao = situacaoProp || situacaoColaborador(colab.funcionario_nome, colab.ativo);
    const chip = coresSituacao(situacao.tom, C);

    const email = colab.usuario_email || '';
    const ramal = colab.ramal && colab.ramal !== '0' ? colab.ramal : '';
    const whatsAppUrl = getWhatsAppUrl(colab.fone_celular || '');
    const temWhatsApp = !!whatsAppUrl;
    const temContato = temWhatsApp || !!ramal;
    const semNenhumContato = !email && !ramal && !temWhatsApp;

    const avatarSrc = resolveAvatarUrl(colab.foto_perfil)
        || AVATAR_PNGS[(colab.funcionario_id || colab.usuario_id || 0) % AVATAR_PNGS.length];

    return (
        <li
            className="emp-card flex flex-col overflow-hidden rounded-2xl transition-all duration-200"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: C.surface,
                // Só longhand aqui, de propósito.
                //
                // A versão anterior combinava `border` (shorthand) com
                // `borderLeft` (longhand) no mesmo objeto de estilo. Funciona na
                // primeira renderização, porque o React aplica as chaves na
                // ordem do objeto — mas quebra na ATUALIZAÇÃO: quando só `hover`
                // muda, o diff contém apenas `border`, o React executa
                // `style.border = ...`, e o shorthand zera border-left-width de
                // volta para 1px. `borderLeft` não é reaplicado porque não
                // mudou. Resultado: o card perdia a tarja do departamento
                // depois do primeiro hover, e só aquele card.
                borderStyle: 'solid',
                borderColor: hover ? marca : C.line,
                borderWidth: '1px 1px 1px 4px',
                borderLeftColor: marca,
                // Sombra preta é invisível sobre amoled (#0A0A0A) e cyber
                // (#070B13): nos temas escuros o card perdia toda a elevação e
                // o feedback de hover, sobrando só a troca de cor da borda.
                boxShadow: isDark
                    ? (hover ? `0 12px 32px -8px ${tone(marca, 0.55)}` : '0 1px 3px rgba(0,0,0,0.5)')
                    : (hover ? `0 12px 32px ${tone(marca, 0.15)}, 0 2px 8px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.06)'),
                transform: hover ? 'translateY(-4px)' : 'none',
            }}
        >
            <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${marca}, ${tone(marca, 0.3)})` }} />

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3.5 flex items-start justify-between gap-2">
                    {/* O anel do avatar codifica DEPARTAMENTO, igual à tarja
                        esquerda e à faixa do topo. O ponto de presença que
                        ficava aqui codificava `ativo` — um terceiro canal para
                        o mesmo dado que o chip ao lado já diz por extenso, e
                        com a agravante de o dado estar errado em parte da base.
                        Um sinal por canal. */}
                    <div className="relative shrink-0">
                        <img
                            src={avatarSrc}
                            // alt vazio de propósito: o nome está no <h3> logo
                            // abaixo. Com alt={nome} o leitor de tela lia cada
                            // card duas vezes.
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="block h-14 w-14 rounded-full object-cover"
                            style={{ border: `3px solid ${C.surface}`, boxShadow: `0 0 0 3px ${marca}` }}
                            onError={e => { e.target.src = AVATAR_PNGS[0]; }}
                        />
                    </div>

                    <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
                        style={{ background: chip.fundo, color: chip.texto, border: `1px solid ${chip.borda}` }}
                    >
                        {situacao.rotulo}
                        {/* O prefixo do nome e a flag `ativo` do IXC discordam em
                            parte da base — ex.: "(FÉRIAS) MICHELE" com ativo='N'
                            e "(AFASTADO) JOYCE" com ativo='S'. Marcar o conflito
                            é mais honesto que escolher um dos dois em silêncio. */}
                        {situacao.divergente && (
                            <span
                                className="material-symbols-outlined text-[13px]"
                                title="A situação no nome e o status do cadastro divergem"
                                aria-label="situação divergente do cadastro"
                            >
                                error
                            </span>
                        )}
                    </span>
                </div>

                {/* Nome sem o prefixo de situação e em capitalização normal. Ele
                    chega do IXC como "(FÉRIAS) ALAINE SILVA DOS SANTOS": caixa
                    alta elimina o contorno da palavra, que é o que torna a
                    varredura de uma grade de nomes rápida. */}
                <h3 className="m-0 text-[18px] font-bold leading-tight tracking-[-0.01em]" style={{ color: C.ink }}>
                    {situacao.nome}
                </h3>

                <span
                    className="mt-2 inline-flex max-w-full self-start rounded-md px-2.5 py-1 text-[12px] font-semibold"
                    style={{ background: tone(marca, 0.12), color: tinta }}
                >
                    <span className="truncate">{departamentoNome}</span>
                </span>

                <div className="mt-3.5 flex flex-col gap-1.5 text-[13px]" style={{ color: C.ink2 }}>
                    {ramal && (
                        <a
                            href={`tel:${ramal}`}
                            className="inline-flex w-fit items-center gap-2 rounded transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            style={{ color: C.ink2 }}
                        >
                            <span className="material-symbols-outlined text-[16px]" style={{ color: C.muted }} aria-hidden="true">call</span>
                            <span className="font-mono tabular-nums tracking-[0.05em]">Ramal {ramal}</span>
                        </a>
                    )}
                    {email && (
                        // A linha de e-mail É o link. Antes o e-mail aparecia
                        // como texto puro e um botão escondido no hover fazia
                        // mailto: do mesmo endereço — informação duplicada
                        // custando ~40px de altura por card.
                        <a
                            href={`mailto:${email}`}
                            className="inline-flex min-w-0 items-center gap-2 rounded transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            style={{ color: C.ink2 }}
                        >
                            <span className="material-symbols-outlined text-[16px]" style={{ color: C.muted }} aria-hidden="true">mail</span>
                            <span className="truncate">{email}</span>
                        </a>
                    )}
                    {/* Sem isso o bloco renderizava como uma <div> vazia de altura
                        zero mais o gap — um buraco silencioso no card de quem não
                        tem nenhum contato cadastrado, que na base não é raro. */}
                    {semNenhumContato && (
                        <span className="inline-flex items-center gap-2" style={{ color: C.muted }}>
                            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">info</span>
                            Sem contato cadastrado
                        </span>
                    )}
                </div>

                {!semNenhumContato && (
                    <div className="emp-card-actions mt-auto pt-4">
                        <a
                            href={temWhatsApp ? whatsAppUrl : ramal ? `tel:${ramal}` : `mailto:${email}`}
                            target={temWhatsApp ? '_blank' : undefined}
                            rel={temWhatsApp ? 'noopener noreferrer' : undefined}
                            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-semibold no-underline transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            style={{
                                background: temWhatsApp && hover ? tone('#25D366', 0.14) : C.surfaceSoft,
                                color: C.ink2,
                                border: `1px solid ${temWhatsApp && hover ? tone('#25D366', 0.35) : C.line}`,
                            }}
                        >
                            {temWhatsApp
                                ? <>{ICONE_WHATSAPP}WhatsApp</>
                                : temContato
                                    ? <><span className="material-symbols-outlined text-[16px]" aria-hidden="true">phone</span>Ligar</>
                                    : <><span className="material-symbols-outlined text-[16px]" aria-hidden="true">mail</span>Enviar e-mail</>}
                        </a>
                    </div>
                )}
            </div>
        </li>
    );
}
