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

export const FERRAMENTAS_TI = [
    {
        id: 'cadastro-colaborador',
        label: 'Cadastro de Colaborador',
        icon: 'person_add',           // material-symbols-outlined
        descricao: 'Ficha de registro em PDF vira payload do IXC, conferido antes de gravar.',
        somenteAdmin: true,
        Component: CadastroColaborador,
    },
];

export const FERRAMENTA_PADRAO = FERRAMENTAS_TI[0].id;

// Chave de persistência da ferramenta ativa. Segue o prefixo do projeto
// (@Stitch:currentView, @Stitch:user).
export const CHAVE_FERRAMENTA = '@Stitch:tiFerramenta';
