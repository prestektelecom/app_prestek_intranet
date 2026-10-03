# atalhos-rapidos-button-layout Specification

## Purpose
Layout dos botões do card de Atalhos Rápidos do Dashboard (`AtalhosCard`): legibilidade do texto e área de toque.

## Requirements

### Requirement: Atalhos Rápidos Button Layout
Cada botão da lista de Atalhos Rápidos SHALL exibir o ícone à esquerda e, à direita, o label e o hint empilhados verticalmente (label acima, hint abaixo).

#### Scenario: Label e hint visíveis sem truncamento
- **WHEN** o card é renderizado em qualquer largura suportada pelo grid do Dashboard
- **THEN** o label e o hint SHALL estar completamente visíveis, sem `truncate` no hint

#### Scenario: Área de toque mínima preservada
- **WHEN** um botão de atalho é renderizado com label e hint empilhados
- **THEN** a altura clicável SHALL ser de no mínimo 44px

#### Scenario: Comportamento funcional inalterado
- **WHEN** o usuário clica em um botão de atalho
- **THEN** a ação associada (navegação, abertura de URL ou callback) SHALL ser executada normalmente
