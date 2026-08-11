import React, { useState } from 'react';
import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { resolveAvatarUrl, AVATAR_PNGS } from '../../utils/avatarPngs';
import { useDeptColor } from './deptColors';
import { getWhatsAppUrl } from './contato';
import { situacaoColaborador } from './statusColaborador';

const ICONE_WHATSAPP = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true" className="block">
        <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.854.507 3.593 1.39 5.093L2 22l5.09-1.336a9.96 9.96 0 0 0 4.914 1.34c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 1.796c4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208-1.637 0-3.155-.483-4.437-1.31l-.317-.208-3.003.787.801-2.92-.228-.363a8.167 8.167 0 0 1-1.228-4.194c0-4.526 3.682-8.208 8.208-8.208zm-1.895 2.873c-.237 0-.462.1-.634.27-.37.369-.748 1.077-.748 1.91 0 1.547 1.127 3.037 1.285 3.25 0 0 2.213 3.376 5.361 4.734.75.324 1.332.518 1.788.663.754.24 1.442.206 1.986.125.606-.09 1.862-.761 2.124-1.46.262-.697.262-1.296.184-1.42-.078-.125-.288-.2-.596-.356-.308-.156-1.821-.898-2.103-1.002-.281-.103-.487-.156-.693.156-.205.311-.8 1.002-.98 1.21-.18.206-.359.231-.667.076-.308-.155-1.303-.48-2.483-1.533-.918-.818-1.537-1.83-1.717-2.138-.18-.309-.02-.476.135-.63.139-.14.308-.36.462-.54.154-.18.205-.309.308-.515.103-.206.051-.386-.026-.54-.077-.155-.693-1.67-.95-2.288-.25-.6-.548-.515-.748-.525-.193-.01-.41-.01-.628-.01z" />
    </svg>
);

/**
 * Paleta do chip de situação. Todos os tons saem de tokens de tema, para que
 * Férias e Afastado não precisem de hex fixo em nenhum dos cinco temas.
 */
export function coresSituacao(tom, C) {
    switch (tom) {
        case 'ok':    return { fundo: C.successSoft, texto: 'var(--success-strong)',  borda: tone(C.success, 0.25) };
        case 'info':  return { fundo: tone(C.accent, 0.10), texto: C.accentDark,      borda: tone(C.accent, 0.28) };
        case 'aviso': return { fundo: C.warningSoft,  texto: 'var(--warning-strong)', borda: tone(C.warning, 0.3) };
        default:      return { fundo: C.surfaceSoft,  texto: C.muted,                 borda: C.line };
    }
}

/**
 * Card de colaborador — composição em retrato centralizado.
 *
 * ─── O que veio da referência de card de perfil ──────────────────────────────
 * Avatar grande e centralizado, identidade centralizada abaixo dele, par de
 * botões de ação no rodapé e silhueta de raio maior. Num diretório de pessoas
 * essa composição funciona melhor que a alinhada à esquerda: o rosto vira a
 * âncora de varredura, que é o que o grid tem de melhor sobre a visão em lista.
 *
 * ─── O que NÃO veio, e por quê ───────────────────────────────────────────────
 * • Neumorfia. O efeito precisa de superfície cinza-média para as duas sombras
 *   aparecerem. Aqui `C.surface` é #FFFFFF no tema claro (a sombra branca some)
 *   e #0A0A0A no amoled (a preta some) — não renderiza em 2 dos 5 temas.
 * • Azul. A marca é laranja (--accent) e a cor categórica é a do departamento.
 * • `animate-ping` no status. Empresta a semântica de presença do Slack para um
 *   dado que, nesta base, discorda de si mesmo — ver statusColaborador.js.
 * • `hover:scale-105`. Card em grid que cresce passa por cima dos vizinhos.
 *   A elevação vem de translateY, que não altera a caixa de layout.
 * • Botões só-ícone. Cada ação leva rótulo textual e 44px de alvo.
 * • Ícones lucide. A casa usa Material Symbols; misturar seria o quinto sistema
 *   de ícone da tela.
 */
