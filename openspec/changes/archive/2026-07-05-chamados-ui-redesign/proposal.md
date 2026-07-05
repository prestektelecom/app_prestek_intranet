## Why

A página "Meus Chamados" (`TicketsList.jsx`) atualmente usa o tema base warm/âmbar do projeto (`#a17745`, `#eaddcd`, `#fcfaf8`, `bg-primary`), enquanto as páginas de referência — Dashboard, Serviços, Colaboradores, Cobertura, Escala, Escritórios e Processos — seguem um padrão visual "Bento Blue" hardcoded da Prestek (`#F5F9FF`, primary `#4A9EF5`/`#1F5BA8`, fonte Plus Jakarta Sans, hero gradiente azul). Esse desalinhamento cria uma quebra de identidade visual dentro da mesma navegação. O objetivo é alinhar a experiência visual de Meus Chamados ao mesmo estilo das páginas de referência, sem alterar a lógica de busca e exibição dos tickets.

## What Changes

- Migração da paleta da `TicketsList.jsx` de warm/âmbar para azul Prestek.
- Adição de um hero banner gradiente azul full-width com título, subtítulo e KPI pills.
- Refatoração visual do card da tabela para o padrão branco com borda `#E4ECF5` e sombra suave azul.
- Atualização dos botões de ação primários para o gradiente azul Prestek.
- Reestilização do header, linhas, IDs e badges de status da tabela para o tom azul.
- Reestilização dos estados de loading, erro e empty.
- Troca da fonte local para Plus Jakarta Sans no escopo da página.

## Capabilities

### New Capabilities
- `chamados-ui-redesign`: Define os requisitos visuais e de comportamento para alinhar Meus Chamados ao design system Bento Blue das páginas de referência.

### Modified Capabilities
- Nenhuma capability existente precisa ter seus requisitos funcionais alterados; o escopo é puramente visual.

## Impact

- **Frontend**: Alterações concentradas em `src/components/TicketsList.jsx`. Não haverá mudanças no backend ou no banco de dados.
- **UX**: A estrutura da tabela de chamados, estados de loading/erro/empty e busca automática ao montar serão preservadas; apenas o revestimento visual muda.
- **Manutenção**: As mudanças serão feitas localmente na página para não quebrar o tema warm usado em outras partes do sistema.
