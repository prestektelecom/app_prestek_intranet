// Dataset de Processos Operacionais — Prestek Telecom
// Dados organizados por categoria com versionamento semântico (MAJOR.MINOR)
// Responsáveis são vinculados via funcionario_id do IXC (campo responsavel.funcionario_id)
// Link principal do Google Docs / HTML fornecido pela equipe

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

export const PROCESSOS = [
    {
        id: 'TI-001',
        nome: 'Processo Chamado Suporte T.I.',
        descricao: 'Garantir que as solicitações de suporte técnico sejam registradas de forma clara e completa no IXC Soft, possibilitando à equipe de T.I. um diagnóstico ágil e resolução rápida de falhas de conexão, instabilidades e equipamentos.',
        categoria: 'ti',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Tecnologia da Informação',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 5,
        tempoEstimado: '15 min',
        tags: ['suporte', 'ixc', 'chamado', 'ordem de serviço', 'ti', 'iso9001'],
        ultimaAtualizacao: '2025-09-23',
        docUrl: '/docs/pop/POP-TI-001.html',
        bpmnUrl: '/docs/pop/POP-TI-001 - Chamado TI.bpmn',
    },
    {
        id: 'OP-001',
        nome: 'Controle de Documentos e Registros da Qualidade',
        descricao: 'Sistemática formal do SGQ ISO 9001 para criação, análise crítica, aprovação, indexação, publicação e controle de cópias de documentos e registros da Prestek Telecom.',
        categoria: 'operacoes',
        status: 'ativo',
        versao: '1.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Qualidade / T.I.',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 4,
        tempoEstimado: 'Fluxo Contínuo',
        tags: ['qualidade', 'sgq', 'iso9001', 'documentos', 'registros', 'auditoria'],
        ultimaAtualizacao: '2025-09-20',
        docUrl: '/docs/pop/POP-CDRQ-001.html',
        bpmnUrl: '/docs/pop/POP-CDRQ-001 - Fluxo de Documentos.bpmn',
    },
    {
        id: 'VENDAS-001',
        nome: 'Processo de Vendas',
        descricao: 'Padronizar a venda e ativação de serviços de internet nos canais Loja e Porta a Porta (PAP), da prospecção e cadastro no IXC Soft até a instalação, garantindo conformidade ANATEL/ISO 9001 e rastreabilidade completa da jornada do cliente.',
        categoria: 'vendas',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'T.I.',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 12,
        tempoEstimado: 'até 48h (ativação)',
        tags: ['vendas', 'comercial', 'ixc', 'inmap', 'pap', 'porta a porta', 'cadastro de cliente', 'reativação'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-VENDAS-001.html',
        bpmnUrl: '/docs/pop/POP-VENDAS-001.bpmn',
    },
    {
        id: 'IR-001',
        nome: 'Instalação de Roteador',
        descricao: 'Padronizar a instalação, troca e manutenção de roteadores em regime de comodato nas residências dos clientes, da triagem no Atendimento até a instalação técnica em campo (materiais, limiares de CTO, autenticação da ONU pelo NOC, configuração PPPoE/Wi-Fi), auditoria de conformidade e verificação de satisfação do cliente.',
        categoria: 'noc',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Serviço / NOC',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 5,
        tempoEstimado: '24h (SLA de instalação, meta 95%)',
        tags: ['instalação', 'roteador', 'comodato', 'cto', 'onu', 'pppoe', 'wi-fi', 'noc', 'ftth', 'iso9001'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-IR-001.html',
        bpmnUrl: '/docs/pop/POP-IR-001.bpmn',
    },
    {
        id: 'INTLE-01',
        nome: 'Suporte Internet Lenta',
        descricao: 'Padronizar o tratamento de chamados de Internet Lenta e Reincidência, da triagem no SAC/Atendimento ao diagnóstico remoto do NOC, passando pelo suporte técnico presencial e pelo feedback de satisfação — garantindo diagnósticos rastreáveis e reduzindo o retrabalho.',
        categoria: 'noc',
        status: 'ativo',
        versao: '4.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'NOC / Tecnologia da Informação',
            cargo: 'Supervisor T.I. / NOC',
            funcionario_id: null,
        },
        etapas: 4,
        tempoEstimado: '30 min',
        tags: ['suporte', 'noc', 'internet lenta', 'reincidencia', 'ixc', 'onu', 'sac', 'iso9001'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-INTLE-01.html',
        bpmnUrl: '/docs/pop/POP-INTLE-01.bpmn',
    },
    {
        id: 'SUPPROAT-01',
        nome: 'Suporte Proativo NOC',
        descricao: 'Identificar antecipadamente falhas, instabilidades e degradações de serviço na rede FTTH a partir de alertas, alarmes e quedas monitorados pelo NOC, reduzindo impactos ao cliente e chamados reativos.',
        categoria: 'noc',
        status: 'ativo',
        versao: '1.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'NOC',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 5,
        tempoEstimado: '20 min',
        tags: ['noc', 'proativo', 'ftth', 'monitoramento', 'ixc', 'onu', 'iso9001'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-SUPPROAT-01.html',
        bpmnUrl: '/docs/pop/POP-SUPPROAT-01.bpmn',
    },
    {
        id: 'COB-01',
        nome: 'Cobrança',
        descricao: 'Padronizar as etapas de cobrança automatizada, interna ativa, receptiva e externa da Prestek Telecom, incluindo a rotina de campo de retirada de fibra/comodato (escopo em confirmação com Infraestrutura/Patrimônio).',
        categoria: 'financeiro',
        status: 'revisao',
        versao: '2.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Cobrança',
            cargo: 'Responsável pela Documentação do Processo (SGQ)',
            funcionario_id: null,
        },
        etapas: 5,
        tempoEstimado: '48h por O.S. (SLA da Cobrança Interna Ativa)',
        tags: ['cobranca', 'inadimplencia', 'crm cobranca', 'synapz', 'ixc', 'cobranca externa', 'comodato'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-COB-01.html',
        bpmnUrl: '/docs/pop/POP-COB-01.bpmn',
    },
    {
        id: 'GERFIN-01',
        nome: 'Gerar Financeiro',
        descricao: 'Padronizar a geração de faturas e boletos dos clientes no IXC Soft (checklist, validação de contrato/pendências e lançamento 501/502), com validação cruzada obrigatória da Auditoria antes da conclusão de cada Ordem de Serviço.',
        categoria: 'financeiro',
        status: 'revisao',
        versao: '1.0',
        responsavel: {
            nome: 'Responsável Financeiro',
            setor: 'Financeiro',
            cargo: 'Responsável Financeiro / Cobrança',
            funcionario_id: null,
        },
        etapas: 8,
        tempoEstimado: 'Não definido (SLA de auditoria em definição)',
        tags: ['financeiro', 'faturamento', 'boleto', 'ixc', 'auditoria', 'cobranca'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-GERFIN-01.html',
        bpmnUrl: '/docs/pop/POP-GERFIN-01.bpmn',
    },
    {
        id: 'FROTA-001',
        nome: 'Gestão de Frota',
        descricao: 'Padronizar o fluxo de manutenções preventivas e corretivas de toda a frota da Prestek Telecom (motocicletas e carros), desde a identificação da necessidade até a cotação, aprovação em oficina credenciada, execução, registro no IXC e pagamento.',
        categoria: 'operacoes',
        status: 'ativo',
        versao: '1.0',
        responsavel: { nome: 'Marcio Eduardo Felix', setor: 'Frota', cargo: 'Responsável pela Documentação do Processo (SGQ)', funcionario_id: null },
        etapas: 13,
        tempoEstimado: 'Variável (preventiva: 1-3 dias úteis; corretiva: prioridade imediata)',
        tags: ['frota', 'veiculos', 'motocicletas', 'carros', 'manutencao', 'preventiva', 'corretiva', 'ixc', 'oficina credenciada'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-FROTA-001.html',
        bpmnUrl: '/docs/pop/POP-FROTA-001.bpmn',
    },
    {
        id: 'SST-001',
        nome: 'Segurança no Trabalho',
        descricao: 'Padronizar as rotinas de inspeção, controle de EPI/EPC, DDS (Diálogo Diário de Segurança), registro e tratativa de não conformidades e incidentes, garantindo a integridade dos trabalhadores e o cumprimento das Normas Regulamentadoras (NR-6, NR-10, NR-35, entre outras).',
        categoria: 'operacoes',
        status: 'ativo',
        versao: '1.0',
        responsavel: { nome: 'Marcio Eduardo Felix', setor: 'Segurança do Trabalho', cargo: 'Supervisor de SST', funcionario_id: null },
        etapas: 9,
        tempoEstimado: 'Rotina diária (DDS + inspeções por turno)',
        tags: ['sst', 'seguranca-do-trabalho', 'epi', 'epc', 'dds', 'nr-6', 'nr-10', 'nr-35', 'acidente', 'cat'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-SST-001.html',
        bpmnUrl: '/docs/pop/POP-SST-001.bpmn',
    },
    {
        id: 'F-SAC-001',
        nome: 'Formulário de Solicitação de Cancelamento',
        descricao: 'Registro oficial utilizado para formalizar a solicitação de cancelamento de contrato ou serviço pelo cliente, coletando dados cadastrais, dados do contrato, motivo do cancelamento e ciência formal do cliente para dar suporte ao processo de atendimento e ao SGQ.',
        categoria: 'atendimento',
        status: 'ativo',
        versao: '1.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Atendimento / Qualidade',
            cargo: 'Supervisor T.I.',
            funcionario_id: null,
        },
        etapas: 5,
        tempoEstimado: '10 min',
        tags: ['cancelamento', 'formulario', 'ixc', 'atendimento', 'sgq', 'rescisao contratual', 'iso9001'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/F-SAC-001.html',
        bpmnUrl: '/docs/pop/F-SAC-001.bpmn',
    },
    {
        id: 'REATVC-001',
        nome: 'Reativação de Internet',
        descricao: 'Padronizar o processo de reativação de internet: elegibilidade pela janela de 120 dias, verificação de equipamentos e débitos/multa, tratativa como pré-contrato ou cliente normal, e visita técnica (com taxa de R$ 50,00) apenas quando necessária.',
        categoria: 'atendimento',
        status: 'ativo',
        versao: '2.0',
        responsavel: {
            nome: 'Marcio Eduardo Felix',
            setor: 'Atendimento / Comercial',
            cargo: 'Setor T.I.',
            funcionario_id: null,
        },
        etapas: 8,
        tempoEstimado: '4-6 horas',
        tags: ['reativação', 'internet', 'reinstalação', 'fibra óptica', 'ftth', 'atendimento', 'anatel'],
        ultimaAtualizacao: '2026-09-10',
        docUrl: '/docs/pop/POP-REATVC-001.html',
        bpmnUrl: '/docs/pop/POP-REATVC-001.bpmn',
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
