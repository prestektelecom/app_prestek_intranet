## MODIFIED Requirements

### Requirement: Acessibilidade do botão sino
O botão do sino e o dropdown SHALL ser operáveis por teclado: o botão tem `aria-label` com concordância correta ("1 não lida", "3 não lidas", "sem novas") e `aria-expanded`; cada item de notificação é um `button` focável; o dropdown fecha com Escape devolvendo o foco ao sino; a descrição de cada item é limitada a duas linhas com reticências.

#### Scenario: Aria-label descritivo
- **WHEN** há exatamente uma notificação não lida
- **THEN** o botão anuncia "Notificações (1 não lida)"

#### Scenario: Aria-expanded no dropdown
- **WHEN** o dropdown está aberto
- **THEN** o botão possui `aria-expanded="true"` E quando fechado `aria-expanded="false"`

#### Scenario: Item por teclado
- **WHEN** o usuário navega por Tab até um item de notificação e pressiona Enter
- **THEN** o item é marcado como lido

#### Scenario: Descrição longa
- **WHEN** a descrição do comunicado tem mais de duas linhas
- **THEN** o item mostra apenas duas linhas com reticências e o texto integral fica em "Ver todos os comunicados"

### Requirement: Estado de loading durante fetch
O sistema SHALL exibir um indicador de carregamento dentro do dropdown apenas na primeira carga; atualizações periódicas em segundo plano SHALL NOT substituir a lista já exibida por um spinner.

#### Scenario: Loading na abertura
- **WHEN** o dropdown é aberto antes da primeira resposta de comunicados
- **THEN** um spinner é exibido no lugar da lista

#### Scenario: Conteúdo exibido após fetch
- **WHEN** o fetch de comunicados conclui com sucesso
- **THEN** o spinner é removido e a lista de notificações é exibida

#### Scenario: Poll com o dropdown aberto
- **WHEN** o dropdown está aberto e o poll de 30s dispara
- **THEN** a lista continua visível e é atualizada em silêncio quando a resposta chega
