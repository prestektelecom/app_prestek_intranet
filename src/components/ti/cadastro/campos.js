// Descrição declarativa das seções e campos do cadastro de colaborador.
// O formulário é gerado a partir daqui; mudar um campo passa a ser mudar dado.

// Códigos confirmados contra o schema real do IXC (values de `estado_civil`
// em funcionarios): "S = Solteiro(a) C = Casado(a) UE = União Estável
// D = Divorciado(a) V = Viúvo(a) SE = Separado(a)". A versão anterior usava
// 'U' para União Estável (código inexistente) e não tinha Separado(a).
export const ESTADO_CIVIL = [
    { valor: 'S', rotulo: 'Solteiro(a)' },
    { valor: 'C', rotulo: 'Casado(a)' },
    { valor: 'UE', rotulo: 'União Estável' },
    { valor: 'D', rotulo: 'Divorciado(a)' },
    { valor: 'V', rotulo: 'Viúvo(a)' },
    { valor: 'SE', rotulo: 'Separado(a)' },
];

export const COR_RACA = [
    { valor: 'A', rotulo: 'Amarela' },
    { valor: 'B', rotulo: 'Branca' },
    { valor: 'I', rotulo: 'Indígena' },
    { valor: 'P', rotulo: 'Parda' },
    { valor: 'N', rotulo: 'Negra' },
    { valor: 'O', rotulo: 'Outra' },
];

export const GRAU_ESCOLARIDADE = [
    { valor: 'EF', rotulo: 'Ensino Fundamental' },
    { valor: 'EM', rotulo: 'Ensino Médio' },
    { valor: 'ES', rotulo: 'Ensino Superior' },
    { valor: 'PG', rotulo: 'Pós-graduação' },
    { valor: 'M', rotulo: 'Mestrado' },
    { valor: 'D', rotulo: 'Doutorado' },
];

export const OPCOES_SN = [
    { valor: 'S', rotulo: 'Sim' },
    { valor: 'N', rotulo: 'Não' },
];

export const SECOES = [
    {
        id: 'vinculo',
        icone: 'badge',
        titulo: 'Vínculo',
        subtitulo: 'Listas de referência do IXC, carregadas uma vez e reaproveitadas.',
    },
    {
        id: 'identificacao',
        icone: 'person',
        titulo: 'Identificação',
        subtitulo: 'Dados pessoais do colaborador.',
    },
    {
        id: 'filiacao',
        icone: 'diversity_1',
        titulo: 'Filiação',
        subtitulo: 'Filiação materna e paterna.',
    },
    {
        id: 'documentos',
        icone: 'article',
        titulo: 'Documentos',
        subtitulo: 'RG, CTPS, Título Eleitoral e PIS.',
    },
    {
        id: 'endereco',
        icone: 'location_on',
        titulo: 'Endereço e Contato',
        subtitulo: 'CEP, cidade e formas de contato.',
    },
    {
        id: 'acesso',
        icone: 'vpn_key',
        titulo: 'Acesso ao Sistema',
        subtitulo: 'Credenciais e configurações obrigatórias do IXC.',
    },
];

