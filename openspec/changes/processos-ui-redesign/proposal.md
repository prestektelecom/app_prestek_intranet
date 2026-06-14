## Why

A página "Processos Operacionais" (`Processos.jsx`) atualmente usa o tema base warm/âmbar do projeto (`#f8f7f5`, primary `#ff8c00`, fonte Manrope), enquanto as páginas de referência — Dashboard, Serviços, Colaboradores, Cobertura, Escala e Escritórios — seguem um padrão visual "Bento Blue" hardcoded da Prestek (`#F5F9FF`, primary `#4A9EF5`/`#1F5BA8`, fonte Plus Jakarta Sans, hero gradiente azul). Esse desalinhamento cria uma quebra de identidade visual dentro da mesma navegação, fazendo Processos parecer uma aplicação separada. O objetivo é alinhar a experiência visual de Processos ao mesmo estilo das páginas de referência, sem alterar o fluxo funcional já consolidado.

## What Changes

- Migração da paleta da `Processos.jsx` de warm/âmbar para azul Prestek.
- Adição de um hero banner gradiente azul full-width com título, subtítulo e KPI pills.
- Refatoração visual dos cards (busca/filtros, resumos por categoria, tabela) para o padrão branco com borda `#E4ECF5` e sombras suaves azuis.
- Atualização dos botões de ação primários para o gradiente azul Prestek.
- Reestilização da tabela de processos, cards mobile, paginação e badges para o tom azul.
- Troca da fonte local para Plus Jakarta Sans no escopo da página.
- Reestilização do modal CRUD de processos com inputs e botões no padrão Bento Blue.

## Capabilities

### New Capabilities
- `processos-ui-redesign`: Define os requisitos visuais e de comportamento para alinhar Processos Operacionais ao design system Bento Blue das páginas de referência.

### Modified Capabilities
- Nenhuma capability existente precisa ter seus requisitos funcionais alterados; o escopo é puramente visual.

## Impact

- **Frontend**: Alterações concentradas em `src/components/Processos.jsx`. Não haverá mudanças no backend ou no banco de dados.
- **UX**: A estrutura de busca, filtros por categoria, tabela, cards mobile, paginação e modal CRUD será preservada; apenas o revestimento visual muda.
- **Manutenção**: As mudanças serão feitas localmente na página para não quebrar o tema warm usado em outras partes do sistema.
