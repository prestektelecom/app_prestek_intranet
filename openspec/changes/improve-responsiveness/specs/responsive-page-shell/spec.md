## ADDED Requirements

### Requirement: Estrutura comum de página responsiva
O sistema SHALL fornecer um componente `PageShell` que padronize o layout de cabeçalho, filtros, conteúdo e ações em todas as páginas, adaptando-se a mobile, tablet e desktop.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** o `PageShell` exibe título, filtros e ações em uma única linha ou layout horizontal

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** o `PageShell` permite que filtros e ações quebrem linha mantendo legibilidade

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** o `PageShell` empilha título, filtros e ações verticalmente, usando toda a largura disponível

#### Scenario: Espaço para bottom navigation
- **WHEN** a viewport é menor que `lg` (1024px)
- **THEN** o `PageShell` adiciona padding inferior suficiente para não ser coberto pela `MobileBottomNav`