export const CAMPOS = [
    // Vínculo
    {
        nome: 'filial_id', rotulo: 'Filial', tipo: 'select', secao: 'vinculo',
        obrigatorio: true, fonteTaxonomia: 'filiais', span: 1,
    },
    {
        nome: 'id_departamento', rotulo: 'Departamento', tipo: 'select', secao: 'vinculo',
        obrigatorio: false, fonteTaxonomia: 'departamentos', span: 1,
    },
    {
        nome: 'id_funcao', rotulo: 'Função', tipo: 'select', secao: 'vinculo',
        obrigatorio: false, fonteTaxonomia: 'funcoes', span: 1,
    },
    {
        nome: 'id_conta', rotulo: 'Conta contábil', tipo: 'select', secao: 'vinculo',
        obrigatorio: true, fonteTaxonomia: 'contas', span: 1,
    },

    // Identificação
    {
        nome: 'funcionario', rotulo: 'Nome completo', tipo: 'text', secao: 'identificacao',
        obrigatorio: true, maxLength: 100, span: 2, placeholder: 'Ex.: Maria Silva',
    },
    {
        nome: 'cpf_cnpj', rotulo: 'CPF', tipo: 'text', secao: 'identificacao',
        obrigatorio: true, mascara: 'cpf', span: 1, placeholder: '000.000.000-00',
    },
    {
        nome: 'data_nascimento', rotulo: 'Data de nascimento', tipo: 'date', secao: 'identificacao',
        obrigatorio: false, span: 1,
    },
    {
        nome: 'nacionalidade', rotulo: 'Nacionalidade', tipo: 'text', secao: 'identificacao',
        obrigatorio: false, span: 1, placeholder: 'Brasileira',
    },
    {
        nome: 'possui_deficiencia', rotulo: 'Possui deficiência', tipo: 'segmentado', secao: 'identificacao',
        obrigatorio: false, opcoes: OPCOES_SN, span: 1,
    },
    {
        nome: 'estado_civil', rotulo: 'Estado civil', tipo: 'select', secao: 'identificacao',
        obrigatorio: false, opcoes: ESTADO_CIVIL, span: 1,
    },
    {
        nome: 'grau_escolaridade', rotulo: 'Escolaridade', tipo: 'select', secao: 'identificacao',
        obrigatorio: false, opcoes: GRAU_ESCOLARIDADE, span: 1,
    },

    // Filiação
    {
        nome: 'nome_mae', rotulo: 'Nome da mãe', tipo: 'text', secao: 'filiacao',
        obrigatorio: false, maxLength: 100, span: 2, placeholder: 'Nome completo da mãe',
    },
    {
        nome: 'nome_pai', rotulo: 'Nome do pai', tipo: 'text', secao: 'filiacao',
        obrigatorio: false, maxLength: 100, span: 2, placeholder: 'Nome completo do pai',
    },

    // Documentos
    {
        nome: 'ie_identidade', rotulo: 'RG / Identidade', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 30, span: 1, placeholder: 'Ex.: 12345678',
    },
    {
        nome: 'rg_orgao_emissor', rotulo: 'Órgão emissor / UF', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 30, span: 1, placeholder: 'Ex.: SSP/AL',
    },
    {
        nome: 'rg_data_emissao', rotulo: 'Data de emissão (RG)', tipo: 'date', secao: 'documentos',
        obrigatorio: false, span: 1,
    },
    {
        nome: 'ctps_numero', rotulo: 'Nº CTPS', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 20, span: 1, placeholder: 'Nº carteira de trabalho',
    },
    {
        nome: 'ctps_serie', rotulo: 'Série CTPS', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 20, span: 1, placeholder: 'Série',
    },
    {
        nome: 'ctps_data_emissao', rotulo: 'Expedição CTPS', tipo: 'date', secao: 'documentos',
        obrigatorio: false, span: 1,
    },
    {
        nome: 'titulo_numero', rotulo: 'Título de Eleitor', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 30, span: 1, placeholder: 'Número do título',
    },
    {
        nome: 'titulo_zona', rotulo: 'Zona', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 10, span: 1, placeholder: 'Ex.: 013',
    },
    {
        nome: 'titulo_secao', rotulo: 'Seção', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 10, span: 1, placeholder: 'Ex.: 0061',
    },
    {
        nome: 'pis_numero', rotulo: 'PIS / PASEP', tipo: 'text', secao: 'documentos',
        obrigatorio: false, maxLength: 30, span: 1, placeholder: '000.00000.00-0',
    },
    {
        nome: 'pis_data', rotulo: 'Data do PIS', tipo: 'date', secao: 'documentos',
        obrigatorio: false, span: 1,
    },

    // Endereço e Contato
    {
        nome: 'cep', rotulo: 'CEP', tipo: 'text', secao: 'endereco',
        obrigatorio: false, mascara: 'cep', span: 1, placeholder: '00000-000',
    },
    {
        nome: 'endereco', rotulo: 'Endereço', tipo: 'text', secao: 'endereco',
        obrigatorio: false, span: 2, placeholder: 'Rua / Avenida',
    },
    {
        nome: 'numero', rotulo: 'Número', tipo: 'text', secao: 'endereco',
        obrigatorio: false, span: 1, placeholder: '123',
    },
    {
        nome: 'complemento', rotulo: 'Complemento', tipo: 'text', secao: 'endereco',
        obrigatorio: false, span: 1, placeholder: 'Apto / Bloco',
    },
    {
        nome: 'bairro', rotulo: 'Bairro', tipo: 'text', secao: 'endereco',
        obrigatorio: false, span: 1, placeholder: 'Centro',
    },
    {
        nome: 'cidade_id', rotulo: 'Cidade', tipo: 'combobox', secao: 'endereco',
        obrigatorio: true, span: 2, placeholder: 'Digite o nome da cidade',
    },
    {
        nome: 'telefone', rotulo: 'Telefone', tipo: 'text', secao: 'endereco',
        obrigatorio: false, mascara: 'telefone', span: 1, placeholder: '(82) 99999-9999',
    },
    {
        nome: 'email', rotulo: 'E-mail', tipo: 'text', secao: 'endereco',
        obrigatorio: true, span: 2, placeholder: 'nome@empresa.com',
    },

    // Acesso ao Sistema
    {
        nome: 'criar_usuario', rotulo: 'Criar usuário do sistema', tipo: 'segmentado', secao: 'acesso',
        obrigatorio: true, opcoes: OPCOES_SN, span: 1,
    },
    {
        nome: 'senha', rotulo: 'Senha inicial', tipo: 'password', secao: 'acesso',
        obrigatorio: false, condicional: 'criar_usuario == S', span: 1, placeholder: 'Deixe em branco para usar o padrão do .env',
    },
    {
        nome: 'id_grupo', rotulo: 'Grupo de usuário', tipo: 'select', secao: 'acesso',
        obrigatorio: false, fonteTaxonomia: 'grupos', span: 1,
    },
    {
        nome: 'envia_email_os', rotulo: 'Envia e-mail de OS', tipo: 'segmentado', secao: 'acesso',
        obrigatorio: true, opcoes: OPCOES_SN, span: 1,
    },
    {
        nome: 'envia_sms_os', rotulo: 'Envia SMS de OS', tipo: 'segmentado', secao: 'acesso',
        obrigatorio: true, opcoes: OPCOES_SN, span: 1,
    },
    {
        nome: 'ferias_colaborador', rotulo: 'Férias colaborador', tipo: 'segmentado', secao: 'acesso',
        obrigatorio: true, opcoes: OPCOES_SN, span: 1,
    },
];

export const OBRIGATORIOS = CAMPOS.filter(c => c.obrigatorio).map(c => c.nome);

// Sim/Não obrigatórios sem uma escolha segura óbvia (diferente de
// `criar_usuario`, onde "Não" é o default operacional razoável — a maioria
// dos colaboradores novos não precisa de acesso ao sistema no primeiro dia).
// Pré-marcar esses 3 como 'N' fazia o operador NUNCA interagir com eles e
// ainda assim contar como "preenchido" (mesmo antipadrão do
// `OverrideModal.jsx`, Fase 9) — ficam vazios até o operador escolher de
// verdade; `Segmentado` já trata valor vazio como "nenhuma opção ativa".
const SEM_PADRAO_SN = ['envia_email_os', 'envia_sms_os', 'ferias_colaborador'];

export const VALOR_INICIAL = CAMPOS.reduce((acc, campo) => {
    acc[campo.nome] = campo.tipo === 'segmentado'
        ? (SEM_PADRAO_SN.includes(campo.nome) ? '' : 'N')
        : (campo.nome === 'nacionalidade' ? 'Brasileira' : '');
    return acc;
}, { criar_usuario: 'N', nacionalidade: 'Brasileira', possui_deficiencia: 'N' });

