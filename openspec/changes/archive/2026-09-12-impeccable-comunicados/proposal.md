## Why

A Fase 5 (Comunicados) do programa Impeccable rodou uma crítica dual-agent (`.impeccable/critique/2026-09-12T19-11-53Z__src-components-comunicados-jsx.md`, 17/36) e um audit técnico (9/20, Ruim) sobre `src/components/Comunicados.jsx` e `src/components/admin/AdminComunicados.jsx`. Juntos, os dois relatórios encontraram 2 achados P0 e 2 P1:

- **P0** — nem `CrudModal` nem `DeleteModal` têm `role="dialog"`, `aria-modal`, gerenciamento de foco ou fechamento por Escape/clique fora. Ao abrir qualquer um dos dois, o foco permanece no botão que abriu o modal, e Tab percorre a página por trás do backdrop antes de alcançar os campos do próprio formulário. É mais grave que o achado equivalente da Fase 4 (`ManagePlantaoModal`, que ao menos movia o foco para dentro do modal).
- **P0** — `AdminComunicados.jsx` (painel admin) tem cards com `bg-white` fixo e título na cor `C.ink` do tema ativo — em qualquer tema escuro, o texto do título fica quase invisível (contraste medido próximo de 1:1). Mesmo padrão exato do P0 já corrigido na Fase 4 (`PlantaoHistorico.jsx`).
- **P1** — badges de tipo (`getTypeMeta`) e o contador do chip ativo (`ChipButton`) usam o tom base do token semântico como cor de texto, em vez de `Strong`/`Fill`/`onAccent`. Medido ao vivo: badge "IMPORTANTE" a 2,84:1, chip ativo (branco sobre laranja) a 2,79:1, chips inativos a 2,9:1 — todos abaixo do mínimo de 4,5:1. É uma recorrência não corrigida do mesmo bug já achado e corrigido no Dashboard (Fase 3).
- **P1** — o corpo dos comunicados renderiza texto bruto sem limite: em dado real de produção, 3 dos 4 comunicados têm parágrafos de 300-600 palavras com asteriscos de markdown nunca renderizados (`*ATENÇÃO*`) e emoji em excesso, sem truncamento. Em mobile (390px), um único card pode consumir a tela inteira.

Por decisão do Felix (2026-09-12), o escopo desta change é P0 + P1. Os achados P2/P3 (chips abaixo do touch target mínimo, tipografia fora da rampa, hierarquia de headings, ícones só com `title`, placeholder cortado no mobile, inconsistências de copy/formatação de data entre `Comunicados.jsx` e `AdminComunicados.jsx`) ficam registrados para uma rodada de polish futura.

## What Changes

- `CrudModal` e `DeleteModal` (`Comunicados.jsx`) ganham `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, gerenciamento de foco na abertura/fechamento e fechamento por Escape — mesmo padrão já usado em `TiSupportModal` (Fase 3) e `ManagePlantaoModal` (Fase 4): `useDismissable` + trap de Tab local.
- `AdminComunicados.jsx` troca o `bg-white` fixo do card por um token de superfície (`bg-surface` ou equivalente), consistente com o resto da superfície.
- `getTypeMeta` (badges) e `ChipButton` (contador do chip ativo) passam a usar os tokens `*Strong`/`Fill`/`onAccent` já existentes em `useBentoTheme.js`, em vez do tom base.
- O corpo de cada `ComunicadoCard` passa a truncar a descrição (`line-clamp`) com uma forma de expandir ("Ler mais"), e a remover asteriscos literais de markdown antes de exibir o texto.

## Capabilities

### Modified Capabilities

- `comunicados-crud-modal`: adiciona requisito de trap de foco e fechamento por teclado.
- `comunicados-delete-modal`: adiciona requisito de trap de foco e fechamento por teclado.
- `comunicados-card-feed`: adiciona requisitos de contraste do badge de tipo e de truncamento do corpo do comunicado.
- `comunicados-filter-chips`: adiciona requisito de contraste do contador do chip ativo.

### New Capabilities

- `admin-comunicados-panel`: primeiro requisito documentado para `AdminComunicados.jsx` — uso de tokens de tema em vez de cor fixa nos cards.

## Impact

- **`src/components/Comunicados.jsx`**: `CrudModal`, `DeleteModal`, `getTypeMeta`, `ChipButton`, `ComunicadoCard`.
- **`src/components/admin/AdminComunicados.jsx`**: card da lista de comunicados.
- Nenhuma alteração de API ou banco de dados.
