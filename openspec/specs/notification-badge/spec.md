# notification-badge Specification

## Purpose
Badge numérico no sino de notificações, com teto em "9+" e cor por prioridade.

## Requirements

### Requirement: Badge visual no sino
O sistema SHALL exibir um badge numérico sobre o ícone do sino (em vez de um ponto simples) quando há notificações não lidas. O badge SHALL mostrar o número de itens não lidos, com cap em "9+". A cor SHALL seguir a prioridade: vermelho (`C.danger`) quando há urgentes não lidas, âmbar (`C.warning`) quando há apenas importantes não lidas.

#### Scenario: Badge oculto sem não-lidas
- **WHEN** não há notificações não lidas
- **THEN** nenhum badge é visível sobre o sino

#### Scenario: Badge numérico visível
- **WHEN** há notificações não lidas
- **THEN** um badge numérico é exibido com o número correto (ou "9+") e a cor de prioridade adequada
