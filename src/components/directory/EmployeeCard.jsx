import React, { useState } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { resolveAvatarUrl, AVATAR_PNGS } from '../../utils/avatarPngs';
import { useDeptColor } from './deptColors';
import { getWhatsAppUrl } from './contato';
import { situacaoColaborador } from './statusColaborador';
import { neumorfismo, relevo, reentrancia } from './neumorfismo';

const ICONE_WHATSAPP = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" className="mx-auto block">
        <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.854.507 3.593 1.39 5.093L2 22l5.09-1.336a9.96 9.96 0 0 0 4.914 1.34c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 1.796c4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208-1.637 0-3.155-.483-4.437-1.31l-.317-.208-3.003.787.801-2.92-.228-.363a8.167 8.167 0 0 1-1.228-4.194c0-4.526 3.682-8.208 8.208-8.208zm-1.895 2.873c-.237 0-.462.1-.634.27-.37.369-.748 1.077-.748 1.91 0 1.547 1.127 3.037 1.285 3.25 0 0 2.213 3.376 5.361 4.734.75.324 1.332.518 1.788.663.754.24 1.442.206 1.986.125.606-.09 1.862-.761 2.124-1.46.262-.697.262-1.296.184-1.42-.078-.125-.288-.2-.596-.356-.308-.156-1.821-.898-2.103-1.002-.281-.103-.487-.156-.693.156-.205.311-.8 1.002-.98 1.21-.18.206-.359.231-.667.076-.308-.155-1.303-.48-2.483-1.533-.918-.818-1.537-1.83-1.717-2.138-.18-.309-.02-.476.135-.63.139-.14.308-.36.462-.54.154-.18.205-.309.308-.515.103-.206.051-.386-.026-.54-.077-.155-.693-1.67-.95-2.288-.25-.6-.548-.515-.748-.525-.193-.01-.41-.01-.628-.01z" />
    </svg>
);

/** Paleta do rótulo de situação, toda derivada de tokens de tema. */
export function coresSituacao(tom, C) {
    switch (tom) {
        case 'ok':    return { fundo: C.successSoft, texto: 'var(--success-strong)',  borda: tone(C.success, 0.25), ponto: C.success };
        case 'info':  return { fundo: tone(C.accent, 0.10), texto: C.accentDark,      borda: tone(C.accent, 0.28),  ponto: C.accent  };
        case 'aviso': return { fundo: C.warningSoft,  texto: 'var(--warning-strong)', borda: tone(C.warning, 0.3),  ponto: C.warning };
        // `texto` é ink2 e não muted: com a face neumórfica em C.bg (#F5F9FF no
        // claro, e não mais o branco puro), muted cai para 2,85:1 — reprova a
        // SC 1.4.3 por larga margem. ink2 dá 7,28:1 e é visualmente quase o
        // mesmo cinza.
        default:      return { fundo: C.surfaceSoft,  texto: C.ink2,                  borda: C.line,                ponto: C.muted   };
    }
}

/**
 * Card de colaborador — perfil neumórfico.
 *
 * Portado do card de perfil de referência, com o relevo preservado e os dados
 * remapeados para o que existe no IXC:
 *
 *   referência          aqui
 *   ─────────────────   ────────────────────────────────────────────────
 *   name                nome sem o prefixo de situação, capitalizado
 *   role                departamento, na cor categórica do setor
 *   followers           ramal (ou e-mail, quando não há ramal)
 *   status dot          situação: Ativo / Férias / Afastado / Inativo
 *   tag "Premium"       a mesma situação, por extenso
 *   badge "verificado"  e-mail corporativo @prestek.com.br
 *   seguir / mensagem   e-mail e WhatsApp (ou ligar para o ramal)
 *
 * O relevo mora em `neumorfismo.js`, que resolve a condição que o efeito exige
 * — face da mesma cor do fundo — nos cinco temas do projeto.
 */
