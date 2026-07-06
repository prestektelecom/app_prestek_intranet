## Why

A auditoria de responsividade do Prestek Intranet revelou que, apesar de ter Tailwind CSS configurado e navegação mobile implementada, grande parte das telas ainda usa estilos inline com valores fixos em pixels, tabelas sem versão mobile e interações dependentes de hover. Em telas pequenas e tablets, isso causa sobreposição de elementos, scroll horizontal forçado, ícones renderizados como texto e ações inacessíveis. Esta change estabelece uma base responsiva sólida e corrige as páginas de maior impacto antes que a dívida técnica se acumule ainda mais.

## What Changes

- Corrigir o carregamento da fonte de ícones (Material Symbols) para evitar que ícones apareçam como texto puro em produção.
- Criar componentes reutilizáveis responsivos: tabela adaptativa, breadcrumb, barra de filtros e drawer lateral.
- Refatorar o `Header` e a `Sidebar` para usar classes Tailwind com breakpoints, eliminando valores fixos em pixels críticos.
- Converter tabelas de alta densidade (Agenda, Tickets, Processos, Escritórios, Admin) para layout de cards em telas pequenas.
- Tornar a página de Cobertura fluida: filtros que quebram linha, mapa com largura adaptável e drawer mobile para a lista de cidades.
- Ajustar o Dashboard para que os widgets internos (especialmente KPIs e Bento cards) empilhem corretamente em telas estreitas.
- Substituir interações hover-only por estados visíveis também no toque (cards de Diretório e Serviços).
- Definir diretrizes de estilo para padronizar Tailwind em vez de inline styles em novas páginas.

## Capabilities

### New Capabilities
- `responsive-icon-font`: Garantir que a fonte Material Symbols seja carregada de forma confiável e exiba ícones corretamente em todas as telas.
- `responsive-table`: Componente de tabela que se adapta a viewports pequenos via scroll horizontal controlado ou transformação em cards.
- `responsive-page-shell`: Estrutura comum de página (header, filtros, conteúdo, ações) que se adapta a mobile, tablet e desktop.
- `responsive-filter-bar`: Barra de filtros que quebra linha, agrupa em dropdown ou colapsa em telas pequenas.
- `responsive-breadcrumb`: Navegação de breadcrumb que trunca, esconde níveis ou vira dropdown em telas estreitas.
- `responsive-drawer`: Drawer lateral reutilizável para substituir a sidebar fixa em telas mobile.
- `touch-friendly-actions`: Padrão para exibir ações em cards sem depender exclusivamente de hover.

### Modified Capabilities
- `dashboard-responsive-layout`: Expandir os requisitos para incluir o empilhamento interno de KPIs e Bento cards, não apenas o grid externo do `react-grid-layout`.
- `settings-responsive-layout`: Garantir que os grupos de configuração e formulários se adaptem a telas pequenas sem quebra de layout.
- `cobertura-ui-redesign`: Adicionar requisitos de fluidez para filtros, mapa e lista de cidades em mobile.
- `directory-filter-layout`: Incluir requisito de acessibilidade por toque nos cards de colaborador.
- `chamados-ui-redesign`: Especificar comportamento da tabela de tickets em telas pequenas.
- `processos-ui-redesign`: Especificar comportamento da tabela de processos em telas pequenas.
- `escala-ui-redesign`: Especificar comportamento da tabela de escala em telas pequenas.

## Impact

- **Frontend**: alterações em `src/components/Header.jsx`, `src/components/Sidebar.jsx`, `src/App.jsx` e páginas como `Dashboard.jsx`, `Cobertura.jsx`, `Directory.jsx`, `Schedule.jsx`, `TicketsList.jsx`, `Processos.jsx`, `Offices.jsx`, `AdminUsuarios.jsx`, `AdminComunicados.jsx`.
- **Estilos**: ajustes em `src/index.css` e possível adição de classes utilitárias no `tailwind.config.js`.
- **Dependências**: nenhuma nova dependência esperada; o projeto já usa Tailwind CSS e `react-grid-layout`.
- **UX**: melhoria significativa na usabilidade mobile e tablet, redução de scroll horizontal e correção de bugs visuais como ícones como texto e breadcrumbs sobrepostos.
- **Risco de regressão**: médio, por envolver componentes compartilhados (Header/Sidebar) e várias páginas; recomenda-se testar visualmente nos breakpoints `sm`, `md`, `lg` e `xl`.
