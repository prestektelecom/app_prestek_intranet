import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useTaxonomiasIxc from './useTaxonomiasIxc';
import { AVISO_AMBAR, AVISO_ERRO } from './cadastro/estilos';
import { CAMPOS, SECOES, OBRIGATORIOS, VALOR_INICIAL } from './cadastro/campos';
import { aplicarMascara } from './cadastro/normalizadores';
import { validarCampo } from './cadastro/validadores';
import { enviar } from './cadastro/api';
import SecaoForm from './cadastro/SecaoForm';
import CampoForm from './cadastro/CampoForm';
import PainelLateral from './cadastro/PainelLateral';
import UploadFicha from './cadastro/UploadFicha';

// Rótulos das listas derivadas, para a mensagem de aviso.
const NOME_LISTA = {
    funcoes: 'Funções',
    grupos: 'Grupos de usuário',
    contas: 'Contas contábeis',
    filiais: 'Filiais',
    departamentos: 'Departamentos',
};

function campoPorNome(nome) {
    return CAMPOS.find(c => c.nome === nome);
}

/**
 * Cadastro de Colaborador no IXC.
 *
 * Fase 4: formulário com extração de PDF. O upload preenche os campos com
 * confiança por campo; a gravação continua em dry-run (fase 6).
 */
export default function CadastroColaborador({ user, onLog, onHero, log }) {
    const { taxonomias, derivados, carregando, erro, recarregar } = useTaxonomiasIxc(user);

    const [form, setForm] = useState(VALOR_INICIAL);
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [touched, setTouched] = useState({});
    const [confianca, setConfianca] = useState({});
    const [editado, setEditado] = useState({});
    const [textoBruto, setTextoBruto] = useState('');
    const [naoReconhecido, setNaoReconhecido] = useState([]);
    const [simulando, setSimulando] = useState(false);
    const [resultadoDryRun, setResultadoDryRun] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [dicaFuncao, setDicaFuncao] = useState('');

    const derivadasComDados = useMemo(
        () => derivados.filter(d => (taxonomias[d] || []).length),
        [derivados, taxonomias]
    );

    const erros = useMemo(() => {
        const resultado = {};
        for (const campo of CAMPOS) {
            // Campos condicionais só validam quando visíveis.
            if (campo.condicional === 'criar_usuario == S' && form.criar_usuario !== 'S') continue;
            resultado[campo.nome] = validarCampo(campo, form[campo.nome]);
        }
        return resultado;
    }, [form]);

    const obrigatoriosPreenchidos = useMemo(
        () => OBRIGATORIOS.filter(nome => String(form[nome] ?? '').trim().length > 0).length,
        [form]
    );

    const mostrarToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
    }, []);

    // Alimenta o painel do hero.
    useEffect(() => {
        onHero?.({
            isLoading: carregando,
            etapa: 'Etapa 1 de 3 · Ficha',
            kpis: [
                { label: 'Obrigatórios', valor: `${obrigatoriosPreenchidos}/${OBRIGATORIOS.length}`, sub: 'preenchidos' },
                { label: 'Filiais', valor: taxonomias.filiais.length, sub: 'cadastro IXC' },
                { label: 'Contas de folha', valor: taxonomias.contas.filter(c => c.folha).length, sub: `de ${taxonomias.contas.length} em uso` },
                { label: 'Gravação', valor: 'simulação', sub: 'nada é enviado' },
            ],
        });
    }, [carregando, taxonomias, obrigatoriosPreenchidos, onHero]);

    useEffect(() => {
        if (erro) onLog?.(`Falha ao carregar listas do IXC: ${erro}`, 'erro');
        else if (!carregando) onLog?.('Listas de referência carregadas do IXC.', 'sucesso');
    }, [erro, carregando, onLog]);

    const handleChange = useCallback((nome, valor) => {
        const campo = campoPorNome(nome);
        setForm(f => ({
            ...f,
            [nome]: campo?.mascara ? aplicarMascara(campo, valor) : valor,
        }));
        setEditado(e => ({ ...e, [nome]: true }));
        setConfianca(c => {
            const novo = { ...c };
            delete novo[nome];
            return novo;
        });
    }, []);

    const handleBlur = useCallback((nome) => {
        setTouched(t => ({ ...t, [nome]: true }));
    }, []);

    const handleCidadeSelecionada = useCallback((cidade) => {
        setCidadeSelecionada(cidade);
        setForm(f => ({ ...f, cidade_id: cidade.nome }));
        onLog?.(`Cidade selecionada: ${cidade.nome} (${cidade.uf})`, 'info');
    }, [onLog]);

    const handleCamposExtraidos = useCallback((dados) => {
        const novosCampos = {};
        const novaConfianca = {};

        const cargoFicha = String(dados.campos?._cargo_texto || '').trim();
        const cboFicha = String(dados.campos?._cbo_texto || '').trim();
        if (cargoFicha || cboFicha) {
            const dica = [
                cargoFicha ? `Cargo na ficha: "${cargoFicha}"` : '',
                cboFicha ? `CBO: ${cboFicha}` : '',
            ].filter(Boolean).join(' · ');
            setDicaFuncao(dica);
            novosCampos._cargo_texto = cargoFicha;
            novosCampos._cbo_texto = cboFicha;
        } else {
            setDicaFuncao('');
        }

        for (const [nome, valor] of Object.entries(dados.campos || {})) {
            if (!valor) continue;
            // Cidade vem como texto; a resolução para FK é do operador no combobox.
            if (nome === '_cidade_texto') {
                novosCampos.cidade_id = valor;
                novaConfianca.cidade_id = dados.confianca?.[nome] ?? 0;
                continue;
            }
            if (nome === '_uf_texto' || nome === '_cargo_texto' || nome === '_cbo_texto') continue;
            if (!campoPorNome(nome)) continue;

            novosCampos[nome] = valor;
            novaConfianca[nome] = dados.confianca?.[nome] ?? 0;
        }

        setForm(f => ({ ...f, ...novosCampos }));
        setConfianca(c => ({ ...c, ...novaConfianca }));
        setTextoBruto(dados.textoBruto || '');
        setNaoReconhecido(dados.naoReconhecido || []);

        // Marca os campos preenchidos como tocados para que erros apareçam.
        setTouched(t => {
            const novo = { ...t };
            for (const nome of Object.keys(novosCampos)) novo[nome] = true;
            return novo;
        });
    }, []);

    const handleSimular = useCallback(async () => {
        setSimulando(true);
        // Marca todos os obrigatórios como tocados para exibir os erros de cliente.
        setTouched(t => {
            const novo = { ...t };
            for (const nome of OBRIGATORIOS) novo[nome] = true;
            return novo;
        });

        try {
            // cidade_id no formulário é só o texto exibido no combobox; o FK
            // numérico real vem de cidadeSelecionada — nunca é chutado do texto.
            const dados = { ...form, cidade: cidadeSelecionada?.id || '' };
            const resposta = await enviar('/api/ti/colaborador/dry-run', user, { dados });
            setResultadoDryRun(resposta);

            if (resposta.valido) {
                mostrarToast('Simulação concluída: nenhum problema encontrado.', 'success');
                onLog?.('Simulação concluída sem erros.', 'sucesso');
            } else {
                mostrarToast(`Simulação encontrou ${resposta.erros.length} erro(s).`, 'error');
                onLog?.(`Simulação encontrou ${resposta.erros.length} erro(s) e ${resposta.avisos.length} aviso(s).`, 'erro');
            }
        } catch (e) {
            mostrarToast(`Falha ao rodar a simulação: ${e.message}`, 'error');
            onLog?.(`Falha ao rodar a simulação: ${e.message}`, 'erro');
        } finally {
            setSimulando(false);
        }
    }, [form, cidadeSelecionada, user, mostrarToast, onLog]);

    const camposPorSecao = useMemo(() => {
        const mapa = {};
        for (const secao of SECOES) mapa[secao.id] = [];
        for (const campo of CAMPOS) mapa[campo.secao].push(campo);
        return mapa;
    }, []);

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

                <UploadFicha
                    user={user}
                    onCamposExtraidos={handleCamposExtraidos}
                    onLog={onLog}
                />

                {SECOES.map(secao => {
                    const campos = camposPorSecao[secao.id];
                    const camposVisiveis = campos.filter(campo => {
                        if (campo.condicional === 'criar_usuario == S') return form.criar_usuario === 'S';
                        return true;
                    });
                    if (!camposVisiveis.length) return null;

                    return (
                        <SecaoForm key={secao.id} secao={secao}>
                            {camposVisiveis.map(campo => (
                                <CampoForm
                                    key={campo.nome}
                                    campo={campo}
                                    valor={form[campo.nome] ?? ''}
                                    erro={erros[campo.nome]}
                                    touched={touched[campo.nome]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    taxonomias={taxonomias}
                                    carregandoTaxonomias={carregando}
                                    user={user}
                                    onCidadeSelecionada={handleCidadeSelecionada}
                                    confianca={confianca[campo.nome]}
                                    editado={editado[campo.nome]}
                                    dica={campo.nome === 'id_funcao' ? dicaFuncao : undefined}
                                />
                            ))}
                        </SecaoForm>
                    );
                })}
            </div>

            <PainelLateral
                form={form}
                erros={erros}
                onSimular={handleSimular}
                simulando={simulando}
                onRecarregar={recarregar}
                log={log || []}
                textoBruto={textoBruto}
                naoReconhecido={naoReconhecido}
                resultadoDryRun={resultadoDryRun}
            />

            {toast.show && (
                <div className="fixed right-4 top-4 z-[9999] duration-300 animate-in fade-in slide-in-from-top-4 sm:right-8 sm:top-8">
                    <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-md ${
                        toast.type === 'success'
                            ? 'border-emerald-400 bg-emerald-500/90 text-white'
                            : 'border-red-400 bg-red-500/90 text-white'
                    }`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="font-bold tracking-wide">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
