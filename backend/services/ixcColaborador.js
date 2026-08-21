// Monta e valida o dry-run de cadastro de colaborador. Nenhuma função aqui
// grava nada no IXC — ver Decisão 2 em design.md. `montarPlano()` devolve os
// payloads prontos para revisão humana; a gravação real é a fase 2.
//
// BASE_FUNCIONARIO/BASE_USUARIO partem do payload de `create` documentado em
// docs/querys_ixc_prestek/ixc_api_recursos_endpoints.json, com duas classes de
// correção:
//
//   1. Defaults colombianos (Decisão 10): tipo_documento_identificacao_col e
//      cor_raca vinham com valores de uma instalação da Colômbia.
//   2. Rótulo em vez de código: a doc mistura, nos mesmos payloads, campos já
//      corrigidos à mão (`"ctps_seleciona": "N"`) com outros que ainda trazem o
//      rótulo humano do campo `default` sem convertê-lo pelo mapa `values`
//      (`"estado_civil": "Solteiro(a)"`, quando o código real é `"S"`;
//      `"status": "Ativo"` em usuários, quando o código é `"A"`). Enviar o
//      rótulo em vez do código grava lixo silenciosamente — é a mesma classe
//      de erro que a Decisão 10 já descreveu para cor_raca. Cada correção abaixo
//      cita o `values` da doc como evidência.

import { ixcUrl, ixcListar } from './ixc.js';
import { normalizarCPF } from './normalizadores.js';

export const OBRIGATORIOS_FUNCIONARIO = [
    'funcionario', 'filial_id', 'cidade', 'id_conta',
    'envia_email_os', 'envia_sms_os', 'ferias_colaborador',
];

// Os 5 flags financeiros + os 3 campos fixos (tipo_acesso/scheme/language) só
// entram aqui pela contagem — seus valores vêm de BASE_USUARIO, nunca do
// formulário, então nunca falham a checagem de obrigatório.
export const OBRIGATORIOS_USUARIO = [
    'id_grupo', 'nome', 'email', 'senha', 'tipo_acesso', 'scheme', 'language',
    'recebimentos_dia_atual', 'pagamentos_dia_atual', 'lancamentos_dia_atual',
    'desc_parc_atraso', 'filtra_colaborador_quadro_kanban',
];

const CAMPOS_FIXOS_USUARIO = new Set([
    'tipo_acesso', 'scheme', 'language',
    'recebimentos_dia_atual', 'pagamentos_dia_atual', 'lancamentos_dia_atual',
    'desc_parc_atraso', 'filtra_colaborador_quadro_kanban',
]);

