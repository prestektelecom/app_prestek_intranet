# responsive-filter-bar Specification

## Purpose
TBD - created by archiving change improve-responsiveness. Update Purpose after archive.
## Requirements
### Requirement: Barra de filtros adaptativa
O sistema SHALL fornecer um componente `FilterBar` que acomode múltiplos filtros sem overflow ou scroll horizontal forçado em telas pequenas.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** todos os filtros são exibidos lado a lado na barra

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** os filtros quebram em múltiplas linhas mantendo alinhamento e usabilidade

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** os filtros são empilhados verticalmente ou agrupados em um botão de "Filtros" que abre um painel/bottom sheet

#### Scenario: Filtros ativos visíveis
- **WHEN** um ou mais filtros estão aplicados
- **THEN** chips de filtros ativos são exibidos de forma compacta e podem ser removidos individualmente

