## Why

A tela "Visão Geral da Escala" (`src/components/Schedule.jsx`) recebeu a
migração para o accent laranja da marca (commit `a7762b3a`) mas nunca passou
pelo "polish pass" que telas mais recentes como Sectors e Coverage/Central de
Vendas já receberam. Hoje ela tem hero duplicada (inline, sem reusar
`heroGradiente.js`), container fora do padrão (`max-w-[1920px]` vs. o
`max-w-[1200px]` adotado como referência), cores em hex fixo que quebram em
temas não-claros, e skeleton/empty-state duplicados entre desktop e mobile.

Além disso, o spec existente `escala-ui-redesign` está desatualizado: ele
documenta a paleta azul "Bento Blue" (`#1F5BA8 → #4A9EF5`) de antes da
migração para laranja, e nunca foi revisado depois dela. Este change também
corrige esse spec para refletir o padrão visual atual do sistema (tokens
semânticos + hero compartilhada), em vez de uma paleta fixa específica.

## What Changes

- Trocar a hero inline de `Schedule.jsx` (componente `ScheduleHero`) pela
  hero compartilhada `src/components/ui/heroGradiente.js`, já usada por
  `SectorsHero.jsx` e `CoverageHero.jsx` e calibrada para contraste WCAG AA.
- Alinhar o container/spacing da página para `max-w-[1200px] px-4 md:px-10
  py-8 gap-8`, consistente com Sectors/Directory/Ti/Coverage.
- Substituir cores hex hardcoded (`#0B1B2E`, `#475467`, `#E4ECF5`,
  `#F7FAFD`, `#EC7D23`, `#C2410C`, `#FFF7ED` etc.) por tokens semânticos
  (`bg-surface`, `text-foreground`, `text-muted`, `border-border`,
  `var(--accent)`) em `Schedule.jsx`, `ScheduleRow.jsx`,
  `ScheduleMobileCard.jsx` e `CalendarDay.jsx`, restaurando suporte aos
  temas não-claros (cyber/aurora/amoled).
- Extrair `src/components/schedule/ScheduleStates.jsx` (novo arquivo),
  seguindo o padrão de `SectorsStates.jsx`:
  - `ScheduleSkeletonRow` / `ScheduleSkeletonCard`, que replicam o layout
    real da linha (colunas N1/N2/Supervisão) em vez de um retângulo
    genérico.
  - `ScheduleEmptyState` único, parametrizado por contexto (filtro sem
    resultado vs. mês sem plantões), removendo a duplicação atual (~40
    linhas repetidas) entre a versão desktop e mobile.
  - `ScheduleErrorState` com `role="alert"` e ação de retry, substituindo
    o banner vermelho solto atual.
- Atualizar o spec `escala-ui-redesign` para remover as referências à
  paleta fixa "Bento Blue" e documentar o padrão vigente (hero
  compartilhada, container 1200px, tokens semânticos, estados dedicados).

**Não é BREAKING**: nenhuma API, rota, ou contrato de dados muda. É
revestimento visual e componentes de estado internos.

## Capabilities

### New Capabilities
_Nenhuma._

### Modified Capabilities
- `escala-ui-redesign`: os requisitos de paleta/hero/cards passam de uma
  cor fixa azul ("Bento Blue") para o padrão vigente de tokens semânticos
  e hero compartilhada usado pelas demais telas do sistema; adiciona
  requisitos de estados dedicados (skeleton fiel ao layout, empty-state
  único, error-state com retry) que não existiam no spec original.

## Impact

- **Código afetado**: `src/components/Schedule.jsx`,
  `src/components/schedule/ScheduleRow.jsx`,
  `src/components/schedule/ScheduleMobileCard.jsx`,
  `src/components/schedule/CalendarDay.jsx` (modificados); novo arquivo
  `src/components/schedule/ScheduleStates.jsx`.
- **Dependências**: reusa `src/components/ui/heroGradiente.js` (já
  existente, sem alterações nele) e segue a API de
  `SectorsStates.jsx` como referência.
- **Fora de escopo (não-objetivo)**: repensar a hierarquia de informação
  da tela (ex.: calendário-primeiro em vez de tabela-primeiro) fica de
  fora deste change — é uma decisão de produto que precisa de validação
  com quem usa a tela no dia a dia (admin que monta escala vs. técnico
  que só confere o próprio turno), e pode virar uma proposta separada no
  futuro.