export const BASE_FUNCIONARIO = {
    ativo: 'S',
    funcionario: '',
    filial_id: '',
    ctps_seleciona: 'N',
    cpf_seleciona: 'N',
    // Decisão 10: era 'Cédula de ciudadanía' (default colombiano). O conjunto
    // BR não tem um "documento de identificação" separado do CPF/RG — vazio.
    tipo_documento_identificacao_col: '',
    pis_seleciona: 'N',
    rg_seleciona: 'N',
    cnh_seleciona: 'N',
    titulo_eleitoral_seleciona: 'N',
    mostrar_no_quadro_kanban: 'S',
    exibir_colaborador_inmap: 'S',
    // values: "S = Externo N = Inmap Service" — a doc trazia o rótulo "Externo"
    // sem convertê-lo; o código é 'S'.
    rastreador_tipo: 'S',
    obrigar_marcar_quilometragem: 'N',
    cidade: '',
    // Achado 3 (design.md): funcionarios.uf não acompanha cidade.uf em 475 de
    // 478 registros reais — é preenchido com '1' independente da cidade.
    // Decisão do usuário: espelhar o ERP em vez de "corrigir" um campo que
    // ninguém mantém.
    uf: '1',
    // values: "S = Solteiro(a) C = Casado(a) UE = União Estável D = Divorciado(a)
    // V = Viúvo(a) SE = Separado(a)" — a doc trazia o rótulo "Solteiro(a)".
    estado_civil: 'S',
    // Decisão 10: era 'Palenquero' (default colombiano). Sem um default BR
    // óbvio, fica vazio — o operador escolhe.
    cor_raca: '',
    camiseta: 'M',
    possui_deficiencia: 'N',
    tipo_deficiencia: 'F',
    grau_escolaridade: 'EF',
    estagio_escolaridade: 'C',
    periodo_escolaridade: 'M',
    cod_integracao_folha: 'NULL',
    tipo_chave_pix: 'cpf_cnpj',
    tipo_recebimento: 'C',
    camara_centralizadora: '018',
    id_conta: '',
    regra_centro_rateio: 'Centro de custo',
    envia_email_os: 'S',
    envia_sms_os: 'N',
    integracao_calendario: 'N',
    // Achado 4 (design.md): a doc sugere 'S', mas 478 de 478 colaboradores reais
    // têm 'N' — a doc está errada, não o ERP.
    ferias_colaborador: 'N',

    // ── Documentos, Filiação e Identificação Expandida ──────────────────
    nacionalidade: 'Brasileira',
    ie_identidade: '',
    rg_orgao_emissor: '',
    rg_data_emissao: '0000-00-00',
    ctps_numero: '',
    ctps_serie: '',
    ctps_data_emissao: '0000-00-00',
    titulo_numero: '',
    titulo_zona: '',
    titulo_secao: '',
    pis_numero: '',
    pis_data: '0000-00-00',
    nome_mae: '',
    nome_pai: '',
    obs: '',
};

export const BASE_USUARIO = {
    id_grupo: '',
    tipo_alcada: 'ADM',
    nome: '',
    email: '',
    senha: '',
    // values: "A = Ativo I = Inativo" — a doc trazia o rótulo "Ativo".
    status: 'A',
    // values: "A = Ambos W = Web M = Mobile" — confirmado por medição real
    // (Achado 4: tipo_acesso = "A" num usuário ativo real).
    tipo_acesso: 'A',
    // values: "d = Padrão vg = Moderno" — confirmado por medição (Achado 4).
    template: 'vg',
    // values: "light = Modo claro dark = Modo escuro" — confirmado por medição.
    scheme: 'light',
    acesso_webservice: 'S',
    user_callcenter: 'S',
    callcenter: '---',
    alter_passwd_date: 'NULL',
    language: 'Pt-Br',
    recebimentos_dia_atual: 'N',
    pagamentos_dia_atual: 'N',
    lancamentos_dia_atual: 'S',
    filtrar_plano_venda_filial_contrato: 'N',
    permitir_alterar_versao_chaves: 'N',
    // values: "S = Sim N = Não P = Padrão" — a doc trazia o rótulo "Padrão".
    desc_parc_atraso: 'P',
    permite_alterar_comunicacao_fn_apagar: 'N',
    filtra_departamento_ticket: 'N',
    filtra_funcionario_ticket: 'N',
    mostrar_ticket_sem_funcionario: 'S',
    filtra_setor: 'N',
    filtra_funcionario: 'N',
    mostrar_os_sem_funcionario: 'S',
    inmap_filtra_vendedor: 'S',
    filtra_colaborador_quadro_kanban: 'S',
    crm_filtra_vendedor: 'S',
    administrador_kanban: 'N',
    enviar_monitoramento_host: 'S',
    enviar_notificacao_backup: 'S',
    permite_inutilizar_patrimonio: 'N',
    permite_ver_diferenca: 'S',
};

const MAX_LENGTH = {
    funcionario: 100, endereco: 200, numero: 20, complemento: 100,
    bairro: 100, cep: 20, telefone: 20, email: 120, cpf_cnpj: 30,
    nacionalidade: 50, ie_identidade: 30, rg_orgao_emissor: 30,
    ctps_numero: 20, ctps_serie: 20, titulo_numero: 30,
    titulo_zona: 10, titulo_secao: 10, pis_numero: 30,
    nome_mae: 100, nome_pai: 100,
};

