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
        nome: 'estado_civil', rotulo: 'Estado civil', tipo: 'select', secao: 'identificacao',
        obrigatorio: false, opcoes: ESTADO_CIVIL, span: 1,
    },
    {
        nome: 'cor_raca', rotulo: 'Cor / Raça', tipo: 'select', secao: 'identificacao',
        obrigatorio: false, opcoes: COR_RACA, span: 1,
    },
    {
        nome: 'grau_escolaridade', rotulo: 'Escolaridade', tipo: 'select', secao: 'identificacao',
        obrigatorio: false, opcoes: GRAU_ESCOLARIDADE, span: 1,
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

export const VALOR_INICIAL = CAMPOS.reduce((acc, campo) => {
    acc[campo.nome] = campo.tipo === 'segmentado' ? 'N' : '';
    return acc;
}, { criar_usuario: 'N' });
