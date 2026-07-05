## ADDED Requirements

### Requirement: Lista de chamados adaptativa
A lista de chamados (Tickets) SHALL exibir os dados de forma legível em mobile, tablet e desktop.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a lista é exibida como tabela completa com todas as colunas

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela permite scroll horizontal controlado ou oculta colunas de baixa prioridade

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a lista de chamados é exibida como cards com as informações mais importantes visíveis e detalhes acessíveis ao expandir ou abrir

#### Scenario: Ações do chamado
- **WHEN** um chamado possui ações (visualizar, editar, atender)
- **THEN** as ações ficam acessíveis nos cards mobile por botão de menu ou botões visíveis
