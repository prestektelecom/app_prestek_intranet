## Requirements

### Requirement: Preview de descrição no card

O card de Comunicados no Dashboard SHALL exibir um preview da descrição de cada item, truncado com ellipsis quando o conteúdo exceder o espaço disponível.

#### Scenario: Descrição longa
- **WHEN** um comunicado tem descrição mais longa que a largura disponível
- **THEN** o card exibe o texto truncado com `…` ao final, sem quebrar o layout

#### Scenario: Descrição curta
- **WHEN** um comunicado tem descrição que cabe inteira no espaço disponível
- **THEN** o card exibe a descrição completa sem ellipsis

### Requirement: Indicador visual de prioridade por tipo

Cada item do card SHALL exibir uma borda vertical colorida à esquerda (stripe) e uma tag, cuja cor reflete o tipo do comunicado.

#### Scenario: Tipo Urgente
- **WHEN** um comunicado tem `tipo === "Urgente"`
- **THEN** o item exibe stripe e tag na cor de perigo do tema ativo

#### Scenario: Tipo Importante ou Aviso
- **WHEN** um comunicado tem `tipo === "Importante"` ou `tipo === "Aviso"`
- **THEN** o item exibe stripe e tag na cor de aviso do tema ativo

#### Scenario: Tipo Geral ou desconhecido
- **WHEN** um comunicado tem `tipo === "Geral"` ou tipo não mapeado
- **THEN** o item exibe stripe e tag na cor de sucesso do tema ativo, ou um fallback neutro

### Requirement: Navegação ao clicar no item

Cada item do card SHALL ser clicável (mouse e teclado) e, ao ser ativado, navegar para a view de Comunicados completa.

#### Scenario: Clique ou teclado em qualquer item
- **WHEN** o usuário clica em qualquer item da lista do `ComunicadosCard`, ou o foca e pressiona Enter/Espaço
- **THEN** a view atual muda para `"announcements"`

### Requirement: Data de criação detalhada via tooltip

O sistema SHALL exibir a data e hora de criação completas formatadas em pt-BR no tooltip (`title`) do elemento de tempo relativo.

#### Scenario: Passar o mouse no tempo de criação
- **WHEN** o usuário passa o mouse sobre o elemento de tempo relativo de um comunicado
- **THEN** o navegador exibe a data e hora exatas de criação do comunicado
