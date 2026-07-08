## ADDED Requirements

### Requirement: Preview de descrição em 2 linhas
O card de Comunicados no Dashboard DEVE exibir a descrição de cada item com no máximo 2 linhas de texto, com ellipsis na terceira linha caso o conteúdo seja maior.

#### Scenario: Descrição longa
- **WHEN** um comunicado tem descrição com mais de 1 linha de texto
- **THEN** o card exibe até 2 linhas da descrição com `…` ao final, sem quebrar o layout

#### Scenario: Descrição curta
- **WHEN** um comunicado tem descrição que cabe em 1 linha
- **THEN** o card exibe a descrição completa sem ellipsis

### Requirement: Indicador visual de prioridade por tipo
Cada item do card DEVE exibir uma borda vertical colorida à esquerda (stripe), cuja cor reflete o tipo do comunicado: vermelho para Urgente, âmbar para Importante, verde para Geral.

#### Scenario: Tipo Urgente
- **WHEN** um comunicado tem `tipo === "Urgente"`
- **THEN** o item exibe stripe vermelha (`C.danger`) e tag com fundo `C.dangerSoft`

#### Scenario: Tipo Importante
- **WHEN** um comunicado tem `tipo === "Importante"`
- **THEN** o item exibe stripe âmbar (`C.warning`) e tag com fundo `C.warningSoft`

#### Scenario: Tipo Geral ou desconhecido
- **WHEN** um comunicado tem `tipo === "Geral"` ou tipo não mapeado
- **THEN** o item exibe stripe verde (`C.success`) e tag com fundo `C.successSoft` ou fallback neutro

### Requirement: Navegação ao clicar no item
Cada item do card DEVE ser clicável e, ao clicar, navegar para a view de Comunicados completa.

#### Scenario: Click em qualquer item
- **WHEN** o usuário clica em qualquer item da lista do ComunicadosCard
- **THEN** a view atual muda para `"announcements"` via `setCurrentView('announcements')`

### Requirement: Data de criação detalhada via tooltip
O sistema DEVE exibir a data e hora de criação completas formatadas em formato pt-BR no tooltip (`title`) do elemento de tempo relativo.

#### Scenario: Passar o mouse no tempo de criação
- **WHEN** o usuário passa o mouse sobre o elemento de tempo relativo de um comunicado (seja no card do Dashboard ou na página detalhada)
- **THEN** o navegador exibe a data e hora exatas de criação do comunicado (ex: `02/07/2026 20:15`)
