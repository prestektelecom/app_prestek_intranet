// Equipe efetiva de um setor = equipe do IXC + incluídos à mão − excluídos à mão.
//
// Os ajustes vivem só na intranet (tabela `setores_membros_manuais`); nada daqui
// escreve no IXC. A regra tem uma cópia do ponto de vista da PESSOA em
// src/utils/setoresDaPessoa.js — `scripts/testar-equipe-setor.mjs` roda os mesmos
// casos nas duas e falha se divergirem. Mudou aqui, mude lá.

// Suporte (15) e Relacionamento (68) têm cartão próprio em Setores, mas
// Colaboradores só mostra o chip ATENDIMENTO, que os agrega. Aceitar ajuste
// nesses dois faria as duas telas discordarem; a equipe deles se ajusta pelo
// ATENDIMENTO.
export const SETORES_SEM_AJUSTE_PROPRIO = ['15', '68'];

/**
 * @param {Array<{id: string|number}>} membrosBase  funcionários que a regra do IXC põe no setor
 * @param {Array<{id_funcionario: string, acao: 'incluir'|'excluir'}>} ajustesDoSetor
 * @param {Map<string, object>} ativosPorId  funcionários ATIVOS do IXC, por id (string)
 * @returns {{ membros: Array<object>, incluidos: number, excluidos: number }}
 *   `membros` traz cada funcionário com `origem`: 'ixc' ou 'intranet'. Os
 *   contadores só somam ajustes que TÊM efeito (ajuste sobre pessoa inativa,
 *   desconhecida ou que já está/não está no setor não conta).
 */
export function aplicarAjustes(membrosBase, ajustesDoSetor, ativosPorId) {
    const excluir = new Set();
    const incluir = new Set();
    for (const a of ajustesDoSetor || []) {
        const id = String(a.id_funcionario);
        if (a.acao === 'excluir') excluir.add(id);
        else if (a.acao === 'incluir') incluir.add(id);
    }

    const baseIds = new Set(membrosBase.map((m) => String(m.id)));
    const membros = [];
    let excluidos = 0;

    for (const m of membrosBase) {
        if (excluir.has(String(m.id))) {
            excluidos++;
            continue;
        }
        membros.push({ ...m, origem: 'ixc' });
    }

    let incluidos = 0;
    for (const id of incluir) {
        if (baseIds.has(id)) continue; // o IXC já a coloca no setor
        const f = ativosPorId.get(id);
        if (!f) continue; // inativa ou desconhecida: sem efeito
        membros.push({ ...f, origem: 'intranet' });
        incluidos++;
    }

    return { membros, incluidos, excluidos };
}
