## Why

A crítica dual-agent isolada e o audit técnico da Fase 11 do programa Impeccable (`programa-impeccable/tasks.md`, seção 11) encontraram 3 problemas P0 e 4 P1 na tela de Escritórios (`src/components/Offices.jsx`) — a pior nota de crítica do programa até agora (18/40, Ruim):

- **P0**: o mapa ignora completamente o filtro (`Todos/AL/SE`) e a busca — um bug funcional real, não apenas estético. O efeito que sincroniza os marcadores do Leaflet itera sobre `offices` bruto em vez da lista já filtrada `filtrados`.
- **P0**: a tela inteira abaixo do hero nunca muda de tema — lista, legenda, chips de filtro, campo de busca, moldura do mapa e os dois modais (criar/editar e excluir) usam hex hardcoded do tema claro, mesmo com um tema escuro ativo.
- **P0**: as ações de editar/excluir por item da lista ficam `opacity-0`, só reveladas em `:hover` — inatingíveis em dispositivos de toque, e mesmo quando focadas por teclado permanecem INVISÍVEIS (a opacidade é do wrapper, não do botão). Nenhum dos dois modais tem `role="dialog"`/`aria-modal`/trap de Tab — confirmado que o Tab escapa do diálogo de exclusão para o botão invisível de outra linha, um risco real de o usuário ativar a exclusão do escritório errado.
- **P1**: os 10 campos do formulário de criar/editar não têm associação `label`/`input` (`htmlFor`/`id`).
- **P1**: `excluirEscritorio` usa `alert()` cru na falha — antipadrão banido desde a Fase 2, recorrendo num caminho de ação destrutiva.
- **P1**: alvos de toque abaixo de 44px nos chips de filtro e no campo de busca.
- **P1**: em viewport mobile (375px), a lista e o mapa ficam espremidos a ~27-55px de altura visível combinada, sem nenhuma rota de rolagem — a pior experiência mobile do programa até agora.

## What Changes

- **Corrige** o efeito de sincronização de marcadores para usar `filtrados` em vez de `offices`, e recalcula os bounds do mapa quando o filtro/busca muda.
- **Migra** todo o corpo da tela (lista, legenda, chips, busca, moldura do mapa, os dois modais) para o sistema de tokens de tema (`useBentoTheme()`), no mesmo padrão que `OfficesHero` já usa corretamente.
- **Revela** as ações de editar/excluir também em `focus-within` e adiciona uma via de toque; adiciona `role="dialog"`/`aria-modal`/foco inicial/trap de Tab aos dois modais (mesmo padrão `useDismissable`+`trapTab` já usado em `OrgChartEditor.jsx`/`ModalShell.jsx`).
- **Adiciona** `htmlFor`/`id` aos 10 campos do formulário; `aria-label` descritivo (com o nome do escritório) nos botões de editar/excluir.
- **Substitui** o `alert()` por um estado de erro inline, reaproveitando o padrão já existente no próprio arquivo (`erro`/`erroLink`).
- **Corrige** os alvos de toque dos chips de filtro e do campo de busca para 44px mínimo.
- **Reduz** a altura do hero em mobile e reequilibra a proporção lista/mapa para que ambos fiquem utilizáveis em 375px.

## Capabilities

### New Capabilities

- `escritorios-diretorio`: primeira spec formal da tela de Escritórios — cobre a sincronização mapa/filtro, a adaptação a todos os temas, a semântica de diálogo dos dois modais, a acessibilidade do formulário e os alvos de toque/layout mobile.

## Impact

- **Arquivo**: `src/components/Offices.jsx` (único arquivo da tela)
- **Sem impacto** em APIs, banco de dados ou dado real dos escritórios
- **Fora de escopo** (registrado em Pendências): divisor de redimensionamento sem `role="separator"`/teclado; chips sem `aria-pressed`; badge "Matriz" redundante ao lado do nome truncado; sem aviso ao sobrescrever lat/lng manual; popup do Leaflet com cores hardcoded (constrangimento técnico — fora da árvore React)
