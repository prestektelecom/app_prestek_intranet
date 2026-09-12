## ADDED Requirements

### Requirement: Contraste do contador do chip de filtro

O contador de contagem dentro de cada chip de filtro SHALL manter contraste WCAG AA (≥ 4,5:1) tanto no estado ativo quanto inativo.

#### Scenario: Chip inativo
- **WHEN** um chip de filtro não está selecionado
- **THEN** o contador usa `ink2` sobre `surfaceSoft`

#### Scenario: Chip ativo
- **WHEN** um chip de filtro está selecionado
- **THEN** o contador usa `onAccent` sobre a cor sólida do chip
