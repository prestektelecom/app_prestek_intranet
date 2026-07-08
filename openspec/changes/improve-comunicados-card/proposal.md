## Why

O card de Comunicados no Dashboard renderiza os itens em um formato que desperdiça informação: a descrição é truncada em uma única linha com ellipsis, as tags não transmitem urgência visual e os itens não são clicáveis. O resultado é um widget que ocupa espaço sem entregar valor real ao usuário.

## What Changes

- **Preview de 2 linhas** na descrição de cada comunicado (substituindo `whiteSpace: nowrap` + ellipsis por `WebkitLineClamp: 2`)
- **Stripe lateral colorida** por tipo de comunicado (vermelho para Urgente, âmbar para Importante, verde para Geral) — comunica prioridade num relance sem depender de leitura da tag
- **Click no item** navega para a tela `announcements` (`setCurrentView('announcements')`)
- **Tag com cor real** — alinhamento visual das tags com a paleta já existente no `tagStyle()`, garantindo que o tipo "Importante" use `warningSoft/warning` e "Urgente" use `dangerSoft/danger`
- **Data de criação detalhada via tooltip** — exibição da data e hora completas de criação ao passar o mouse sobre o tempo relativo de cada comunicado, tanto no card do Dashboard quanto nos cards da página principal de Comunicados.

## Capabilities

### New Capabilities

- `comunicados-card-ux`: Melhorias de legibilidade e interatividade no card de Comunicados do Dashboard e na página detalhada.

### Modified Capabilities

_(nenhum spec existente é afetado — mudança puramente de UI interna ao componente)_

## Impact

- **Arquivo afetado**: `src/components/Dashboard.jsx` — função `ComunicadosCard` (linhas 208–281)
- **Sem impacto em API**: nenhuma alteração de backend ou contrato de dados
- **Sem impacto em outros componentes**: mudança isolada na função `ComunicadosCard`
