import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { resolveAvatarUrl, AVATAR_PNGS } from '../../utils/avatarPngs';
import { useDeptColor } from './deptColors';
import { getWhatsAppUrl } from './contato';
import { situacaoColaborador } from './statusColaborador';
import { coresSituacao } from './EmployeeCard';

/**
 * Linha compacta da visão em lista.
 *
 * A tarefa dominante desta tela é lookup — "qual o ramal do fulano?" — e para
 * isso quatro colunas de cards altos são um formato ruim: cabem ~6 pessoas na
 * dobra. A linha cabe ~18 na mesma altura, mantendo o mesmo conjunto de dados
 * e as mesmas ações. O grid continua sendo o default, porque tem valor real
 * para reconhecer o rosto de quem é novo na empresa.
 *
 * Ações aqui são sempre visíveis: numa linha não há área de hover grande o
 * bastante para o padrão de revelar fazer sentido.
 */
export default function EmployeeRow({ colab, departamentoNome, situacao: situacaoProp }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const { tinta, marca } = corDe(departamentoNome);
    const situacao = situacaoProp || situacaoColaborador(colab.funcionario_nome, colab.ativo);

    const email = colab.usuario_email || '';
    const ramal = colab.ramal && colab.ramal !== '0' ? colab.ramal : '';
    const whatsAppUrl = getWhatsAppUrl(colab.fone_celular || '');

    const avatarSrc = resolveAvatarUrl(colab.foto_perfil)
        || AVATAR_PNGS[(colab.funcionario_id || colab.usuario_id || 0) % AVATAR_PNGS.length];

    return (
        <li
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 transition-colors sm:flex-nowrap"
            // Longhand só, pelo mesmo motivo do card: `border` + `borderLeft`
            // no mesmo objeto quebra na atualização — o shorthand zera a tarja.
            style={{
                background: C.surface,
                borderStyle: 'solid',
                borderColor: C.line,
                borderWidth: '1px 1px 1px 3px',
                borderLeftColor: marca,
            }}
        >
            <img
                src={avatarSrc}
                alt=""
                loading="lazy"
                decoding="async"
                className="block h-8 w-8 shrink-0 rounded-full object-cover"
                style={{ boxShadow: `0 0 0 2px ${marca}` }}
                onError={e => { e.target.src = AVATAR_PNGS[0]; }}
            />

            <div className="min-w-0 flex-1 basis-40">
                {/* Nome limpo: o prefixo "(FÉRIAS) " que vem no dado migrou para
                    o chip de situação, e a caixa alta do IXC virou capitalização
                    normal. Numa lista de 478 linhas, o contorno da palavra é o
                    que torna a varredura possível. */}
                <p className="m-0 truncate text-[14px] font-bold leading-tight" style={{ color: C.ink }}>
                    {situacao.nome}
                </p>
            </div>

            <ChipSituacao situacao={situacao} C={C} />

            <span
                className="hidden max-w-[190px] shrink-0 truncate rounded-md px-2 py-0.5 text-[13px] font-semibold md:inline-block"
                style={{ background: tone(marca, 0.12), color: tinta }}
                title={departamentoNome}
            >
                {departamentoNome}
            </span>

            <span className="w-[92px] shrink-0 font-mono text-[13px] tabular-nums tracking-[0.05em]" style={{ color: ramal ? C.ink2 : C.muted }}>
                {ramal ? `R. ${ramal}` : '—'}
            </span>

            <span className="hidden min-w-0 flex-1 basis-48 truncate text-[13px] lg:block" style={{ color: email ? C.ink2 : C.muted }}>
                {email || '—'}
            </span>

            <div className="ml-auto flex shrink-0 items-center gap-1">
                <AcaoIcone
                    href={email ? `mailto:${email}` : undefined}
                    icone="mail"
                    rotulo={email ? `Enviar e-mail para ${situacao.nome}` : 'E-mail indisponível'}
                    ativo={!!email}
                    C={C}
                />
                <AcaoIcone
                    href={whatsAppUrl || (ramal ? `tel:${ramal}` : undefined)}
                    icone={whatsAppUrl ? 'chat' : 'call'}
                    rotulo={whatsAppUrl ? `Abrir WhatsApp de ${situacao.nome}` : ramal ? `Ligar para o ramal ${ramal}` : 'Contato indisponível'}
                    ativo={!!whatsAppUrl || !!ramal}
                    externo={!!whatsAppUrl}
                    C={C}
                />
            </div>
        </li>
    );
}

/**
 * Só aparece quando a situação NÃO é "Ativo".
 *
 * Na visão em lista a densidade é o produto: repetir "Ativo" em 400 linhas
 * gasta uma coluna inteira para dizer o valor esperado. Férias, Afastado e
 * Inativo são a exceção, e é a exceção que precisa de destaque.
 */
function ChipSituacao({ situacao, C }) {
    if (situacao.rotulo === 'Ativo') return null;
    const cor = coresSituacao(situacao.tom, C);
    return (
        <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em]"
            style={{ background: cor.fundo, color: cor.texto, border: `1px solid ${cor.borda}` }}
        >
            {situacao.rotulo}
            {situacao.divergente && (
                <span
                    className="material-symbols-outlined text-[12px]"
                    title="A situação no nome e o status do cadastro divergem"
                    aria-label="situação divergente do cadastro"
                >
                    error
                </span>
            )}
        </span>
    );
}

/** Ação só-ícone de 44×44 — o alvo de projeto, não os 24×24 do mínimo da SC 2.5.8. */
function AcaoIcone({ href, icone, rotulo, ativo, externo, C }) {
    const baseClass = "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
    const icon = <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icone}</span>;

    // Uma <a> sem href (caso "sem contato") não é focável nem anunciada como
    // desativada por leitor de tela — aria-disabled num link é decorativo. Um
    // <button disabled> de verdade sai do fluxo de foco e é anunciado.
    if (!ativo) {
        return (
            <button
                type="button"
                disabled
                aria-label={rotulo}
                title={rotulo}
                className={baseClass}
                style={{ color: C.muted, cursor: 'not-allowed', opacity: 0.5 }}
            >
                {icon}
            </button>
        );
    }

    return (
        <a
            href={href}
            aria-label={rotulo}
            title={rotulo}
            target={externo ? '_blank' : undefined}
            rel={externo ? 'noopener noreferrer' : undefined}
            className={baseClass}
            style={{ color: C.ink2, cursor: 'pointer', opacity: 1 }}
        >
            {icon}
        </a>
    );
}
