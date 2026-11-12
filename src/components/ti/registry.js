// Registro de ferramentas do setor de TI.
//
// É a única peça que precisa mudar para a aba ganhar uma ferramenta nova:
// crie o componente, acrescente um objeto aqui, e ele aparece na bandeja.
// Nem Ti.jsx, nem App.jsx, nem os arquivos de navegação são tocados — o custo
// de registrar uma view (7 edições em 4 arquivos) foi pago uma vez só.
//
// Contrato do componente: recebe `{ user, onLog }` e renderiza o próprio
// conteúdo, sem <main> nem container — a casca é responsabilidade do Ti.jsx.

import CadastroColaborador from './CadastroColaborador';
import AuditoriaTv from './AuditoriaTv';

export const FERRAMENTAS_TI = [
    {
        id: 'cadastro-colaborador',
        label: 'Cadastro de Colaborador',
        icon: 'person_add',           // material-symbols-outlined
        descricao: 'Ficha de registro em PDF vira payload do IXC, conferido antes de gravar.',
        somenteAdmin: true,
        Component: CadastroColaborador,
    },
    {
        id: 'auditoria-tv',
        label: 'Auditoria de TV',
        icon: 'live_tv',
        descricao: 'Cruza assinaturas de TV, contratos e produtos cobrados para achar divergências. Somente leitura.',
        somenteAdmin: true,
        Component: AuditoriaTv,
    },
];

export const FERRAMENTA_PADRAO = FERRAMENTAS_TI[0].id;

// Chave de persistência da ferramenta ativa. Segue o prefixo do projeto
// (@Stitch:currentView, @Stitch:user).
export const CHAVE_FERRAMENTA = '@Stitch:tiFerramenta';
