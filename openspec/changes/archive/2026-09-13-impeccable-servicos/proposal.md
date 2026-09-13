## Why

A crítica dual-agent isolada e o audit técnico da Fase 10 do programa Impeccable (`programa-impeccable/tasks.md`, seção 10) encontraram 2 problemas P0 e 3 P1 na tela de Serviços (`ServicesDirectory.jsx` e `src/components/services/**`):

- **P0**: `ui/gradient-card.jsx` — base de todo card de Plano/Serviço Técnico/Streaming — não tem `role="button"`, `tabIndex` nem `onKeyDown`. A ação primária da tela inteira (abrir o detalhe de um card) é inteiramente inacessível por teclado.
- **P0**: `services/modals/ModalShell.jsx` (usado pelos 3 modais de edição admin) e o diálogo de exclusão inline em `ServicesDirectory.jsx` não têm `role="dialog"`, `aria-modal`, Escape nem trap de foco — 3ª recorrência do antipadrão já corrigido nas Fases 5 (Comunicados) e 7 (Setores).
- **P1**: `RankingsSection.jsx`/`RankingPodium.jsx` usam cores hardcoded (incluindo um resquício `#D6E9FF` da paleta "Bento Blue" já abandonada) em vez do sistema de tokens de tema que o resto da tela já adota.
- **P1**: texto real com `text-muted`/`--foreground-muted` reprova contraste no tema claro (medido ao vivo: 2,85:1) em vários pontos da tela — 6ª+ recorrência do antipadrão já catalogado no programa.
- **P1**: alvos de toque abaixo de 44×44px em 4 pontos (botões de ordenação, toggle Velocidade/Dia do hero, ícones de editar/excluir dos 3 tipos de card, botão de fechar do `ModalShell`).

## What Changes

- **Adiciona** semântica de teclado ao `GradientCard`: `role="button"`, `tabIndex={0}` e `onKeyDown` (Enter/Espaço) para a ação primária do card, sem interferir nos botões aninhados (editar/comparar).
- **Adiciona** semântica de diálogo completa (`role="dialog"`, `aria-modal`, `aria-labelledby`, Escape, clique-fora, trap de Tab) ao `ModalShell.jsx` (3 modais admin) e ao diálogo de exclusão inline; completa o trap de Tab que faltava em `ServiceDetailModal.jsx`.
- **Corrige** contraste de texto secundário trocando `text-muted` por `text-faint` nos usos como texto real (rótulos, hints, legendas, subtítulos) nos arquivos de Serviços.
- **Corrige** alvos de toque abaixo de 44px nos 4 pontos identificados.
- **Corrige** as cores hardcoded do cabeçalho/legenda/tabs de `RankingsSection.jsx`/`RankingPodium.jsx` que ficam sobre o fundo da página (não dentro do pódio opaco) para o sistema de tokens de tema, removendo o resquício azul da paleta antiga; corrige a descrição desatualizada de `gamificacao-podio-vendas` (menciona confete já removido e brilho "azul/ciano" que não existe mais).

## Capabilities

### New Capabilities

- `servicos-acessibilidade`: garante que os cards de serviço abram por teclado, que os modais administrativos tenham semântica de diálogo completa, e que texto secundário e alvos de toque atendam aos mínimos de contraste/tamanho estabelecidos no programa.

### Modified Capabilities

- `gamificacao-podio-vendas`: corrige a descrição desatualizada (confete removido, paleta "azul/ciano" retirada) e formaliza que o cabeçalho/legenda/tabs usam o sistema de tokens de tema.

## Impact

- **Arquivos**: `src/components/ui/gradient-card.jsx`, `src/components/services/modals/ModalShell.jsx`, `src/components/ServicesDirectory.jsx`, `src/components/services/ServiceDetailModal.jsx`, `src/components/services/RankingsSection.jsx`, `src/components/services/RankingPodium.jsx`, `src/components/services/ServicesFilterBar.jsx`, `src/components/services/ServicesHero.jsx`, `src/components/services/PlanoBentoCard.jsx`, `src/components/services/TechBentoCard.jsx`, `src/components/services/StreamingBentoCard.jsx`, `src/components/services/PlanoComparador.jsx`, `src/components/services/PlansGrid.jsx`, `src/components/services/modals/PlanEditModal.jsx`
- **Sem impacto** em APIs, banco de dados ou dado do IXC
- **Fora de escopo** (registrado em Pendências): pausa por teclado/toque do carousel de Rankings (P2), fallback de Tech/Streaming renderizado com a mesma confiança visual do dado real durante o carregamento (P2), sort ausente em 2 das 5 abas (P3), comparador de planos desligado por flag (decisão de produto)
