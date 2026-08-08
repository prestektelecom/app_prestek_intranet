import React, { useEffect, useMemo } from 'react';
import useTaxonomiasIxc from './useTaxonomiasIxc';
import {
    CARD, FAIXA, ROTULO, CAMPO, SKELETON_CAMPO,
    AVISO_AMBAR, AVISO_ERRO, BTN_SECUNDARIO,
} from './cadastro/estilos';

// Rótulos das listas derivadas, para a mensagem de aviso.
const NOME_LISTA = {
    funcoes: 'Funções',
    grupos: 'Grupos de usuário',
    contas: 'Contas contábeis',
    filiais: 'Filiais',
    departamentos: 'Departamentos',
};

function Secao({ icone, titulo, subtitulo, children }) {
    return (
        <section className={CARD}>
            <div className={FAIXA} />
            <header className="flex items-center gap-2.5 border-b border-border px-6 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icone}</span>
                </span>
                <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-foreground">{titulo}</h3>
                    {subtitulo ? <p className="text-xs text-muted">{subtitulo}</p> : null}
                </div>
            </header>
            <div className="px-6 py-5">{children}</div>
        </section>
    );
}

/**
 * Select de taxonomia. Listas derivadas trazem `emUso`/`exemplo`, que é o que
 * dá sentido a um id sem nome — "Função 14" não diz nada, "Função 14 · 118
 * colaboradores · ex.: NAYARA" diz.
 */
function SelectTaxonomia({ id, rotulo, opcoes, derivada, carregando, obrigatorio }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={ROTULO}>
                {rotulo}
                {obrigatorio ? <span className="ml-1 text-red-500" aria-hidden="true">*</span> : null}
            </label>
            {carregando ? (
                <div className={SKELETON_CAMPO} />
            ) : (
                <select id={id} className={CAMPO} defaultValue="">
                    <option value="">Selecione…</option>
                    {opcoes.map(o => (
                        <option key={o.id} value={o.id}>
                            {o.rotulo}
                            {derivada && o.emUso ? ` · ${o.emUso} em uso` : ''}
                            {derivada && o.exemplo ? ` · ex.: ${o.exemplo}` : ''}
                            {o.ativo === false ? ' · inativo' : ''}
                        </option>
                    ))}
                </select>
            )}
            {!carregando && !opcoes.length ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Nenhuma opção disponível — preencha o id manualmente na simulação.
                </p>
            ) : null}
        </div>
    );
}

/**
 * Cadastro de Colaborador no IXC.
 *
 * Estado desta fase: carrega e exibe as listas de referência. O formulário
 * completo, a extração de PDF e o dry-run entram nas fases seguintes.
 */
export default function CadastroColaborador({ user, onLog, onHero }) {
    const { taxonomias, derivados, carregando, erro, recarregar } = useTaxonomiasIxc(user);

    const derivadasComDados = useMemo(
        () => derivados.filter(d => (taxonomias[d] || []).length),
        [derivados, taxonomias]
    );

    // Alimenta o painel do hero. O efeito depende de `onHero` ser estável
    // (useState setter no Ti.jsx) — não recriar por render.
    useEffect(() => {
        onHero?.({
            isLoading: carregando,
            etapa: 'Etapa 1 de 3 · Ficha',
            kpis: [
                { label: 'Filiais', valor: taxonomias.filiais.length, sub: 'cadastro IXC' },
                { label: 'Departamentos', valor: taxonomias.departamentos.length, sub: 'empresa_setor' },
                { label: 'Contas de folha', valor: taxonomias.contas.filter(c => c.folha).length, sub: `de ${taxonomias.contas.length} em uso` },
                { label: 'Gravação', valor: 'dry-run', sub: 'nada é enviado' },
            ],
        });
    }, [carregando, taxonomias, onHero]);

    useEffect(() => {
        if (erro) onLog?.(`Falha ao carregar listas do IXC: ${erro}`, 'erro');
        else if (!carregando) onLog?.('Listas de referência carregadas do IXC.', 'sucesso');
    }, [erro, carregando, onLog]);

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <div className="flex min-w-0 flex-col gap-6">

                {erro ? (
                    <div className={AVISO_ERRO} role="alert">
                        <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden="true">error</span>
                        <span className="min-w-0">
                            {erro}
                            <button type="button" onClick={recarregar} className="ml-2 underline">Tentar novamente</button>
                        </span>
                    </div>
                ) : null}

                {/* Aviso obrigatório: três listas não vêm de um cadastro próprio
                    do IXC. Ver services/ixcTaxonomias.js. */}
                {derivadasComDados.length ? (
                    <div className={AVISO_AMBAR}>
                        <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden="true">info</span>
                        <span className="min-w-0">
                            <b>{derivadasComDados.map(d => NOME_LISTA[d] || d).join(', ')}</b>{' '}
                            {derivadasComDados.length > 1 ? 'não têm' : 'não tem'} cadastro acessível pela API do IXC.
                            As opções abaixo foram inferidas do que colaboradores e usuários existentes já usam —
                            um valor válido pode não aparecer aqui se ninguém o estiver usando hoje.
                        </span>
                    </div>
                ) : null}

                <Secao
                    icone="badge"
                    titulo="Vínculo"
                    subtitulo="Listas de referência do IXC, carregadas uma vez e reaproveitadas."
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <SelectTaxonomia id="campo-filial_id" rotulo="Filial" obrigatorio
                            opcoes={taxonomias.filiais} carregando={carregando} />
                        <SelectTaxonomia id="campo-id_departamento" rotulo="Departamento"
                            opcoes={taxonomias.departamentos} carregando={carregando} />
                        <SelectTaxonomia id="campo-id_funcao" rotulo="Função"
                            opcoes={taxonomias.funcoes} carregando={carregando} derivada />
                        <SelectTaxonomia id="campo-id_conta" rotulo="Conta contábil" obrigatorio
                            opcoes={taxonomias.contas} carregando={carregando} derivada />
                        <SelectTaxonomia id="campo-id_grupo" rotulo="Grupo de usuário"
                            opcoes={taxonomias.grupos} carregando={carregando} derivada />
                    </div>
                </Secao>

                <div className={`${CARD} flex flex-col items-center justify-center gap-2 py-16 text-center`}>
                    <span className="material-symbols-outlined text-4xl text-muted" aria-hidden="true">upload_file</span>
                    <p className="text-sm font-medium text-muted">
                        O upload da ficha, o formulário completo e a simulação entram nas próximas etapas.
                    </p>
                </div>
            </div>

            <aside className="flex flex-col gap-6 xl:sticky xl:top-4">
                <div className={CARD}>
                    <header className="border-b border-border px-5 py-3.5">
                        <h3 className="text-[13px] font-bold text-foreground">Resumo</h3>
                    </header>
                    <div className="flex flex-col gap-3 px-5 py-4">
                        <button type="button" className={`${BTN_SECUNDARIO} w-full`} onClick={recarregar}>
                            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">refresh</span>
                            Recarregar listas do IXC
                        </button>
                        <p className="text-xs text-muted">
                            As listas ficam em cache por 6 horas no servidor. A primeira carga após esse
                            prazo leva cerca de 20 segundos.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
