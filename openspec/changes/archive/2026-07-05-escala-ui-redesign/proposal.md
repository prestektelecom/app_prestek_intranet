## Why

A página "Visão Geral da Escala" (`Schedule.jsx`) atualmente usa o tema base warm/âmbar do projeto (`#f8f7f5`, primary `#ff8c00`, fonte Manrope), enquanto as páginas de referência — Dashboard, Serviços, Colaboradores e Cobertura — seguem um padrão visual "Bento Blue" hardcoded da Prestek (`#F5F9FF`, primary `#4A9EF5`/`#1F5BA8`, fonte Plus Jakarta Sans, hero gradiente azul). Esse desalinhamento cria uma quebra de identidade visual dentro da mesma navegação, fazendo a Escala parecer uma aplicação separada. O objetivo é alinhar a experiência visual da Escala ao mesmo estilo das páginas de referência, sem alterar o fluxo funcional já consolidado.

## What Changes

- Migração da paleta da `Schedule.jsx` e seus componentes filhos de warm/âmbar para azul Prestek.
- Adição de um hero banner gradiente azul full-width com título, subtítulo e KPI pills.
- Refatoração visual dos cards (filtros, resumos, tabela) para o padrão branco com borda `#E4ECF5` e sombras suaves azuis.
- Atualização dos botões de ação primários para o gradiente azul Prestek.
- Reestilização da tabela de escala, mini calendário e badges para o tom azul.
- Troca da fonte local para Plus Jakarta Sans no escopo da página.
- Ajuste do dark mode para tons azul/ciano em vez de âmbar.

## Capabilities

### New Capabilities
- `escala-ui-redesign`: Define os requisitos visuais e de comportamento para alinhar a Visão Geral da Escala ao design system Bento Blue das páginas de referência.

### Modified Capabilities
- Nenhuma capability existente precisa ter seus requisitos funcionais alterados; o escopo é puramente visual.

## Impact

- **Frontend**: Alterações concentradas em `src/components/Schedule.jsx` e componentes filhos diretos (`CalendarDay`, `ScheduleRow`, modais relacionados). Não haverá mudanças no backend ou no banco de dados.
- **UX**: A estrutura de 2 colunas, filtros laterais, tabs e modais será preservada; apenas o revestimento visual muda.
- **Manutenção**: As mudanças serão feitas localmente na página para não quebrar o tema warm usado em outras partes do sistema.