const OBRIGATORIO_FUNCIONARIO_MSG = {
    funcionario: 'Nome completo é obrigatório.',
    filial_id: 'Filial é obrigatória.',
    cidade: 'Cidade é obrigatória.',
    id_conta: 'Conta contábil é obrigatória.',
    envia_email_os: 'Envia e-mail de OS é obrigatório.',
    envia_sms_os: 'Envia SMS de OS é obrigatório.',
    ferias_colaborador: 'Férias colaborador é obrigatório.',
};

const OBRIGATORIO_USUARIO_MSG = {
    id_grupo: 'Grupo de usuário é obrigatório para criar o usuário.',
    nome: 'Nome do usuário é obrigatório para criar o usuário.',
    email: 'E-mail é obrigatório para criar o usuário.',
    senha: 'Senha é obrigatória para criar o usuário.',
};

function existeNaLista(lista, id) {
    return (lista || []).some(item => String(item.id) === String(id));
}

/**
 * @param {Object} dados  Estado do formulário (nomes de campos.js), mais
 *   `cidade` (FK numérica já resolvida — o front resolve via CidadeCombobox;
 *   `cidade_id` no formulário é só o texto exibido, nunca o FK).
 * @param {Object} taxonomias  `{ filiais, departamentos, funcoes, grupos, contas }`
 * @param {Object} opcoes  `{ senhaResolvida }`
 * @returns {{erros: Array<{campo, mensagem}>, avisos: Array<{campo, mensagem}>}}
 */
