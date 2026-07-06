## ADDED Requirements

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
