# dashboard-customization Specification

## Purpose
TBD - created by archiving change dashboard-drag-and-drop. Update Purpose after archive.
## Requirements
### Requirement: Habilitar e Desabilitar Modo de Edição
O sistema SHALL permitir que o usuário ative e desative o "Modo de Edição" da Dashboard, de modo que os widgets fiquem presos (estáticos) em uso normal, prevenindo cliques ou toques acidentais, mas livres para alteração no modo edição.

#### Scenario: Ativar Modo de Edição
- **WHEN** o usuário clica no botão "Personalizar Dashboard"
- **THEN** o sistema altera o estado da interface permitindo que os widgets sejam arrastados e redimensionados.

#### Scenario: Salvar/Desativar Modo de Edição
- **WHEN** o usuário clica em "Salvar" ou desativa a edição
- **THEN** os widgets voltam a ficar fixos e o layout final é disparado para o backend salvar as posições.

### Requirement: Arrastar e Redimensionar Widgets
O sistema SHALL renderizar a Dashboard usando um grid responsivo interativo (ex: react-grid-layout) onde cada widget registrado tem coordenadas X, Y, largura e altura.

#### Scenario: Arrastar Widget
- **WHEN** o sistema está no Modo de Edição e o usuário clica e segura o mouse sobre a alça/topo do widget
- **THEN** o widget move-se pelo grid, trocando de lugar e reposicionando os widgets ao redor de forma fluida.

#### Scenario: Redimensionar Widget
- **WHEN** o sistema está no Modo de Edição e o usuário puxa o canto inferior direito de um widget
- **THEN** o widget expande ou contrai nas colunas/linhas permitidas, e o sistema previne encolher além do tamanho mínimo (minW, minH) definido para aquele componente.

