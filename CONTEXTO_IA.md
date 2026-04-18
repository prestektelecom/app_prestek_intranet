# Contexto do Projeto - Prestek Intranet

Este arquivo serve como um "mapa mental" arquitetural e contextual para que qualquer assistente virtual (IA) ou desenvolvedor consiga compreender instantaneamente a estrutura, tecnologias e escolhas de design da aplicação. 

Ao ajudar neste projeto, por favor, analise este arquivo primeiro.

## 1. Visão Geral
- **Nome do Projeto:** Prestek Intranet
- **Objetivo:** Portal corporativo interno (intranet) da empresa Prestek, projetado para comunicação de comunicados urgentes, listagem de ramais e serviços, controle de chamados de TI e agendamento de plantões.
- **Autor/Responsável:** Equipe de Tecnologia / Prestek Telecom

## 2. Stack Tecnológica (Frontend)
- **Framework:** React 18
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS (versão moderna, utilizando classes utilitárias).
- **Roteamento:** Condicional com React State (`currentView`, controlando qual painel mostrar), sem react-router-dom de forma nativa aparente.
- **Animações / Ícones:** Lottie React e Material Symbols (Google Fonts).

## 3. Padrões de Layout e Responsividade (Mobile-First)
A aplicação foi desenvolvida focada no approach *Mobile-first*. 
- O layout central se baseia em `<div className="flex flex-col min-h-screen relative font-display text-white w-full max-w-[100vw] overflow-x-hidden">` (`App.jsx`).
- **Sidebar:** Fica escondida em móveis (`hidden lg:flex`) e atua fixada na esquerda em grandes telas computacionais.
- **Header:** Em telas móveis, engloba o Menu Hambúrguer contendo a navegação, substituindo a Sidebar.
- **Grids e Containers:** Constante degradação de layouts (ex: `grid-cols-1 md:grid-cols-3` em painéis) e as Tabelas de Dados SEMPRE utilizam `overflow-x-auto` para evitar quebra do layout principal em celular.
- **Cores & Dark Mode:** A implementação conta com suporte a temas dinâmicos (por exemplo `bg-white dark:bg-[#1a130b]`), alternando entre tons creme/marrom avermelhado/preto.

## 4. Estrutura de Componentes Críticos (`/src/components`)
- `App.jsx`: Componente raiz. Carrega contexto de login, o Header, a Sidebar e despacha a View (tela) selecionada no momento.
- `Header.jsx`: Controla notificações dinâmicas urgentes, menu *mobile* drop-down e barra de buscas.
- `Sidebar.jsx`: Menu lateral estático para *Desktop*.
- `Dashboard.jsx`: Página de inicio contendo as saudações iniciais, cards base (setor, contagem de chamados, etc). 
- `Configuracoes.jsx`: Área de configuração do perfil e tema.
- `AdminDashboard.jsx`, `ServicesDirectory.jsx`, `Processos.jsx`, `TicketsList.jsx`: Telas diversas (listagens, cadastros pontuais e leitura da API de backend).

## 5. Backend e Integrações de API
No frontend, o código frequentemente realiza chamadas de API (AJAX `fetch`) para:
- `/api/comunicados`
- `/api/colaboradores/online`
- `/api/plantoes/...`
- `/api/ixc/su-ticket/list` (Gerenciador de chamados atrelado possivelmente a um IXC provedor).

A autenticação guarda tokens no `localStorage` e `sessionStorage` na chave `@Stitch:user` e `@Stitch:currentView`.

A documentação atual deve ser levada em conta para não causar quebras na experiência responsiva e em estados geridos.