export function validar(dados, taxonomias, { senhaResolvida = false } = {}) {
    const erros = [];
    const avisos = [];
    const criarUsuario = dados.criar_usuario === 'S';

    // ── Obrigatórios do funcionário ──────────────────────────────────────
    for (const campo of OBRIGATORIOS_FUNCIONARIO) {
        if (!String(dados[campo] ?? '').trim()) {
            erros.push({
                campo: campo === 'cidade' ? 'cidade_id' : campo,
                mensagem: OBRIGATORIO_FUNCIONARIO_MSG[campo] || `${campo} é obrigatório.`,
            });
        }
    }

    // ── Obrigatórios do usuário (só se "criar usuário" estiver ligado) ───
    if (criarUsuario) {
        const dadosUsuario = { ...dados, nome: dados.funcionario };
        for (const campo of OBRIGATORIOS_USUARIO) {
            if (CAMPOS_FIXOS_USUARIO.has(campo)) continue; // vem de BASE_USUARIO, nunca falha
            if (campo === 'senha') continue; // checagem dedicada abaixo, com mensagem mais específica
            if (!String(dadosUsuario[campo] ?? '').trim()) {
                erros.push({ campo, mensagem: OBRIGATORIO_USUARIO_MSG[campo] || `${campo} é obrigatório para criar o usuário.` });
            }
        }
    }

    // ── FKs contra a taxonomia carregada do IXC ──────────────────────────
    // id_conta nunca é preenchido automaticamente (é conta contábil da folha),
    // mas quando vem preenchido precisa existir na lista real.
    if (dados.filial_id && !existeNaLista(taxonomias.filiais, dados.filial_id)) {
        erros.push({ campo: 'filial_id', mensagem: 'Filial não encontrada na lista carregada do IXC.' });
    }
    if (dados.id_departamento && !existeNaLista(taxonomias.departamentos, dados.id_departamento)) {
        erros.push({ campo: 'id_departamento', mensagem: 'Departamento não encontrado na lista carregada do IXC.' });
    }
    if (dados.id_conta && !existeNaLista(taxonomias.contas, dados.id_conta)) {
        erros.push({ campo: 'id_conta', mensagem: 'Conta contábil não encontrada na lista carregada do IXC.' });
    }
    // Função e grupo são listas DERIVADAS (fl_funcoes/usuarios_grupo indisponíveis
    // no IXC) — um valor real pode simplesmente não estar em uso hoje. Aviso, não erro.
    if (dados.id_funcao && !existeNaLista(taxonomias.funcoes, dados.id_funcao)) {
        avisos.push({ campo: 'id_funcao', mensagem: 'Função não está entre as inferidas do uso atual — pode ainda ser válida no IXC.' });
    }
    if (criarUsuario && dados.id_grupo && !existeNaLista(taxonomias.grupos, dados.id_grupo)) {
        avisos.push({ campo: 'id_grupo', mensagem: 'Grupo não está entre os inferidos do uso atual — pode ainda ser válido no IXC.' });
    }

    // ── Enums do conjunto BR ──────────────────────────────────────────────
    const enumValido = (valor, set) => !valor || set.includes(valor);
    if (!enumValido(dados.estado_civil, ['S', 'C', 'UE', 'D', 'V', 'SE'])) {
        erros.push({ campo: 'estado_civil', mensagem: 'Estado civil fora do conjunto aceito (S/C/UE/D/V/SE).' });
    }
    if (!enumValido(dados.cor_raca, ['A', 'B', 'I', 'P', 'N', 'O'])) {
        erros.push({ campo: 'cor_raca', mensagem: 'Cor/raça fora do conjunto brasileiro (A/B/I/P/N/O) — a doc do IXC mistura códigos colombianos.' });
    }
    if (!enumValido(dados.grau_escolaridade, ['EF', 'EM', 'ES', 'PG', 'M', 'D'])) {
        erros.push({ campo: 'grau_escolaridade', mensagem: 'Escolaridade fora do conjunto brasileiro (EF/EM/ES/PG/M/D).' });
    }

    // ── CPF ───────────────────────────────────────────────────────────────
    if (dados.cpf_cnpj) {
        const { valido } = normalizarCPF(dados.cpf_cnpj);
        if (!valido) erros.push({ campo: 'cpf_cnpj', mensagem: 'CPF com dígito verificador inválido.' });
    }

    // ── Datas em yyyy-mm-dd (server.js:1019 confirma o formato aceito) ──
    const checarData = (campo, valor) => {
        if (valor && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            erros.push({ campo, mensagem: 'Data deve estar em yyyy-mm-dd.' });
        }
    };
    checarData('data_nascimento', dados.data_nascimento);
    checarData('rg_data_emissao', dados.rg_data_emissao);
    checarData('ctps_data_emissao', dados.ctps_data_emissao);
    checarData('pis_data', dados.pis_data);

    // ── max_length vira aviso TRUNCADO, não erro ─────────────────────────
    for (const [campo, max] of Object.entries(MAX_LENGTH)) {
        const valor = String(dados[campo] || '');
        if (valor.length > max) {
            avisos.push({ campo, mensagem: `TRUNCADO: ${valor.length} caracteres, o IXC aceita no máximo ${max}.` });
        }
    }

    // ── E-mail / senha só pesam se for criar usuário ─────────────────────
    const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
    if (criarUsuario) {
        if (!emailValido(dados.email)) {
            erros.push({ campo: 'email', mensagem: 'E-mail é obrigatório e precisa ser válido para criar o usuário.' });
        }
        if (!senhaResolvida) {
            erros.push({ campo: 'senha', mensagem: 'Nenhuma senha padrão configurada (IXC_SENHA_PADRAO_COLABORADOR) e nenhuma senha informada.' });
        }
    } else if (dados.email && !emailValido(dados.email)) {
        avisos.push({ campo: 'email', mensagem: 'E-mail informado não parece válido.' });
    }

    return { erros, avisos };
}

