# notification-bell-ui Specification

## Purpose
Interface do sino de notificações no header: badge numérico de não lidas, animação de shake no hover, estado de loading apenas na primeira carga e operação completa por teclado e leitor de tela.

## Requirements

### Requirement: Badge numérico no sino
O sistema SHALL exibir um badge numérico sobre o ícone do sino indicando a quantidade de notificações não lidas. Quando não há notificações não lidas, o badge SHALL estar oculto. Quando há mais de 9 notificações não lidas, o badge SHALL exibir "9+".

#### Scenario: Badge oculto sem notificações não lidas
- **WHEN** o usuário não tem notificações não lidas
- **THEN** nenhum badge é exibido sobre o sino

#### Scenario: Badge com número exato (1–9)
- **WHEN** há entre 1 e 9 notificações não lidas
- **THEN** o badge exibe o número exato com fundo colorido (vermelho para urgente, âmbar para importante)

#### Scenario: Badge com "9+" para mais de 9
- **WHEN** há mais de 9 notificações não lidas
- **THEN** o badge exibe "9+" em vez do número real

### Requirement: Animação shake no hover do sino
O botão do sino SHALL executar uma animação de "shake" sutil ao receber hover do mouse, porém SOMENTE quando há notificações não lidas.

#### Scenario: Shake ativado com não-lidas
- **WHEN** o usuário passa o mouse sobre o botão do sino E há notificações não lidas
- **THEN** o ícone executa a animação `bell-shake` definida em CSS

#### Scenario: Sem shake quando tudo lido
- **WHEN** o usuário passa o mouse sobre o botão do sino E não há notificações não lidas
- **THEN** nenhuma animação de shake ocorre

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

