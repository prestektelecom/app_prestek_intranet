## ADDED Requirements

### Requirement: Tabela adaptativa a viewports pequenos
O sistema SHALL fornecer um componente de tabela que se adapte a telas estreitas sem perder acessibilidade aos dados.

#### Scenario: Exibição em desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a tabela é exibida no formato tabular completo com todas as colunas

#### Scenario: Exibição em tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela mantém o formato tabular com scroll horizontal controlado e colunas prioritárias sempre visíveis

#### Scenario: Exibição em mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a tabela é transformada em uma lista de cards, cada card representando uma linha, com colunas secundárias agrupadas ou disponíveis ao expandir

#### Scenario: Ações por linha em mobile
- **WHEN** uma linha da tabela possui ações (editar, excluir, visualizar)
- **THEN** no layout de cards mobile as ações ficam visíveis ou acessíveis por um botão de menu no card
