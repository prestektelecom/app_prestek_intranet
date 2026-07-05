## ADDED Requirements

### Requirement: Tabela de escala adaptativa
A tabela de escala/agenda SHALL se adaptar a viewports pequenas, mantendo a legibilidade dos turnos e colaboradores.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a escala é exibida como tabela completa com dias da semana e colaboradores

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela permite scroll horizontal controlado ou fixa colunas de identificação do colaborador

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a escala é exibida como lista de cards por colaborador ou por dia, com detalhes do turno visíveis

#### Scenario: Navegação entre períodos
- **WHEN** o usuário navega entre semanas ou períodos em mobile
- **THEN** os controles de navegação são grandes o suficiente para toque e não causam overflow horizontal
