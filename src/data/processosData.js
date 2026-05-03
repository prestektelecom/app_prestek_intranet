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

export const PROCESSOS = [
    // ─── ATENDIMENTO AO CLIENTE ──────────────────────────────────────────
    {
        id: 'AT-001',
        nome: 'Onboarding de Novos Clientes',
        descricao: 'Procedimento padrão para registro, configuração inicial e ativação de novos clientes no sistema IXC. Cobre desde o cadastro até a entrega da conexão ativa.',
        categoria: 'atendimento',
        status: 'ativo',
        versao: '2.3',
        responsavel: {
            nome: 'Responsável de Atendimento',
            setor: 'Atendimento',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-03-12',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['cliente', 'cadastro', 'IXC', 'ativação'],
        etapas: 8,
        tempoEstimado: '60min',
    },
    {
        id: 'AT-002',
        nome: 'Tratativa de Reclamações e Cancelamentos',
        descricao: 'Fluxo de escuta, análise e resolução de reclamações formais. Inclui protocolo de retenção de clientes e critérios para aprovação de cancelamento.',
        categoria: 'atendimento',
        status: 'ativo',
        versao: '1.5',
        responsavel: {
            nome: 'Responsável de Atendimento',
            setor: 'Atendimento',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-01-20',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['reclamação', 'cancelamento', 'retenção'],
        etapas: 6,
        tempoEstimado: '30min',
    },
    {
        id: 'AT-003',
        nome: 'Pesquisa de Satisfação (NPS)',
        descricao: 'Protocolo de aplicação da pesquisa NPS pós-atendimento. Define gatilhos de envio, canais, scripts de abordagem e tratamento de detratores.',
        categoria: 'atendimento',
        status: 'revisao',
        versao: '1.0',
        responsavel: {
            nome: 'Responsável de Atendimento',
            setor: 'Atendimento',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2025-11-05',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['NPS', 'satisfação', 'pesquisa', 'feedback'],
        etapas: 4,
        tempoEstimado: '15min',
    },

    // ─── NOC / INFRAESTRUTURA ──────────────────────────────────────────────
    {
        id: 'NOC-001',
        nome: 'Resposta a Quedas de Serviço (Incidente Crítico)',
        descricao: 'Protocolo de ação imediata para interrupções críticas e inesperadas no serviço. Cobre identificação, comunicação, escalonamento e resolução.',
        categoria: 'noc',
        status: 'ativo',
        versao: '3.1',
        responsavel: {
            nome: 'Coordenador NOC',
            setor: 'NOC',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-04-01',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['incidente', 'queda', 'NOC', 'urgente', 'infraestrutura'],
        etapas: 9,
        tempoEstimado: '—',
    },
    {
        id: 'NOC-002',
        nome: 'Monitoramento Preventivo de Rede',
        descricao: 'Rotina diária de verificação de ativos críticos, análise de alarmes e geração de relatório de saúde da rede. Periodicidade: diária e semanal.',
        categoria: 'noc',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Técnico NOC',
            setor: 'NOC',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-02-14',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['monitoramento', 'preventivo', 'rede', 'relatório'],
        etapas: 5,
        tempoEstimado: '45min',
    },
    {
        id: 'NOC-003',
        nome: 'Escalonamento de Ticket para Suporte N2',
        descricao: 'Critérios e fluxo para transferência de chamados do NOC para o time de Suporte Nível 2. Inclui SLA e informações obrigatórias no handoff.',
        categoria: 'noc',
        status: 'ativo',
        versao: '1.8',
        responsavel: {
            nome: 'Coordenador NOC',
            setor: 'NOC',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-01-09',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['escalonamento', 'N2', 'SLA', 'handoff'],
        etapas: 4,
        tempoEstimado: '10min',
    },

    // ─── VENDAS COMERCIAL ─────────────────────────────────────────────────
    {
        id: 'VD-001',
        nome: 'Qualificação e Gestão de Leads',
        descricao: 'Critérios, etapas e ferramentas para qualificação de leads no funil comercial. Define o perfil ideal de cliente (ICP) e as ações por estágio.',
        categoria: 'vendas',
        status: 'ativo',
        versao: '1.2',
        responsavel: {
            nome: 'Coordenador Comercial',
            setor: 'Comercial',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-03-20',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['leads', 'qualificação', 'funil', 'ICP', 'CRM'],
        etapas: 6,
        tempoEstimado: '20min',
    },
    {
        id: 'VD-002',
        nome: 'Elaboração e Envio de Proposta Comercial',
        descricao: 'Processo de criação, validação e envio de propostas para prospectos qualificados. Inclui aprovação de descontos e SLA de resposta ao cliente.',
        categoria: 'vendas',
        status: 'revisao',
        versao: '2.1',
        responsavel: {
            nome: 'Coordenador Comercial',
            setor: 'Comercial',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2025-12-18',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['proposta', 'desconto', 'SLA', 'fechamento'],
        etapas: 5,
        tempoEstimado: '30min',
    },

    // ─── FINANCEIRO ────────────────────────────────────────────────────────
    {
        id: 'FIN-001',
        nome: 'Reembolso de Despesas Operacionais',
        descricao: 'Procedimento para solicitação, aprovação e pagamento de reembolso de despesas de colaboradores. Inclui prazos, documentação exigida e limites por categoria.',
        categoria: 'financeiro',
        status: 'ativo',
        versao: '1.0',
        responsavel: {
            nome: 'Responsável Financeiro',
            setor: 'Financeiro',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-01-30',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['reembolso', 'despesas', 'aprovação', 'financeiro'],
        etapas: 4,
        tempoEstimado: '20min',
    },
    {
        id: 'FIN-002',
        nome: 'Conciliação de Faturas e Cobranças',
        descricao: 'Rotina mensal de conciliação entre faturas emitidas no IXC e pagamentos recebidos. Define ações para inadimplentes e fluxo de negativação.',
        categoria: 'financeiro',
        status: 'rascunho',
        versao: '0.5',
        responsavel: {
            nome: 'Responsável Financeiro',
            setor: 'Financeiro',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2025-10-11',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['fatura', 'cobrança', 'inadimplência', 'conciliação'],
        etapas: 7,
        tempoEstimado: '60min',
    },

    // ─── RECURSOS HUMANOS ──────────────────────────────────────────────────
    {
        id: 'RH-001',
        nome: 'Integração de Novo Colaborador (Onboarding)',
        descricao: 'Checklist completo de boas-vindas: acesso a sistemas, apresentação à equipe, entrega de equipamentos, treinamentos obrigatórios e acompanhamento no período de experiência.',
        categoria: 'rh',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Responsável de RH',
            setor: 'Recursos Humanos',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-02-28',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['onboarding', 'integração', 'colaborador', 'treinamento'],
        etapas: 10,
        tempoEstimado: '120min',
    },
    {
        id: 'RH-002',
        nome: 'Desligamento de Colaborador',
        descricao: 'Procedimentos de saída: revogação de acessos, devolução de ativos, entrevista de desligamento e rescisão contratual. Envolve TI, Financeiro e RH.',
        categoria: 'rh',
        status: 'rascunho',
        versao: '0.5',
        responsavel: {
            nome: 'Responsável de RH',
            setor: 'Recursos Humanos',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2025-09-15',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['desligamento', 'rescisão', 'acessos', 'ativos'],
        etapas: 8,
        tempoEstimado: '90min',
    },

    // ─── TECNOLOGIA DA INFORMAÇÃO ─────────────────────────────────────────
    {
        id: 'TI-001',
        nome: 'Abertura e Gestão de Chamados de TI',
        descricao: 'Fluxo para abertura, priorização e resolução de chamados internos de TI. Define SLAs por criticidade e canais de atendimento disponíveis.',
        categoria: 'ti',
        status: 'ativo',
        versao: '1.3',
        responsavel: {
            nome: 'Coordenador de TI',
            setor: 'Tecnologia da Informação',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-04-10',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['chamado', 'TI', 'SLA', 'helpdesk'],
        etapas: 5,
        tempoEstimado: '10min',
    },
    {
        id: 'TI-002',
        nome: 'Concessão e Revogação de Acesso a Sistemas',
        descricao: 'Processo de solicitação, aprovação, criação e remoção de acessos a sistemas internos (IXC, intranet, e-mail, VPN, etc.). Controle por perfil de acesso.',
        categoria: 'ti',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Coordenador de TI',
            setor: 'Tecnologia da Informação',
            funcionario_id: null,
        },
        ultimaAtualizacao: '2026-03-05',
        docUrl: 'https://docs.google.com/document/d/1X2zO2YBoUZgPYycfpey5PrMp4FXs6GR_/edit?usp=sharing',
        tags: ['acesso', 'sistemas', 'segurança', 'IXC', 'VPN'],
        etapas: 6,
        tempoEstimado: '15min',
    },
];

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