export default function EmployeeCard({ colab, departamentoNome, situacao: situacaoProp, headingLevel = 2 }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const [hover, setHover] = useState(false);

    const n = neumorfismo(C);
    const { tinta, marca } = corDe(departamentoNome);
    const situacao = situacaoProp || situacaoColaborador(colab.funcionario_nome, colab.ativo);
    const chip = coresSituacao(situacao.tom, C);

    const email = colab.usuario_email || '';
    const ramal = colab.ramal && colab.ramal !== '0' ? colab.ramal : '';
    const whatsAppUrl = getWhatsAppUrl(colab.fone_celular || '');
    const semNenhumContato = !email && !ramal && !whatsAppUrl;
    // O slot do selo "verificado" ganhou um significado que existe na base: boa
    // parte dos cadastros usa e-mail pessoal (gmail, outlook) e não o
    // corporativo. Saber qual é qual importa para quem vai escrever.
    const emailCorporativo = /@prestek\.com\.br$/i.test(email);

    const avatarSrc = resolveAvatarUrl(colab.foto_perfil)
        || AVATAR_PNGS[(colab.funcionario_id || colab.usuario_id || 0) % AVATAR_PNGS.length];

    // h2 direto sob o hero (visão sem agrupamento) ou h3 dentro do h2 de
    // GrupoSecao (visão agrupada por departamento) — nunca um h3 sozinho
    // sem h2 nenhum na página, que era o bug catalogado na Fase 6.
    const TituloNome = headingLevel === 3 ? 'h3' : 'h2';

    return (
        <li
            className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: n.face,
                boxShadow: hover ? relevo(n, 20, 40) : relevo(n, 12, 24),
                // A referência usa scale-105 + translateY(-8px). Aqui o card vive
                // num grid: 1,05 de 370px são +18px, 9px por lado, contra 32px de
                // gap. Cabe, mas come quase um terço da calha e desalinha a
                // fileira. 1,02 mantém a sensação de aproximação com folga.
                transform: hover ? 'scale(1.02) translateY(-6px)' : 'none',
                // Borda revelada no hover, na cor do setor em vez do azul fixo
                // da referência. Fica sempre presente e transparente, para a
                // transição não empurrar o layout em 1px.
                border: `1px solid ${hover ? tone(marca, 0.45) : 'transparent'}`,
            }}
        >
            {/* Ponto de situação. Ao contrário do original, ele não afirma
                presença ("online agora") — codifica o mesmo vínculo que o rótulo
                abaixo diz por extenso, que é dado que existe no cadastro. */}
            <div className="absolute right-4 top-4 z-10">
                <div className="relative">
                    <span
                        className="block h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-125"
                        style={{ background: chip.ponto, border: `2px solid ${n.face}` }}
                        aria-hidden="true"
                    />
                    {/* `animate-ping` do Tailwind anima transform e opacity, que
                        o compositor resolve — diferente do `pulse-ring` antigo,
                        que animava box-shadow e forçava repaint por frame em
                        todos os cards. E o bloco global de
                        prefers-reduced-motion já neutraliza. */}
                    {situacao.tom === 'ok' && (
                        <span
                            className="absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-30"
                            style={{ background: chip.ponto }}
                            aria-hidden="true"
                        />
                    )}
                </div>
            </div>

            {emailCorporativo && (
                <div className="absolute right-4 top-10 z-10">
                    <span
                        className="flex h-[22px] w-[22px] items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                        style={{ background: marca, color: '#FFFFFF', boxShadow: `0 2px 6px ${tone(marca, 0.45)}` }}
                        title={`E-mail corporativo: ${email}`}
                        aria-label="e-mail corporativo"
                    >
                        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">verified</span>
                    </span>
                </div>
            )}

            {/* Berço do avatar: reentrância, para o rosto parecer assentado na
                superfície em vez de colado sobre ela. */}
            <div className="relative z-10 mb-4 flex justify-center">
                <div
                    className="h-28 w-28 overflow-hidden rounded-full p-1 transition-all duration-500 group-hover:scale-105"
                    style={{
                        background: n.face,
                        boxShadow: hover ? reentrancia(n, 8, 16) : reentrancia(n, 6, 12),
                    }}
                >
                    <img
                        src={avatarSrc}
                        // alt vazio: o nome está no heading logo abaixo. Com alt={nome}
                        // o leitor de tela lia cada card duas vezes.
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full rounded-full object-cover"
                        onError={e => { e.target.src = AVATAR_PNGS[0]; }}
                    />
                </div>
            </div>

            <div className="relative z-10 text-center transition-transform duration-300 group-hover:-translate-y-1">
                {/* Nome sem o prefixo "(FÉRIAS) " e fora do caixa alta do IXC. */}
                <TituloNome className="m-0 text-lg font-bold leading-tight" style={{ color: C.ink }}>
                    {situacao.nome}
                </TituloNome>

                {/* O lugar do "role". Colorido com a tinta do setor: é o único
                    canal categórico que sobrou depois que a tarja lateral saiu. */}
                <p className="m-0 mt-1 truncate text-sm font-semibold" style={{ color: tinta }}>
                    {departamentoNome}
                </p>

                {/* Este é o lugar do "1.240 followers" do original, que lá é
                    text-gray-400 sobre fundo cinza. Aqui é ink2, não muted:
                    sobre a face neumórfica (#F5F9FF) muted dá 2,85:1, e esta
                    linha carrega o ramal — o dado que a tela existe para
                    entregar. Não pode ser o texto menos legível do card. */}
                {/* As 3 opções aqui têm que casar exatamente com o que decide
                    mostrar o botão de contato logo abaixo (`semNenhumContato`)
                    — antes só checava ramal/email, então quem tinha SÓ
                    fone_celular via "Sem contato cadastrado" ao lado de um
                    botão de WhatsApp funcional. */}
                <p className="m-0 mt-2 truncate text-xs" style={{ color: C.ink2 }} title={email || undefined}>
                    {ramal
                        ? <span className="font-mono tabular-nums tracking-[0.05em]">Ramal {ramal}</span>
                        : email
                            ? email
                            : whatsAppUrl
                                ? <span className="font-mono tabular-nums tracking-[0.05em]">{colab.fone_celular}</span>
                                : 'Sem contato cadastrado'}
                </p>
            </div>

            <div className="relative z-10 mt-4 flex justify-center">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-transform duration-300 group-hover:scale-105"
                    style={{ background: chip.fundo, color: chip.texto, boxShadow: relevo(n, 2, 4) }}
                >
                    {situacao.rotulo}
                    {/* O prefixo do nome e a flag `ativo` do IXC discordam em
                        parte da base — "(FÉRIAS) MICHELE" com ativo='N',
                        "(AFASTADO) JOYCE" com ativo='S'. */}
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

            {!semNenhumContato && (
                <div className="relative z-10 mt-6 flex gap-2">
                    {email && (
                        // `tinta` e não `marca` como cor do ícone: sobre a face
                        // clara, marca dá 3,37:1 e tinta dá 6,92:1. O tom é o
                        // mesmo, só mais fundo.
                        <BotaoRelevo
                            href={`mailto:${email}`}
                            aria={`Enviar e-mail para ${situacao.nome}`}
                            title={email}
                            icone="mail"
                            cor={tinta}
                            corHover={tinta}
                            fundoHover={tone(marca, 0.12)}
                            n={n}
                            C={C}
                        />
                    )}
                    {whatsAppUrl ? (
                        // O verde de marca do WhatsApp (#25D366) dá 1,88:1 sobre
                        // a face clara — reprova até o piso de 3:1 da SC 1.4.11
                        // para elemento não-textual. --success-strong é verde,
                        // existe nos cinco temas e passa com folga. O formato do
                        // ícone já carrega o reconhecimento da marca.
                        <BotaoRelevo
                            href={whatsAppUrl}
                            externo
                            aria={`Abrir conversa no WhatsApp com ${situacao.nome}`}
                            title="WhatsApp"
                            svg={ICONE_WHATSAPP}
                            corHover="var(--success-strong)"
                            fundoHover={tone(C.success, 0.14)}
                            n={n}
                            C={C}
                        />
                    ) : ramal ? (
                        <BotaoRelevo
                            href={`tel:${ramal}`}
                            aria={`Ligar para o ramal ${ramal} de ${situacao.nome}`}
                            title={`Ramal ${ramal}`}
                            icone="call"
                            corHover={C.ink}
                            fundoHover={tone(C.accent, 0.10)}
                            n={n}
                            C={C}
                        />
                    ) : null}
                </div>
            )}
        </li>
    );
}

