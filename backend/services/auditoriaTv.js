// Auditoria de assinaturas de TV (Watch, ITTV, youCast...) — SOMENTE LEITURA.
//
// Cruza três recursos do IXC, sem tocar na API de nenhuma plataforma de TV:
//   tv_usuarios           → a assinatura (plataforma, status_assinante_watch)
//   cliente_contrato      → situação do contrato (status, status_internet)
//   vd_contratos_produtos → o item cobrado (valor_unit, qtde, descricao)
//
// Atenção: `status_assinante_watch` NÃO é presença nem último acesso — é a
// flag "assinatura ativa na plataforma". O IXC não guarda dado de uso; ver
// MEMORIA.md. Esta auditoria responde "estamos pagando/cobrando certo?", não
// "o cliente está assistindo?".
//
// `tv_usuarios` guarda VÁRIAS plataformas na mesma tabela (ITTV ≈ 69%, watch
// ≈ 29%). Misturá-las produz números enganosos, por isso cada achado carrega
// a plataforma e a UI filtra por ela.

import { paginarIXC } from './ixc.js';

const PLATAFORMA_ROTULO = {
    watch: 'Watch',
    watchespn: 'Watch ESPN',
    ittv: 'ITTV',
    youcast: 'youCast',
    apptec: 'Apptec',
};

export const rotuloPlataforma = (p) => {
    const chave = String(p || '').trim().toLowerCase();
    return PLATAFORMA_ROTULO[chave] || (String(p || '').trim() || 'Sem plataforma');
};

// cliente_contrato.status: A ativo, I inativo, D desistiu, N negativado,
// P pré-contrato, CM/CA aparecem em status_internet (bloqueio/cancelamento).
const STATUS_CONTRATO = { A: 'Ativo', I: 'Inativo', D: 'Desistiu', N: 'Negativado', P: 'Pré-contrato', C: 'Cancelado' };
const STATUS_INTERNET = {
    A: 'Ativo', D: 'Desativado', CM: 'Bloqueio manual', CA: 'Bloqueio automático', FA: 'Financeiro em atraso', AA: 'Aguardando assinatura',
};

