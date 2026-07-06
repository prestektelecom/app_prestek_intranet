# cobertura-ui-redesign Specification

## Purpose
TBD - created by archiving change redesign-cobertura. Update Purpose after archive.
## Requirements
### Requirement: Collapsible Left Sidebar for cities/bairros
The list of cities and neighborhoods SHALL reside inside a collapsible left-aligned sidebar panel floating on top of the map.

#### Scenario: User toggles the left sidebar
- **WHEN** the user clicks the collapse button `[ < ]` on the left sidebar
- **THEN** the sidebar slides out or hides from view, maximizing the map area.
- **WHEN** the user clicks the expand button `[ > ]`
- **THEN** the sidebar expands back to its floating list state.

### Requirement: Sincronizar IXC Button
The main action button SHALL be styled with the standard gradient.

#### Scenario: User triggers the sync action
- **WHEN** the user looks at the floating summary panel
- **THEN** the "Sincronizar IXC" button is styled with `bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white`.

### Requirement: Override Modal aesthetic update
The configuration modal (`OverrideModal`) SHALL use modern inputs, background contrast, and focus rings (`focus:ring-[#4A9EF5]`).

#### Scenario: User opens the configuration modal
- **WHEN** the user triggers the configuration action for a neighborhood row
- **THEN** the modal renders with correct theme contrast, rounded inputs, and focused rings.

### Requirement: Layout fluido na Central de Cobertura
A página de Cobertura SHALL ter layout fluido, com filtros responsivos, mapa adaptável e lista de cidades acessível em mobile.

#### Scenario: Filtros responsivos
- **WHEN** a página de Cobertura é exibida em uma viewport menor que `lg` (1024px)
- **THEN** os filtros de busca, tecnologia e status quebram linha ou são agrupados em um painel de filtros

#### Scenario: Lista de cidades em mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a lista de cidades e bairros é exibida como drawer deslizável ou bottom sheet, liberando espaço para o mapa

#### Scenario: Mapa adaptável
- **WHEN** a página é exibida em qualquer breakpoint
- **THEN** o mapa ocupa o espaço restante sem ser comprimido por elementos fixos

#### Scenario: Ícones corretos
- **WHEN** a página de Cobertura exibe ícones de localização, tune ou navegação
- **THEN** os ícones são renderizados como glifos visuais, nunca como texto

