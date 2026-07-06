## Purpose

Garantir que os filtros e ações do diretório de colaboradores/serviços sejam usáveis em qualquer viewport, sem quebra de layout ou perda de acessibilidade por toque.
## Requirements
### Requirement: Layout sem quebra nos botões de filtro
Os botões de filtro no diretório de serviços SHALL exibir seus textos completos em uma única linha, sem efetuar quebra automática de linha interna, independentemente do tamanho do visor ou tela do usuário.

#### Scenario: Visualização em tela pequena (mobile)
- **WHEN** o usuário acessa o diretório de serviços em um dispositivo móvel com visor estreito
- **THEN** o texto dos botões de filtro como "Internet PF", "Internet PJ", "Serviços Técnicos" e "Streaming's" é renderizado integralmente em uma única linha por botão
- **AND** a barra de filtros permite a rolagem horizontal suave para acessar os filtros ocultos à direita

### Requirement: Cards de colaborador acessíveis por toque
O Diretório de colaboradores SHALL garantir que as ações em cada card sejam acessíveis em dispositivos touchscreen.

#### Scenario: Ações visíveis no mobile
- **WHEN** um card de colaborador é exibido em uma viewport touchscreen
- **THEN** as ações do card (ligar, enviar mensagem, perfil, etc.) ficam visíveis ou acessíveis por um botão de menu, sem depender de hover

#### Scenario: Grid de cards responsivo
- **WHEN** a lista de colaboradores é exibida
- **THEN** o grid adapta o número de colunas ao breakpoint: 1 coluna em mobile, 2 em tablet, 3 ou mais em desktop

#### Scenario: Hover como realce, não como gatilho único
- **WHEN** um card possui estado de hover
- **THEN** o hover pode realçar visualmente o card, mas não é a única forma de acessar as ações