const num = (v) => {
    const n = Number(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};

/**
 * Cruzamento puro (sem rede) — separado para ser testável com fixtures.
 *
 * @returns {{ pagandoSemDireito: Array, cobrandoSemEntregar: Array, resumo: object }}
 */
export function cruzar({ usuarios, contratos, produtos }) {
    const contratoPorId = new Map(contratos.map(c => [String(c.id), c]));
    const produtoPorId = new Map(produtos.map(p => [String(p.id), p]));

    // Contratos que têm ao menos UMA assinatura ativa em cada plataforma. Um
    // contrato pode ter mais de um login; um login inativo ao lado de um ativo
    // da mesma plataforma é troca de conta, não "cobrando sem entregar".
    const ativoNaPlataforma = new Set();
    for (const u of usuarios) {
        if (String(u.status_assinante_watch) === '1') {
            ativoNaPlataforma.add(`${u.id_contrato}|${String(u.plataforma).toLowerCase()}`);
        }
    }

    const pagandoSemDireito = [];
    const cobrandoSemEntregar = [];

    for (const u of usuarios) {
        const ativa = String(u.status_assinante_watch) === '1';
        const contrato = contratoPorId.get(String(u.id_contrato));
        const produto = produtoPorId.get(String(u.id_vd_contratos_produtos));
        const valor = produto ? num(produto.valor_unit) * (num(produto.qtde) || 1) : 0;

        const base = {
            idUsuario: String(u.id),
            idContrato: String(u.id_contrato),
            login: u.login || '',
            plataforma: rotuloPlataforma(u.plataforma),
            produto: produto?.descricao || '',
            valorMensal: Math.round(valor * 100) / 100,
        };

        if (ativa) {
            // Lista 1: assinatura ligada, contrato sem direito a ela.
            if (!contrato) {
                pagandoSemDireito.push({
                    ...base, gravidade: 'critico', statusContrato: 'Contrato não encontrado',
                    motivo: 'Assinatura ativa sem contrato correspondente no IXC.',
                });
            } else if (contrato.status !== 'A') {
                pagandoSemDireito.push({
                    ...base, gravidade: 'critico',
                    statusContrato: STATUS_CONTRATO[contrato.status] || contrato.status,
                    motivo: 'Contrato não está ativo e a assinatura continua ligada na plataforma.',
                });
            } else if (contrato.status_internet && contrato.status_internet !== 'A') {
                pagandoSemDireito.push({
                    ...base, gravidade: 'atencao',
                    statusContrato: `Ativo · internet ${STATUS_INTERNET[contrato.status_internet] || contrato.status_internet}`,
                    motivo: 'Contrato ativo, mas a internet está bloqueada/cancelando — a TV pode ter de acompanhar.',
                });
            }
        } else if (contrato?.status === 'A' && produto && valor > 0) {
            // Lista 2: contrato ativo, produto de TV COBRADO (valor > 0) ligado
            // a este login, e a assinatura não está ativa. Produto de valor 0
            // (cortesia/provisionado) é deliberadamente ignorado: era ~1.366
            // falsos positivos na ITTV.
            const temOutroAtivo = ativoNaPlataforma.has(`${u.id_contrato}|${String(u.plataforma).toLowerCase()}`);
            if (!temOutroAtivo) {
                cobrandoSemEntregar.push({
                    ...base, gravidade: 'atencao',
                    statusContrato: 'Ativo',
                    desabilitadoManual: u.manually_disabled === 'S',
                    motivo: u.manually_disabled === 'S'
                        ? 'Assinatura desabilitada manualmente, mas o produto continua sendo cobrado.'
                        : 'Produto de TV cobrado no contrato, sem assinatura ativa na plataforma.',
                });
            }
        }
    }

    const soma = (lista) => Math.round(lista.reduce((a, i) => a + i.valorMensal, 0) * 100) / 100;
    const ordenar = (lista) => lista.sort((a, b) =>
        (a.gravidade === b.gravidade ? 0 : a.gravidade === 'critico' ? -1 : 1) ||
        a.plataforma.localeCompare(b.plataforma) || Number(a.idContrato) - Number(b.idContrato));

    return {
        pagandoSemDireito: ordenar(pagandoSemDireito),
        cobrandoSemEntregar: ordenar(cobrandoSemEntregar),
        resumo: {
            totalAssinaturas: usuarios.length,
            assinaturasAtivas: usuarios.filter(u => String(u.status_assinante_watch) === '1').length,
            pagandoSemDireito: pagandoSemDireito.length,
            pagandoSemDireitoValor: soma(pagandoSemDireito),
            cobrandoSemEntregar: cobrandoSemEntregar.length,
            cobrandoSemEntregarValor: soma(cobrandoSemEntregar),
        },
    };
}

/**
 * Coleta as três tabelas do IXC (leitura) e devolve o cruzamento.
 * `projetar` descarta o registro bruto na hora: cliente_contrato tem 100+
 * campos e 55 mil linhas, que estourariam o heap guardadas por inteiro.
 */
export async function auditarTv() {
    const opcoes = { concorrencia: 1, timeoutMs: 120000 };

    const [usr, ctr, prd] = await Promise.all([
        paginarIXC('tv_usuarios', { qtype: 'tv_usuarios.id', query: '0', oper: '>' }, {
            ...opcoes,
            projetar: u => ({
                id: u.id, id_contrato: u.id_contrato, login: u.login, plataforma: u.plataforma,
                status_assinante_watch: u.status_assinante_watch, manually_disabled: u.manually_disabled,
                id_vd_contratos_produtos: u.id_vd_contratos_produtos,
            }),
        }),
        paginarIXC('cliente_contrato', { qtype: 'cliente_contrato.id', query: '0', oper: '>' }, {
            ...opcoes,
            rp: 5000,
            projetar: c => ({ id: c.id, status: c.status, status_internet: c.status_internet }),
        }),
        paginarIXC('vd_contratos_produtos', { qtype: 'vd_contratos_produtos.id', query: '0', oper: '>' }, {
            ...opcoes,
            projetar: p => ({ id: p.id, valor_unit: p.valor_unit, qtde: p.qtde, descricao: p.descricao }),
        }),
    ]);

    // Se uma página falhou, paginarIXC devolve menos registros que o total.
    // Auditar com dado incompleto geraria "contrato não encontrado" falso.
    const incompleto = [
        ['tv_usuarios', usr], ['cliente_contrato', ctr], ['vd_contratos_produtos', prd],
    ].filter(([, r]) => r.registros.length < r.total).map(([nome]) => nome);
    if (incompleto.length) {
        const err = new Error(`Coleta incompleta do IXC (${incompleto.join(', ')}).`);
        err.curado = true;
        throw err;
    }

    return cruzar({ usuarios: usr.registros, contratos: ctr.registros, produtos: prd.registros });
}
