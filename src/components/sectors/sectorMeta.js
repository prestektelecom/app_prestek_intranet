// Descrições e ícones dos setores, movidos sem alteração do antigo
// Sectors.jsx monolítico. A descrição vinda do banco (descricao_customizada)
// sempre tem precedência sobre este mapa — ele é o fallback editorial.

// Mapa de descrições por nome exato do setor (uppercase)
export const DESCRICAO_MAP = {
    'ANÁLISE ESPACIAL E PROJETOS DE REDE FTTH': 'Responsável pelo planejamento, mapeamento geoespacial e projetos de expansão da rede de fibra óptica FTTH.',
    'ATENDIMENTO': 'Primeiro ponto de contato com o cliente, prestando suporte, esclarecimentos e encaminhamentos para os setores responsáveis.',
    'AUDITORIA': 'Monitora e avalia processos internos garantindo conformidade com políticas e padrões de qualidade da empresa.',
    'AUDITORIA DE CONTRATOS': 'Analisa e verifica contratos firmados com clientes, assegurando conformidade legal e comercial.',
    'CANCELAMENTOS': 'Gerencia solicitações de cancelamento de serviços, trabalhando na retenção e fidelização dos clientes.',
    'COBRANÇA': 'Responsável pela gestão de inadimplência, negociação de débitos e regularização de contas de clientes.',
    'COBRANÇA EXTERNA': 'Atua na recuperação de créditos externos, realizando cobranças presenciais e negociações de campo.',
    'COMERCIAL': 'Responsável pela prospecção ativa, vendas de novos planos e expansão da base de clientes da empresa.',
    'COMERCIAL-PASSIVO': 'Atende demandas comerciais receptivas, convertendo contatos e interessados em novos assinantes.',
    'CORRECAO TECNICA': 'Realiza correções técnicas em instalações e equipamentos para restabelecer a qualidade do serviço.',
    'CORRECAO TECNICA INFRAESTRUTURA': 'Executa manutenção corretiva na infraestrutura de rede, solucionando falhas em cabos, postes e equipamentos.',
    'DEVOLIÇÃO DE EQUIPAMENTOS': 'Gerencia o processo de recolhimento, triagem e devolução de equipamentos locados pelos clientes.',
    'DIRETORIA': 'Responsável pela gestão estratégica, tomada de decisões e direcionamento geral da empresa.',
    'ESTOQUE': 'Controla o recebimento, armazenamento e distribuição de equipamentos e materiais utilizados nas operações.',
    'FEEDBACK': 'Coleta e analisa feedbacks de clientes para orientar melhorias nos serviços e na experiência do usuário.',
    'FINANCEIRO': 'Responsável pela gestão financeira, fluxo de caixa, contas a pagar e receber e relatórios contábeis.',
    'FROTA': 'Gerencia os veículos da empresa, incluindo manutenção, abastecimento e controle de deslocamentos.',
    'GERENCIA': 'Coordena equipes e processos operacionais, garantindo o cumprimento de metas e a eficiência dos setores.',
    'INFRAESTRUTURA': 'Mantém e expande a infraestrutura de rede, incluindo cabos, torres, roteadores e equipamentos de transmissão.',
    'INSTALAÇÃO': 'Realiza a instalação de serviços e equipamentos na casa dos clientes, garantindo a ativação correta do acesso.',
    'NOC': 'Centro de operações que monitora a rede em tempo real, identificando e resolvendo falhas de conectividade.',
    'PATRIMONIO': 'Controla e preserva os bens físicos da empresa, realizando inventários e gerenciando ativos patrimoniais.',
    'RECURSOS HUMANOS': 'Gerencia admissões, demissões, benefícios, treinamentos e o bem-estar dos colaboradores da empresa.',
    'RECURSOS HUMANOS (RH)': 'Gerencia admissões, demissões, benefícios, treinamentos e o bem-estar dos colaboradores da empresa.',
    'RELACIONAMENTO': 'Cultiva o relacionamento com clientes por meio de ações de pós-venda, satisfação e fidelização.',
    'SERVICO': 'Coordena a prestação de serviços técnicos e operacionais garantindo qualidade e cumprimento de prazos.',
    'SUPORTE': 'Presta assistência técnica remota a clientes, diagnosticando e resolvendo problemas de conexão e equipamentos.',
    'T.I': 'Gerencia os sistemas, redes internas, segurança da informação e infraestrutura tecnológica da empresa.',
};

export function getDescricaoForSetor(nome) {
    const nomeUpper = (nome || '').trim().toUpperCase();
    if (DESCRICAO_MAP[nomeUpper]) return DESCRICAO_MAP[nomeUpper];
    // Fallback por palavra-chave
    const lower = nomeUpper.toLowerCase();
    if (lower.includes('atendimento') || lower.includes('suporte')) return 'Responsável pelo atendimento e suporte aos clientes e colaboradores.';
    if (lower.includes('comercial') || lower.includes('venda')) return 'Responsável pela prospecção e fechamento de novos contratos.';
    if (lower.includes('financeiro') || lower.includes('cobranc')) return 'Gerencia as finanças e receitas da empresa.';
    if (lower.includes('ti') || lower.includes('infra') || lower.includes('noc')) return 'Responsável pela infraestrutura tecnológica e operações de rede.';
    if (lower.includes('rh') || lower.includes('recursos humanos')) return 'Gerencia os colaboradores e processos de gestão de pessoas.';
    return 'Setor responsável por suas atividades específicas dentro da organização Prestek.';
}

// Mapa de ícones por palavra-chave no nome do departamento
export const ICON_MAP = [
    { keys: ['ti', 'tecnologia', 'infra', 'infrastructure', 'tech', 'sistema'], icon: 'dns' },
    { keys: ['comercial', 'venda', 'marketing', 'mkt', 'negocio'], icon: 'storefront' },
    { keys: ['rh', 'recursos humanos', 'gente', 'people', 'gestão de pessoas'], icon: 'groups' },
    { keys: ['financeiro', 'financ', 'jurídico', 'juridico', 'contabil', 'fiscal'], icon: 'account_balance' },
    { keys: ['suporte', 'atendimento', 'helpdesk', 'cliente'], icon: 'support_agent' },
    { keys: ['operação', 'operacoes', 'operações', 'logistica', 'operacional'], icon: 'precision_manufacturing' },
    { keys: ['admin', 'administrativo', 'diretoria', 'gestão', 'gerência'], icon: 'business_center' },
    { keys: ['projetos', 'project'], icon: 'folder_managed' },
    { keys: ['campo', 'técnico', 'tecnico', 'instalação', 'instalacao'], icon: 'construction' },
];

export function getIconForSetor(nome) {
    const nomeLower = (nome || '').toLowerCase();
    for (const entry of ICON_MAP) {
        if (entry.keys.some(k => nomeLower.includes(k))) return entry.icon;
    }
    return 'corporate_fare';
}
