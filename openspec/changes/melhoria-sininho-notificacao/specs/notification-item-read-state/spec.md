## ADDED Requirements

### Requirement: Marcação individual de notificação como lida
O sistema SHALL permitir que o usuário marque uma notificação individual como lida ao clicar nela. O estado de leitura SHALL ser persistido no `localStorage` imediatamente. O item SHALL mudar visualmente para estado "lido" sem recarregar o dropdown.

#### Scenario: Clique em item não lido
- **WHEN** o usuário clica em uma notificação não lida
- **THEN** o sistema adiciona o ID da notificação ao conjunto de IDs vistos no localStorage
- **AND** o item muda visualmente para o estado "lido" (reduzida opacidade ou sem highlight)

#### Scenario: Persistência entre sessões
- **WHEN** o usuário fecha e reabre o browser
- **THEN** os itens marcados como lidos continuam no estado lido ao abrir o dropdown

#### Scenario: Limpeza automática de IDs obsoletos
- **WHEN** o sistema salva o conjunto de IDs lidos
- **THEN** IDs de notificações que não existem mais na lista são removidos para evitar crescimento ilimitado do localStorage

### Requirement: Distinção visual entre lido e não lido
Cada item de notificação não lida SHALL ser visualmente distinto dos itens já lidos. Itens não lidos SHALL ter uma borda ou highlight lateral colorida correspondente ao tipo (vermelho para Urgente, âmbar para Importante). Itens lidos SHALL ter aparência neutra/opaca.

#### Scenario: Item não lido exibe highlight
- **WHEN** um item de notificação não está no conjunto de IDs lidos
- **THEN** ele exibe uma borda lateral colorida à esquerda (3–4px) com a cor do tipo

#### Scenario: Item lido sem highlight
- **WHEN** um item de notificação está no conjunto de IDs lidos
- **THEN** ele não exibe borda lateral colorida e sua opacidade é reduzida (ex: 0.65)

### Requirement: Ação "Marcar todas como lidas"
O dropdown SHALL exibir um botão/link "Marcar todas como lidas" no header, visível SOMENTE quando houver ao menos uma notificação não lida.

#### Scenario: Botão visível com não-lidas
- **WHEN** há ao menos uma notificação não lida
- **THEN** o header do dropdown exibe o botão "Marcar todas como lidas"

#### Scenario: Botão oculto sem não-lidas
- **WHEN** todas as notificações já foram lidas
- **THEN** o botão "Marcar todas como lidas" não é exibido

#### Scenario: Clique em marcar todas como lidas
- **WHEN** o usuário clica em "Marcar todas como lidas"
- **THEN** todos os IDs das notificações atuais são adicionados ao localStorage
- **AND** todos os itens do dropdown mudam para o estado visual "lido"
- **AND** o badge numérico desaparece do sino