export default function EmployeeCard({ colab, departamentoNome, situacao: situacaoProp }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const [hover, setHover] = useState(false);

    const isDark = C.bg !== BENTO_LIGHT.bg;
    const { tinta, marca } = corDe(departamentoNome);
    // Normalmente vem pronta do Directory, calculada uma vez para toda a base
    // em vez de uma vez por card renderizado.
    const situacao = situacaoProp || situacaoColaborador(colab.funcionario_nome, colab.ativo);
    const chip = coresSituacao(situacao.tom, C);

    const email = colab.usuario_email || '';
    const ramal = colab.ramal && colab.ramal !== '0' ? colab.ramal : '';
    const whatsAppUrl = getWhatsAppUrl(colab.fone_celular || '');
    const semNenhumContato = !email && !ramal && !whatsAppUrl;

    const avatarSrc = resolveAvatarUrl(colab.foto_perfil)
        || AVATAR_PNGS[(colab.funcionario_id || colab.usuario_id || 0) % AVATAR_PNGS.length];

    return (
        <li
            className="relative flex flex-col overflow-hidden rounded-[20px] transition-all duration-200"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: C.surface,
                // Só longhand aqui, de propósito.
                //
                // Combinar `border` (shorthand) com `borderLeft` (longhand) no
                // mesmo objeto funciona na primeira renderização, porque o React
                // aplica as chaves na ordem do objeto — mas quebra na
                // ATUALIZAÇÃO: quando só `hover` muda, o diff contém apenas
                // `border`, o React executa `style.border = ...`, e o shorthand
                // zera border-left-width de volta para 1px. O card perdia a
                // tarja do departamento depois do primeiro hover.
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: hover ? marca : C.line,
                // Sombra preta é invisível sobre amoled (#0A0A0A) e cyber
                // (#070B13): nos temas escuros o card perdia toda a elevação e o
                // feedback de hover, sobrando só a troca de cor da borda.
                boxShadow: isDark
                    ? (hover ? `0 14px 34px -10px ${tone(marca, 0.55)}` : '0 1px 3px rgba(0,0,0,0.5)')
                    : (hover ? `0 14px 34px ${tone(marca, 0.16)}, 0 2px 8px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.06)'),
                transform: hover ? 'translateY(-4px)' : 'none',
            }}
        >
            {/* A faixa do topo assume sozinha o papel de trilha categórica. A
                tarja esquerda saiu junto com o alinhamento à esquerda: numa
                composição centralizada ela puxa o olho para fora do eixo. */}
            <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${marca}, ${tone(marca, 0.35)})` }} />

            <span
                className="absolute right-3 top-[18px] z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]"
                style={{ background: chip.fundo, color: chip.texto, border: `1px solid ${chip.borda}` }}
            >
                {situacao.rotulo}
                {/* O prefixo do nome e a flag `ativo` do IXC discordam em parte
                    da base — "(FÉRIAS) MICHELE" com ativo='N', "(AFASTADO)
                    JOYCE" com ativo='S'. Marcar o conflito é mais honesto que
                    escolher um dos dois em silêncio. */}
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

            <div className="flex flex-1 flex-col items-center px-5 pb-5 pt-7 text-center">
                {/* O anel do avatar é o segundo canal do departamento. Não há
                    ponto de presença: ele codificava `ativo`, um terceiro canal
                    para o que o chip acima já diz por extenso. */}
                <img
                    src={avatarSrc}
                    // alt vazio de propósito: o nome está no <h3> logo abaixo.
                    // Com alt={nome} o leitor de tela lia cada card duas vezes.
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="block h-[88px] w-[88px] rounded-full object-cover transition-transform duration-300"
                    style={{
                        border: `3px solid ${C.surface}`,
                        boxShadow: `0 0 0 3px ${marca}${hover ? `, 0 0 0 9px ${tone(marca, 0.16)}` : ''}`,
                    }}
                    onError={e => { e.target.src = AVATAR_PNGS[0]; }}
                />

                <h3 className="m-0 mt-4 text-[18px] font-bold leading-tight tracking-[-0.01em]" style={{ color: C.ink }}>
                    {situacao.nome}
                </h3>

                <span
                    className="mt-2 inline-flex max-w-full rounded-md px-2.5 py-1 text-[12px] font-semibold"
                    style={{ background: tone(marca, 0.12), color: tinta }}
                >
                    <span className="truncate">{departamentoNome}</span>
                </span>

                {/* Informação, não ação.
                    Antes essas linhas eram links, e o botão de e-mail escondido
                    no hover duplicava o mailto: da linha visível. Agora que o
                    rodapé está sempre visível, a divisão fica limpa: o texto
                    informa, os botões agem — que é o que a referência faz. */}
                <div className="mt-3 flex w-full flex-col items-center gap-1 text-[13px]" style={{ color: C.ink2 }}>
                    {ramal && (
                        <span className="font-mono tabular-nums tracking-[0.05em]">Ramal {ramal}</span>
                    )}
                    {email && (
                        <span className="max-w-full truncate" title={email}>{email}</span>
                    )}
                    {semNenhumContato && (
                        <span style={{ color: C.muted }}>Sem contato cadastrado</span>
                    )}
                </div>

                {!semNenhumContato && (
                    <div className="mt-auto flex w-full gap-2 pt-5">
                        {email && (
                            <BotaoAcao
                                href={`mailto:${email}`}
                                icone="mail"
                                rotulo="E-mail"
                                aria={`Enviar e-mail para ${situacao.nome}`}
                                C={C}
                            />
                        )}
                        {whatsAppUrl ? (
                            <BotaoAcao
                                href={whatsAppUrl}
                                externo
                                svg={ICONE_WHATSAPP}
                                rotulo="WhatsApp"
                                aria={`Abrir conversa no WhatsApp com ${situacao.nome}`}
                                destaque={hover ? '#25D366' : null}
                                C={C}
                            />
                        ) : ramal ? (
                            <BotaoAcao
                                href={`tel:${ramal}`}
                                icone="call"
                                rotulo="Ligar"
                                aria={`Ligar para o ramal ${ramal} de ${situacao.nome}`}
                                C={C}
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </li>
    );
}

/**
 * Botão de ação do rodapé.
 *
 * A referência usa botões só com ícone. Aqui cada um leva rótulo textual: numa
 * intranet, "um envelope e um balão" obriga o usuário a adivinhar qual dos dois
 * abre o WhatsApp e qual abre o e-mail — e ícone sem rótulo é a forma mais
 * comum de botão inacessível. `min-h-[44px]` é o alvo de projeto.
 */
function BotaoAcao({ href, icone, svg, rotulo, aria, externo, destaque, C }) {
    return (
        <a
            href={href}
            aria-label={aria}
            target={externo ? '_blank' : undefined}
            rel={externo ? 'noopener noreferrer' : undefined}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold no-underline transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{
                background: destaque ? tone(destaque, 0.14) : C.surfaceSoft,
                color: destaque ? C.ink : C.ink2,
                border: `1px solid ${destaque ? tone(destaque, 0.35) : C.line}`,
            }}
        >
            {svg || <span className="material-symbols-outlined text-[17px]" aria-hidden="true">{icone}</span>}
            {rotulo}
        </a>
    );
}
