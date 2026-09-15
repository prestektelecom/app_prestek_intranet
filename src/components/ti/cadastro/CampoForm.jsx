import React from 'react';
import { CAMPO, ROTULO, HINT, HINT_ERRO, RING_ERRO, RING_DUVIDA, SKELETON_CAMPO } from './estilos';
import CidadeCombobox from './CidadeCombobox';

// `aria-pressed` (grupo de botões de alternância) em vez de role="radio" — uma
// navegação por seta entre as opções nunca foi implementada, e uma semântica
// de radio group incompleta enganaria mais que nenhuma (mesmo raciocínio da
// Fase 13 ao reconsiderar role="menu" no popover de avatar).
function Segmentado({ opcoes, valor, onChange, rotuloId, obrigatorio, descritoPor }) {
    return (
        <div
            role="group"
            aria-labelledby={rotuloId}
            aria-required={obrigatorio || undefined}
            aria-describedby={descritoPor}
            className="inline-flex w-full items-center gap-1 rounded-xl bg-surface-raised p-1"
        >
            {opcoes.map(op => {
                const ativo = valor === op.valor;
                return (
                    <button
                        key={op.valor}
                        type="button"
                        onClick={() => onChange(op.valor)}
                        aria-pressed={ativo}
                        className={`inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[12px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                            ativo
                                ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)] ring-1 ring-inset ring-[var(--accent)]/50'
                                : 'text-faint hover:bg-background'
                        }`}
                    >
                        {op.rotulo}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Renderiza um campo do formulário a partir da descrição declarativa.
 * Suporta text, date, select, segmentado, password e combobox (cidade).
 */
export default function CampoForm({
    campo, valor, erro, touched, onChange, onBlur,
    taxonomias, carregandoTaxonomias, user, onCidadeSelecionada,
    confianca, editado, dica,
}) {
    const id = `campo-${campo.nome}`;
    const rotuloId = `${id}-rotulo`;
    const erroId = `${id}-erro`;
    const erroVisivel = !!erro && touched;
    const spanClass = campo.span === 2 ? 'sm:col-span-2' : campo.span === 3 ? 'sm:col-span-2 lg:col-span-3' : '';
    const classeCampo = `${CAMPO} ${erroVisivel ? RING_ERRO : ''} ${confianca !== undefined && confianca < 0.75 && !editado ? RING_DUVIDA : ''}`;
    const describedBy = erroVisivel ? erroId : undefined;

    const handleChange = (e) => onChange(campo.nome, e.target.value);
    const handleBlur = () => onBlur(campo.nome);

    let conteudo;

    if (campo.tipo === 'combobox') {
        conteudo = (
            <CidadeCombobox
                id={id}
                rotuloId={rotuloId}
                valor={valor}
                onChange={v => onChange(campo.nome, v)}
                onBlur={handleBlur}
                onCidadeSelecionada={onCidadeSelecionada}
                user={user}
                erro={erroVisivel}
                obrigatorio={campo.obrigatorio}
                descritoPor={describedBy}
            />
        );
    } else if (campo.tipo === 'segmentado') {
        conteudo = (
            <Segmentado
                opcoes={campo.opcoes}
                valor={valor}
                onChange={v => onChange(campo.nome, v)}
                rotuloId={rotuloId}
                obrigatorio={campo.obrigatorio}
                descritoPor={describedBy}
            />
        );
    } else if (campo.tipo === 'select') {
        const lista = campo.fonteTaxonomia ? taxonomias[campo.fonteTaxonomia] || [] : campo.opcoes || [];
        const isTaxonomia = !!campo.fonteTaxonomia;
        const carregando = isTaxonomia && carregandoTaxonomias;
        conteudo = carregando ? (
            <div className={SKELETON_CAMPO} />
        ) : (
            <select
                id={id}
                className={classeCampo}
                value={valor}
                onChange={handleChange}
                onBlur={handleBlur}
                required={campo.obrigatorio || undefined}
                aria-required={campo.obrigatorio || undefined}
                aria-invalid={erroVisivel || undefined}
                aria-describedby={describedBy}
            >
                <option value="">Selecione…</option>
                {lista.map(item => {
                    const chave = isTaxonomia ? item.id : item.valor;
                    const rotulo = isTaxonomia ? item.rotulo : item.rotulo;
                    return (
                        <option key={chave} value={chave}>
                            {rotulo}
                            {isTaxonomia && item.emUso ? ` · ${item.emUso} em uso` : ''}
                            {isTaxonomia && item.exemplo ? ` · ex.: ${item.exemplo}` : ''}
                            {isTaxonomia && item.ativo === false ? ' · inativo' : ''}
                        </option>
                    );
                })}
            </select>
        );
    } else {
        conteudo = (
            <input
                id={id}
                type={campo.tipo === 'password' ? 'password' : campo.tipo === 'date' ? 'date' : 'text'}
                className={classeCampo}
                value={valor}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={campo.placeholder}
                maxLength={campo.maxLength}
                autoComplete="off"
                required={campo.obrigatorio || undefined}
                aria-required={campo.obrigatorio || undefined}
                aria-invalid={erroVisivel || undefined}
                aria-describedby={describedBy}
            />
        );
    }

    return (
        <div className={`flex flex-col gap-1.5 ${spanClass}`}>
            <label id={rotuloId} htmlFor={id} className={ROTULO}>
                {campo.rotulo}
                {campo.obrigatorio ? <span className="ml-1 text-red-500" aria-hidden="true">*</span> : null}
                {editado ? (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-surface-raised px-1 py-px font-mono text-[9px] font-bold text-faint">editado</span>
                ) : confianca !== undefined && confianca < 0.75 ? (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-px font-mono text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <span className="material-symbols-outlined text-[10px]">help</span>
                        confira
                    </span>
                ) : null}
            </label>
            {conteudo}
            {erroVisivel ? <p id={erroId} className={HINT_ERRO}>{erro}</p> : null}
            {dica ? (
                <p className="flex items-center gap-1 text-[11px] text-faint">
                    <span className="material-symbols-outlined text-[13px] text-[var(--accent)]">lightbulb</span>
                    <span>{dica}</span>
                </p>
            ) : null}
            {confianca !== undefined && confianca < 0.35 && !editado ? (
                <p className={`${HINT} text-amber-700 dark:text-amber-400`}>
                    <span className="material-symbols-outlined mr-1 text-[12px] align-middle">priority_high</span>
                    Valor extraído com baixa confiança — verifique antes de gravar.
                </p>
            ) : null}
        </div>
    );
}
