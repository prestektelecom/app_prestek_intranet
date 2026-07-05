## ADDED Requirements

### Requirement: Ações acessíveis por toque em cards
O sistema SHALL garantir que ações em cards (editar, excluir, visualizar, etc.) fiquem visíveis ou acessíveis em dispositivos touchscreen, sem depender exclusivamente de hover.

#### Scenario: Card em desktop
- **WHEN** o usuário passa o mouse sobre um card com ações
- **THEN** as ações podem ser reveladas por hover, desde que também exista uma forma de acesso sem hover

#### Scenario: Card em mobile
- **WHEN** o card é exibido em uma viewport touchscreen
- **THEN** as ações ficam visíveis por padrão ou acessíveis por um botão de menu/contexto no card

#### Scenario: Menu de ações
- **WHEN** há mais de duas ações em um card
- **THEN** as ações são agrupadas em um botão de menu para economizar espaço

#### Scenario: Área de toque
- **WHEN** um botão de ação é exibido em um card
- **THEN** a área de toque mínima é de 44x44px
