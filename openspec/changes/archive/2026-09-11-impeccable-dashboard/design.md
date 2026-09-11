## Context

`Dashboard.jsx` define constantes de estilo compartilhadas no topo do arquivo (`LABEL_MONO`, `CARD_TITLE`, `CARD`, `ACTION_BTN`) e as concatena com overrides por string em cada uso. `ACTION_BTN` já inclui `border border-border bg-surface`; o botão "Gerenciar Meus Chamados" do `OsBento` concatena `${ACTION_BTN} text-white bg-primary ...` na mesma classe, e como `bg-surface`/`bg-primary` têm a mesma especificidade CSS, a ordem de declaração na folha gerada (não a ordem no atributo `class`) decide qual vence — hoje é sempre `bg-surface`. `TiSupportModal.jsx` é um modal bespoke com `position: fixed` e estilos inline, sem usar o `ModalShell` compartilhado (`services/modals/ModalShell.jsx`, documentado no DESIGN.md) nem o hook `useDismissable` que o chrome já usa desde a Fase 1. `ui/glowing-effect.tsx` é um componente de terceiro (estilo Aceternity) com uma variante colorida (cores fixas) e uma variante `white` (usa `--black`/branco); nenhuma das duas lê os tokens do tema. O DESIGN.md já define os tokens `-strong` (`--success-strong`, `--warning-strong`, `--danger-strong`) exatamente para o caso de texto sobre fundo `-soft`, mas `KpiCard`/`OsBento` usam os tokens `-bento` (pensados para preenchimento gráfico ≥ 3:1, não para texto ≥ 4,5:1).

## Goals / Non-Goals

**Goals:**
- Botão de ação do OS visível e com contraste AA nos cinco temas.
- `TiSupportModal` com o mesmo padrão de acessibilidade que o resto do chrome (diálogo anunciado, foco preso, Escape).
- O brilho de hover dos 9 cards do Dashboard na paleta da marca.
- Badges de estado com contraste AA.
- PRODUCT.md e a spec `dashboard-customization` consistentes com o que o código realmente entrega.

**Non-Goals:**
- Reativar o modo de edição do grid (decisão do Felix, 2026-09-11: documentar como removido, não reconstruir agora).
- Corrigir os P2/P3 registrados no audit (fora de escopo desta change, por decisão do Felix).
- Adaptar o Dashboard por papel do usuário (técnico vs. RH) — fica para uma fase futura, mencionada como pergunta provocativa na crítica.
- Migrar `TiSupportModal` inteiro para `ModalShell` como componente (o design abaixo replica o contrato de acessibilidade sem forçar a refatoração visual completa, para não ampliar o escopo).

## Decisions

1. **Resolver a colisão de classes com uma segunda constante, não com `tailwind-merge`.** Criar `ACTION_BTN_PRIMARY` sem `bg-surface`/`border-border`, usada só nos CTAs que precisam do preenchimento sólido do accent. Alternativa considerada: adicionar `tailwind-merge` como dependência para resolver conflitos de utilitário em runtime. Rejeitada: uma dependência nova para resolver um caso isolado é desproporcional; a duplicação de constante é mais simples de auditar e o padrão (`ACTION_BTN` para ações secundárias, `ACTION_BTN_PRIMARY` para a ação principal de um card) já existe implicitamente no resto do sistema (`DESIGN.md`, Buttons: primary sólido vs. secondary com borda).
2. **`TiSupportModal` ganha o contrato de acessibilidade do `useDismissable` sem virar `ModalShell`.** Aplicar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no container já existente, e usar o hook `useDismissable` (já usado pelo chrome) para Escape, clique fora e foco inicial/trap. Alternativa: reescrever o modal inteiro sobre `ModalShell`. Rejeitada nesta change por ampliar o escopo (o modal tem lógica de formulário e chamada ao IXC que não faz parte do achado de acessibilidade); registrar como candidato a `extract` na Fase 16 se mais modais bespoke aparecerem.
3. **`GlowingEffect`: variante nova `variant="brand"` em vez de editar a variante `default`.** Adiciona uma terceira opção ao componente que usa `var(--accent)`/`var(--accent-dark)`/`var(--accent-deep)` em vez dos hex fixos, e trocar as 9 chamadas do Dashboard para essa variante. Alternativa: apagar `GlowingEffect` dos cards e usar só a classe `bento-hover-border` (que já existe e é usada em outros lugares do produto). Escolhida a variante nova porque o `GlowingEffect` tem o rastreamento de proximidade do mouse (o brilho segue o cursor), um comportamento que `bento-hover-border` (CSS puro, sem JS) não replica; perder esse comportamento seria uma regressão de interação, não só de cor.
4. **Badges: trocar o token, não a classe inteira.** Onde o componente já lê `--success-bento`/`--warning-bento`/`--danger-bento` como cor de texto, trocar para `--success-strong`/`--warning-strong`/`--danger-strong`; manter o token `-bento` em qualquer uso gráfico (ícone, borda) que já passe no 3:1.
5. **Grid: remover a spec, atualizar o PRODUCT.md, sem tocar no código do grid.** `isDraggable`/`isResizable` continuam `false` (nenhuma mudança de comportamento); a mudança é só documental — a especificação para de descrever uma capacidade que não existe. Os endpoints de backend (`/api/user/dashboard-layout`) não são removidos: não fazem mal parados, e removê-los é risco desnecessário para o escopo desta change.

## Risks / Trade-offs

- [`ACTION_BTN_PRIMARY` pode divergir de `ACTION_BTN` ao longo do tempo, reintroduzindo duplicação] → comentário no código apontando um para o outro; revisar juntos se um mudar.
- [Nova variante do `GlowingEffect` aumenta a superfície do componente] → documentar a variante no próprio arquivo; se aparecer um terceiro uso de cor fora da marca em outro lugar do produto, considerar `extract` de um token único de "brilho de sinal" no DESIGN.md.
- [Remover a spec `dashboard-customization` apaga o registro de uma decisão de produto já tomada uma vez (implementar drag-and-drop) e depois abandonada em silêncio] → a mudança fica registrada no `CHANGELOG` do OpenSpec (change arquivada) e em `MEMORIA.md`, não é perdida, só deixa de ser tratada como contrato ativo.

## Migration Plan

1. `glowing-effect.tsx` (variante nova, sem quebrar quem já usa `default`/`white`).
2. `Dashboard.jsx` (`ACTION_BTN_PRIMARY`, troca de variante do `GlowingEffect` nos 9 usos, tokens `-strong` nos badges).
3. `TiSupportModal.jsx` (ARIA + `useDismissable`).
4. `PRODUCT.md` + `MEMORIA.md` (documentação da decisão do grid).
5. `npx vite build`; verificação no navegador nos cinco temas e dois viewports; re-audit e re-crítica.

Rollback: `git revert` do commit da change; nenhuma migração de dados.
