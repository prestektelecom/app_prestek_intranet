## Why

A Fase 4 (Plantão) do programa Impeccable rodou uma crítica dual-agent (`.impeccable/critique/2026-09-12T00-49-08Z__src-components-schedule-jsx.md`, 23/40) e um audit técnico (9/20, Ruim) sobre `src/components/Schedule.jsx` e `src/components/schedule/`. Juntos, os dois relatórios encontraram 3 achados P0 e 2 P1:

- **P0** — trocar a data no fluxo "Novo Plantão" não revalida se já existe cobertura naquele dia: o aviso de substituição não aparece e o toast final mente "cadastrado com sucesso" quando na verdade substitui dados reais.
- **P0** — `ManagePlantaoModal` declara `aria-modal="true"` mas não tem trap de foco real: `Tab` escapa para os botões do Hero atrás do backdrop.
- **P0** — `PlantaoHistorico.jsx` (a página completa de auditoria de plantões) mistura um container `bg-white` fixo com texto na cor do tema escuro (`var(--foreground)`), resultando em contraste ~1:1 (texto quase invisível) em qualquer um dos 4 temas escuros.
- **P1** — 64 tamanhos de fonte fora da rampa do DESIGN.md, espalhados por 12 arquivos da superfície.
- **P1** — o estado "não atribuído" tem tratamento visual inconsistente entre N2 (fantasma discreto) e Supervisão (chip sólido, indistinguível de um nome real), numa tabela cujo propósito é detectar lacunas de cobertura.

Por decisão do Felix (2026-09-12), o escopo desta change é P0 + P1. Os achados P2/P3 (z-index do modal, semântica do diálogo de exclusão, hex remanescente em `HistoricoPreviewModal.jsx`/`SelectEmployee.jsx`, touch targets do mini-calendário, badge "selecionado(s)" na aba Histórico) ficam registrados no audit para uma rodada de polish futura.

## What Changes

- `openNewPlantao`/`ManagePlantaoModal` passam a revalidar a existência de um plantão sempre que a data muda em modo editável, atualizando o aviso de substituição e o `existingPlantao` correspondente.
- `ManagePlantaoModal` ganha um trap de foco real (mesmo padrão já usado no chrome e no `TiSupportModal`), mantendo o Escape existente.
- `PlantaoHistorico.jsx` troca os 3 usos de `bg-white`/hex fixo por tokens semânticos (`bg-surface`, `border-border`, etc.), consistente com o resto da superfície já migrada em `modernizar-visao-geral-escala`.
- Tamanhos de fonte fora da rampa do DESIGN.md são normalizados para os passos documentados (label 13px / overline 11px, etc.) nos 12 arquivos apontados pelo detector.
- O fallback de "não atribuído" da Supervisão passa a usar o mesmo tratamento fantasma (ícone `person_off`, itálico, opacidade reduzida) já usado pelo N2, em vez do chip sólido genérico.

## Capabilities

### Modified Capabilities

- `escala-criar-plantao-cta`: o requisito "Abertura do modal de criação com data padrão editável" é reforçado para exigir revalidação de sobreposição ao trocar a data, não só na abertura.
- `escala-ui-redesign`: adiciona um requisito de acessibilidade do modal de gestão (trap de foco) e estende "Dark Mode Consistente" para cobrir explicitamente a página de histórico/auditoria de plantões.

## Impact

- **`src/components/Schedule.jsx`**: `openNewPlantao`/`onDateChange` passam a revalidar `existingPlantao`.
- **`src/components/schedule/ManagePlantaoModal.jsx`**: trap de foco; leitura de `existingPlantao` atualizada reativamente.
- **`src/components/schedule/PlantaoHistorico.jsx`**: 3 ocorrências de `bg-white`/hex fixo trocadas por tokens.
- **12 arquivos de `src/components/schedule/`** (listados no audit): tamanhos de fonte normalizados.
- **`src/components/schedule/ScheduleRow.jsx` / `ScheduleMobileCard.jsx`**: fallback de Supervisão sem atribuição usa o tratamento fantasma do N2.
- Nenhuma alteração de API ou banco de dados.
