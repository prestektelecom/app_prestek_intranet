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
export const STATUS_CONFIG = {
    ativo: { label: 'Ativo', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300' },
    revisao: { label: 'Em Revisão', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300' },
    rascunho: { label: 'Rascunho', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
    arquivado: { label: 'Arquivado', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
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