/**
 * Monta o plano de gravação — 3 passos (ou 1, se "criar usuário" estiver
 * desligado). Nada aqui é enviado ao IXC; é o que SERIA enviado.
 *
 * @param {Object} dados
 * @param {Object} opcoes  `{ senhaHash }` — hex SHA-256, nunca a senha em texto puro.
 */
export function montarPlano(dados, { senhaHash = '' } = {}) {
    const criarUsuario = dados.criar_usuario === 'S';

    // Compõe campo de observações livres preservando notas de Cargo e CBO da ficha
    const partesObs = [];
    if (dados.obs) partesObs.push(String(dados.obs).trim());
    const cargoFicha = String(dados._cargo_texto || '').trim();
    const cboFicha = String(dados._cbo_texto || '').trim();
    if (cargoFicha || cboFicha) {
        const notaFicha = [
            cargoFicha ? `Cargo (ficha): ${cargoFicha}` : '',
            cboFicha ? `CBO: ${cboFicha}` : '',
        ].filter(Boolean).join(' · ');
        if (notaFicha && !partesObs.includes(notaFicha)) {
            partesObs.push(notaFicha);
        }
    }

    const payloadFuncionario = {
        ...BASE_FUNCIONARIO,
        funcionario: dados.funcionario || '',
        filial_id: dados.filial_id || '',
        id_funcao: dados.id_funcao || '',
        id_departamento: dados.id_departamento || '',
        cpf_cnpj: dados.cpf_cnpj || '',
        cpf_seleciona: dados.cpf_cnpj ? 'S' : 'N',
        data_nascimento: dados.data_nascimento || '',
        estado_civil: dados.estado_civil || BASE_FUNCIONARIO.estado_civil,
        cor_raca: dados.cor_raca || BASE_FUNCIONARIO.cor_raca,
        grau_escolaridade: dados.grau_escolaridade || BASE_FUNCIONARIO.grau_escolaridade,
        nacionalidade: dados.nacionalidade || BASE_FUNCIONARIO.nacionalidade,
        possui_deficiencia: dados.possui_deficiencia || BASE_FUNCIONARIO.possui_deficiencia,
        tipo_deficiencia: dados.tipo_deficiencia || BASE_FUNCIONARIO.tipo_deficiencia,

        // Documentos
        ie_identidade: dados.ie_identidade || '',
        rg_orgao_emissor: dados.rg_orgao_emissor || '',
        rg_data_emissao: dados.rg_data_emissao || BASE_FUNCIONARIO.rg_data_emissao,
        rg_seleciona: dados.ie_identidade ? 'S' : 'N',

        ctps_numero: dados.ctps_numero || '',
        ctps_serie: dados.ctps_serie || '',
        ctps_data_emissao: dados.ctps_data_emissao || BASE_FUNCIONARIO.ctps_data_emissao,
        ctps_seleciona: dados.ctps_numero ? 'S' : 'N',

        titulo_numero: dados.titulo_numero || '',
        titulo_zona: dados.titulo_zona || '',
        titulo_secao: dados.titulo_secao || '',
        titulo_eleitoral_seleciona: dados.titulo_numero ? 'S' : 'N',

        pis_numero: dados.pis_numero || '',
        pis_data: dados.pis_data || BASE_FUNCIONARIO.pis_data,
        pis_seleciona: dados.pis_numero ? 'S' : 'N',

        // Filiação
        nome_mae: dados.nome_mae || '',
        nome_pai: dados.nome_pai || '',

        // Endereço & Contato
        cep: dados.cep || '',
        endereco: dados.endereco || '',
        numero: dados.numero || '',
        complemento: dados.complemento || '',
        bairro: dados.bairro || '',
        cidade: dados.cidade || '',
        fone_celular: dados.telefone || '',
        email: dados.email || '',
        id_conta: dados.id_conta || '',
        envia_email_os: dados.envia_email_os || BASE_FUNCIONARIO.envia_email_os,
        envia_sms_os: dados.envia_sms_os || BASE_FUNCIONARIO.envia_sms_os,
        ferias_colaborador: dados.ferias_colaborador || BASE_FUNCIONARIO.ferias_colaborador,

        // Observações (contém notas de Cargo/CBO da ficha)
        obs: partesObs.join('\n'),
    };

    const passos = [
        {
            passo: 1,
            titulo: 'Criar funcionário',
            metodo: 'POST',
            url: ixcUrl('funcionarios'),
            headers: { ixcsoft: 'incluir' },
            payload: payloadFuncionario,
            retornoEsperado: "{ type: 'success', id } — forma comprovada só para su_oss_chamado (ver Decisão 2)",
        },
    ];

    if (criarUsuario) {
        const payloadUsuario = {
            ...BASE_USUARIO,
            id_grupo: dados.id_grupo || '',
            nome: dados.funcionario || '',
            email: dados.email || '',
            // usuarios.senha É o SHA-256 hex, não a senha em texto puro — é o
            // mesmo formato que server.js valida no login (usuario.senha === hash).
            senha: senhaHash,
            funcionario: '{{id do passo 1}}',
        };
        passos.push({
            passo: 2,
            titulo: 'Criar usuário do sistema',
            metodo: 'POST',
            url: ixcUrl('usuarios'),
            headers: { ixcsoft: 'incluir' },
            payload: payloadUsuario,
            retornoEsperado: "{ type: 'success', id }",
        });
        passos.push({
            passo: 3,
            titulo: 'Vincular usuário ao funcionário',
            metodo: 'GET (reler) + PUT (sobrescrever)',
            url: `${ixcUrl('funcionarios')}/{{id do passo 1}}`,
            payload: { '...registro_relido_do_passo_1': '(todos os campos)', usuario_id: '{{id do passo 2}}' },
            observacao: 'O IXC sobrescreve o registro inteiro num PUT — por isso o passo relê antes de escrever (server.js:1003-1024).',
            retornoEsperado: "{ type: 'success' }",
        });
    }

    return { passos };
}

