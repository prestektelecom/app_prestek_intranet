## MODIFIED Requirements

### Requirement: Atalhos Rápidos Button Layout
Cada botão da lista de Atalhos Rápidos SHALL exibir o ícone à esquerda e, à direita, o label e o hint empilhados verticalmente (label acima, hint abaixo), em vez de lado a lado na mesma linha horizontal.

#### Scenario: Label e hint visíveis sem truncamento
- **WHEN** o card "Atalhos Rápidos" é renderizado em qualquer largura suportada pelo grid do Dashboard
- **THEN** o label do atalho e o hint SHALL estar completamente visíveis, sem truncamento por `truncate` no hint

#### Scenario: Área de toque mínima preservada
- **WHEN** um botão de atalho é renderizado com label e hint empilhados
- **THEN** a altura clicável do botão SHALL ser de no mínimo 44px (cumprindo a regra de área de toque do projeto)

#### Scenario: Comportamento funcional inalterado
- **WHEN** o usuário clica em qualquer botão de atalho
- **THEN** a ação associada (navegação, abertura de URL ou callback) SHALL ser executada normalmente, sem regressão
