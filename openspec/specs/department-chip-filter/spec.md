# department-chip-filter Specification

## Purpose
TBD - created by archiving change redesign-colaboradores-people-hub. Update Purpose after archive.
## Requirements
### Requirement: Chips scrolláveis de filtro por departamento
A seção de filtros SHALL exibir chips horizontais scrolláveis (sem barra de scroll visível) representando cada departamento único encontrado nos dados dos colaboradores, com badge mostrando a contagem de membros. O primeiro chip SHALL ser "Todos" com a contagem total.

#### Scenario: Chips renderizados com dados
- **WHEN** os colaboradores são carregados e os departamentos resolvidos
- **THEN** chips são exibidos para cada departamento único, ordenados por nome, com o chip "Todos" em primeiro

#### Scenario: Contagem correta no badge
- **WHEN** os chips são renderizados
- **THEN** cada chip exibe o número de colaboradores pertencentes àquele departamento

#### Scenario: Chip ativo recebe estilo destacado
- **WHEN** o usuário clica em um chip de departamento
- **THEN** o chip recebe estilo ativo (`background: #EAF4FF`, `color: #1F5BA8`, borda `#4A9EF5`) e os demais retornam ao estado inativo

#### Scenario: Scroll horizontal sem barra visível
- **WHEN** há mais chips do que o espaço disponível na tela
- **THEN** a área de chips permite scroll horizontal sem exibir barra de scroll (classe `scrollbar-hide`)