// ─── Checagem de duplicidade ──────────────────────────────────────────────
// Achado 4 (design.md): cpf_cnpj é armazenado COM máscara no IXC — tenta
// mascarado primeiro, e só cai para dígitos puros se a busca mascarada vier vazia.
function projetarFuncionario(f) {
    return { id: String(f.id), nome: f.funcionario || '' };
}
function projetarUsuario(u) {
    return { id: String(u.id), nome: u.nome || '' };
}

export async function buscarDuplicados({ cpf, email }) {
    const resultado = { porCpf: [], porEmailFuncionario: [], porEmailUsuario: [] };

    const cpfLimpo = String(cpf || '').trim();
    if (cpfLimpo) {
        const { valor: mascarado } = normalizarCPF(cpfLimpo);
        let registros = await ixcListar('funcionarios', {
            qtype: 'funcionarios.cpf_cnpj', query: mascarado, oper: '=',
        }).catch(() => []);
        if (!registros.length && mascarado !== cpfLimpo) {
            registros = await ixcListar('funcionarios', {
                qtype: 'funcionarios.cpf_cnpj', query: cpfLimpo, oper: '=',
            }).catch(() => []);
        }
        resultado.porCpf = registros.map(projetarFuncionario);
    }

    const emailLimpo = String(email || '').trim();
    if (emailLimpo) {
        const [porFunc, porUsu] = await Promise.all([
            ixcListar('funcionarios', { qtype: 'funcionarios.email', query: emailLimpo, oper: '=' }).catch(() => []),
            ixcListar('usuarios', { qtype: 'usuarios.email', query: emailLimpo, oper: '=' }).catch(() => []),
        ]);
        resultado.porEmailFuncionario = porFunc.map(projetarFuncionario);
        resultado.porEmailUsuario = porUsu.map(projetarUsuario);
    }

    return resultado;
}
