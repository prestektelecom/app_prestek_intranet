## ADDED Requirements

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
O sistema SHALL exibir um indicador de carregamento sutil dentro do dropdown enquanto a busca de comunicados estiver em andamento na abertura inicial.

#### Scenario: Loading na abertura
- **WHEN** o dropdown de notificações é aberto E o fetch ainda não concluiu
- **THEN** um spinner ou skeleton é exibido no lugar da lista

#### Scenario: Conteúdo exibido após fetch
- **WHEN** o fetch de comunicados conclui com sucesso
- **THEN** o spinner é removido e a lista de notificações é exibida

### Requirement: Acessibilidade do botão sino
O botão do sino SHALL ter atributos ARIA que descrevam seu estado e função para leitores de tela.

#### Scenario: Aria-label descritivo
- **WHEN** o botão do sino é renderizado
- **THEN** ele possui `aria-label` descrevendo a quantidade de notificações não lidas (ex: "3 notificações não lidas")

#### Scenario: Aria-expanded no dropdown
- **WHEN** o dropdown está aberto
- **THEN** o botão possui `aria-expanded="true"` E quando fechado `aria-expanded="false"`
