## MODIFIED Requirements

### Requirement: Preservação da Estrutura Funcional

A estrutura de layout e o fluxo funcional da página SHALL ser preservados, incluindo os novos pontos de entrada para criação de plantão.

#### Scenario: Usuário utiliza filtros, tabs e modais

- **WHEN** o usuário interage com filtros laterais, tabs "Escala"/"Histórico", botões de ação ou modais
- **THEN** o comportamento permanece o mesmo, alterando apenas o revestimento visual.

#### Scenario: Administrador usa o botão "Novo Plantão" no Hero

- **WHEN** um administrador clica em "Novo Plantão" no Hero Banner
- **THEN** o `ManagePlantaoModal` abre em modo de criação, com a data de hoje pré-selecionada e editável
- **AND** o restante da página permanece no estado atual (filtros e listagem inalterados)
