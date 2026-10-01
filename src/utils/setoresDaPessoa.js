// Setores efetivos de uma PESSOA: o do IXC mais os incluídos à mão, menos os
// excluídos à mão. É a mesma regra de backend/services/equipeSetor.js vista do
// outro lado (lá, "quem é do setor X"; aqui, "de quais setores esta pessoa é").
// `scripts/testar-equipe-setor.mjs` roda os mesmos casos nas duas e falha se
// divergirem. Mudou aqui, mude lá.
//
// `canonico` é o agrupamento de ATENDIMENTO do Directory (15 e 68 → 13). Só o
// setor do IXC é canonizado: ajustes nunca apontam para 15 ou 68 (o backend os
// recusa), então um ajuste sempre fala o mesmo id que o chip mostra.

// O IXC mantém três ids de departamento para o que a empresa trata como um
// setor só (13 = Atendimento, com 15 e 68 como desdobramentos herdados de
// migrações antigas). Colaboradores e a edição de equipe usam este mesmo mapa.
export const DEPTOS_MESCLADOS = { '13': ['15', '68'] };

/** Id sob o qual um colaborador deve ser contado nos chips (15 e 68 viram 13). */
export function idCanonico(id) {
    const alvo = String(id || '').trim();
    for (const [canonico, alias] of Object.entries(DEPTOS_MESCLADOS)) {
        if (alias.includes(alvo)) return canonico;
    }
    return alvo;
}

/**
 * @param {string|number|null|undefined} idDepartamento  setor do IXC (principal)
 * @param {Array<{id_setor: string, acao: 'incluir'|'excluir'}>} [ajustes]
 * @param {(id: string) => string} [canonico]
 * @returns {string[]} ids de setor; o do IXC vem primeiro quando não foi excluído
 */
export function setoresDaPessoa(idDepartamento, ajustes = [], canonico = idCanonico) {
    const base = canonico(String(idDepartamento ?? '').trim());
    const excluir = new Set();
    const incluir = [];
    for (const a of ajustes || []) {
        const id = String(a.id_setor).trim();
        if (a.acao === 'excluir') excluir.add(id);
        else if (a.acao === 'incluir') incluir.push(id);
    }

    const setores = [];
    if (base && !excluir.has(base)) setores.push(base);
    for (const id of incluir) {
        if (!setores.includes(id) && !excluir.has(id)) setores.push(id);
    }
    return setores;
}

/** Setores definidos só na intranet (inclusões), para o "também em: X" do cartão. */
export function setoresIncluidosNaIntranet(idDepartamento, ajustes = [], canonico = idCanonico) {
    const principal = canonico(String(idDepartamento ?? '').trim());
    return (ajustes || [])
        .filter((a) => a.acao === 'incluir')
        .map((a) => String(a.id_setor).trim())
        .filter((id) => id !== principal);
}
