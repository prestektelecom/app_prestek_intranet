## Context

Os arquivos de componentes da Prestek Intranet usam breadcrumbs localizados logo no início da área principal de renderização. Eles ocupam espaço de cabeçalho e, nos componentes como `Coverage.jsx`, possuem caminhos estáticos ou links quebrados por falta da propriedade `setCurrentView` necessária no escopo do componente. A decisão de design remove-os completamente, limpando o topo de cada página.

## Goals / Non-Goals

**Goals:**
- Remover todo o JSX e estilos dos breadcrumbs de todos os componentes da intranet (`Sectors.jsx`, `Schedule.jsx`, `Offices.jsx`, `Coverage.jsx`, `Directory.jsx`, `Comunicados.jsx`).
- Garantir que as páginas renderizem corretamente sem o espaçamento ou elementos removidos.
- Limpar parâmetros e propriedades obsoletas que eram usadas unicamente para essa navegação nos breadcrumbs, se aplicável.

**Non-Goals:**
- Alterar o design ou estrutura interna das áreas principais de conteúdo de cada tela.
- Alterar o menu de navegação global (Sidebar principal ou Navbar da SPA).

## Decisions

### 1. Remoção Simples do Bloco JSX
Optamos por remover diretamente os blocos marcados com `{/* Breadcrumbs */}` ou semelhantes na raiz da renderização dos arquivos JSX. Como eles são independentes e posicionados logo na entrada do contêiner flex principal de cada componente, a estrutura flexbox se ajustará automaticamente movendo o conteúdo real da página para o topo.

### 2. Preservação de Cabeçalhos Reais
Nas telas onde o título da página ou botões de ação faziam parte do mesmo contêiner (como no `Schedule.jsx` onde o título "Visão Geral da Escala" fica junto ao Breadcrumb), apenas a linha específica de navegação `Início > Dashboard > Tela` será removida. Os títulos principais de cada módulo serão preservados intactos.

## Risks / Trade-offs

- **[Risco] Navegação quebrada para o Dashboard** → Alguns usuários podem estar habituados a clicar em "Dashboard" ou "Início" no breadcrumb para voltar.
  - *Mitigação:* A navegação lateral principal (Sidebar) ou superior da intranet já fornece botões diretos e permanentes para retornar ao Dashboard e alternar entre telas.
