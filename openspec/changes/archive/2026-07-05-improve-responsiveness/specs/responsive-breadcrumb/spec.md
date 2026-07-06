## ADDED Requirements

### Requirement: Breadcrumb responsivo
O sistema SHALL fornecer um componente `ResponsiveBreadcrumb` que exiba a navegação hierárquica sem truncamento ou sobreposição de texto em telas pequenas.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** o breadcrumb exibe todos os níveis completos

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** o breadcrumb pode truncar níveis intermediários com reticências ou mostrar apenas os dois últimos níveis

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** o breadcrumb exibe no máximo o nível anterior e o atual, ou colapsa em um dropdown/menu, evitando sobreposição ou corte

#### Scenario: Links clicáveis preservados
- **WHEN** um nível do breadcrumb é clicável
- **THEN** todos os níveis visíveis permanecem clicáveis, independentemente do breakpoint