/**
 * Botão em relevo, com três estados.
 *
 * ─── A progressão é o efeito ─────────────────────────────────────────────────
 * Numa superfície neumórfica, "afundar" é a única affordance disponível — não
 * há borda nem preenchimento para acender. Então o botão percorre a rampa:
 *
 *   repouso      relevo 6px/12px    saliente, em repouso
 *   hover        relevo 3px/6px     meio caminho: a sombra encolhe e o botão
 *                                   parece descer em direção à superfície
 *   pressionado  reentrância 4px/8px  atravessa e afunda para dentro
 *
 * Essa é a leitura correta do material: o dedo empurra o botão para dentro do
 * plano. Aumentar a sombra no hover daria o efeito contrário — o botão saltaria
 * para longe do cursor.
 *
 * Só-ícone, como no original, mas `aria-label` e `title` são obrigatórios: sem
 * eles o leitor de tela anuncia "link" duas vezes seguidas e quem enxerga
 * precisa adivinhar qual dos dois abre o WhatsApp. Nenhum dos dois muda um
 * pixel do desenho.
 */
function BotaoRelevo({ href, aria, title, icone, svg, externo, cor, corHover, fundoHover, n, C }) {
    const [hover, setHover] = useState(false);
    const [pressionado, setPressionado] = useState(false);
    const aceso = hover || pressionado;

    return (
        <a
            href={href}
            aria-label={aria}
            title={title}
            target={externo ? '_blank' : undefined}
            rel={externo ? 'noopener noreferrer' : undefined}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => { setHover(false); setPressionado(false); }}
            onMouseDown={() => setPressionado(true)}
            onMouseUp={() => setPressionado(false)}
            // O foco de teclado reusa o realce do hover: sem isso, quem tabula
            // até aqui vê apenas o anel, e não o mesmo feedback de estado que
            // quem usa mouse recebe.
            onFocus={() => setHover(true)}
            onBlur={() => { setHover(false); setPressionado(false); }}
            // py-4 dá ~52px de altura, acima do alvo de projeto de 44px.
            className="group/btn flex-1 rounded-full py-4 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{
                background: aceso && fundoHover ? fundoHover : n.face,
                color: aceso && corHover ? corHover : (cor || C.ink2),
                boxShadow: pressionado
                    ? reentrancia(n, 4, 8)
                    : hover
                        ? relevo(n, 3, 6)
                        : relevo(n, 6, 12),
                transform: pressionado ? 'scale(0.95)' : hover ? 'scale(0.98)' : 'none',
            }}
        >
            <span className="block transition-transform duration-200 group-hover/btn:scale-110">
                {svg || <span className="material-symbols-outlined mx-auto block text-[18px]" aria-hidden="true">{icone}</span>}
            </span>
        </a>
    );
}
