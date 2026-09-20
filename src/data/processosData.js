// Dataset de Processos Operacionais — Prestek Telecom
// Dados organizados por categoria com versionamento semântico (MAJOR.MINOR)
// Responsáveis são vinculados via funcionario_id do IXC (campo responsavel.funcionario_id)
// Link principal do Google Docs fornecido pela equipe

export const CATEGORIAS = [
    {
        id: 'todos',
        label: 'Todas as Categorias',
        icon: 'grid_view',
        prefixo: null,
    },
    {
        id: 'atendimento',
        label: 'Atendimento ao Cliente',
        icon: 'support_agent',
        prefixo: 'AT',
        cor: 'blue',
    },
    {
        id: 'noc',
        label: 'NOC / Infraestrutura',
        icon: 'router',
        prefixo: 'NOC',
        cor: 'green',
    },
    {
        id: 'vendas',
        label: 'Vendas Comercial',
        icon: 'sell',
        prefixo: 'VD',
        cor: 'purple',
    },
    {
        id: 'financeiro',
        label: 'Financeiro',
        icon: 'payments',
        prefixo: 'FIN',
        cor: 'yellow',
    },
    {
        id: 'rh',
        label: 'Recursos Humanos',
        icon: 'person',
        prefixo: 'RH',
        cor: 'pink',
    },
    {
        id: 'ti',
        label: 'Tecnologia da Informação',
        icon: 'computer',
        prefixo: 'TI',
        cor: 'orange',
    },
    {
        id: 'operacoes',
        label: 'Operações Gerais',
        icon: 'settings',
        prefixo: 'OP',
        cor: 'gray',
    },
];

// Status válidos: ativo | revisao | rascunho | arquivado
// Só o rótulo — a cor vem do sistema de tokens do tema (`StatusBadge` em
// Processos.jsx), não daqui. `bg`/`text` com classes Tailwind cruas saíram
// porque só distinguiam claro/escuro via `dark:`, ignorando as variantes
// Cyber/Aurora/AMOLED que o token do tema já resolve sozinho.
export const STATUS_CONFIG = {
    ativo: { label: 'Ativo' },
    revisao: { label: 'Em Revisão' },
    rascunho: { label: 'Rascunho' },
    arquivado: { label: 'Arquivado' },
};

export const PROCESSOS = [];

// Retorna contagem de processos por categoria
export function getContagemPorCategoria() {
    return PROCESSOS.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] || 0) + 1;
        return acc;
    }, {});
}

// Retorna percentual de processos ativos por categoria
export function getPercentualAtivosPorCategoria() {
    const total = {};
    const ativos = {};
    PROCESSOS.forEach(p => {
        total[p.categoria] = (total[p.categoria] || 0) + 1;
        if (p.status === 'ativo') ativos[p.categoria] = (ativos[p.categoria] || 0) + 1;
    });
    return Object.fromEntries(
        Object.keys(total).map(cat => [cat, Math.round(((ativos[cat] || 0) / total[cat]) * 100)])
    );
}
