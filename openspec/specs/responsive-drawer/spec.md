# responsive-drawer Specification

## Purpose
TBD - created by archiving change improve-responsiveness. Update Purpose after archive.
## Requirements
### Requirement: Drawer lateral para navegação mobile
O sistema SHALL fornecer um componente `MobileDrawer` que substitua a sidebar fixa em telas pequenas, acessível via botão no cabeçalho.

#### Scenario: Abertura do drawer
- **WHEN** o usuário clica no botão de menu no `Header`
- **THEN** o drawer desliza da esquerda sobre o conteúdo com overlay escurecido

#### Scenario: Fechamento do drawer
- **WHEN** o usuário clica no overlay, no botão de fechar ou em um item de navegação
- **THEN** o drawer fecha suavemente

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** o drawer não é exibido; a sidebar fixa permanece visível

#### Scenario: Conteúdo do drawer
- **WHEN** o drawer está aberto
- **THEN** ele exibe os itens de navegação da sidebar em lista vertical com área de toque mínima de 44px

