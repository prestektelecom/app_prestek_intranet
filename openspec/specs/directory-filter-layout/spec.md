## Requirements

### Requirement: Layout sem quebra nos botões de filtro
Os botões de filtro no diretório de serviços SHALL exibir seus textos completos em uma única linha, sem efetuar quebra automática de linha interna, independentemente do tamanho do visor ou tela do usuário.

#### Scenario: Visualização em tela pequena (mobile)
- **WHEN** o usuário acessa o diretório de serviços em um dispositivo móvel com visor estreito
- **THEN** o texto dos botões de filtro como "Internet PF", "Internet PJ", "Serviços Técnicos" e "Streaming's" é renderizado integralmente em uma única linha por botão
- **AND** a barra de filtros permite a rolagem horizontal suave para acessar os filtros ocultos à direita
