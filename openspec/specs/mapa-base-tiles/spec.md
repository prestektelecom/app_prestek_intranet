## Purpose

Define como os mapas da intranet obtêm o fundo cartográfico: sem chave de API, com atribuição correta e com degradação controlada quando o provedor ou o WebGL não estão disponíveis.

## Requirements

### Requirement: Fundo do mapa sem chave de API

Os mapas da Central de Cobertura (mapa principal e seletor de coordenadas) SHALL obter o fundo cartográfico de um provedor que não exige chave de API, cadastro nem autenticação, e SHALL NOT exibir texto de erro de credencial dentro da área do mapa.

#### Scenario: Mapa carrega sem credencial
- **WHEN** um usuário autenticado abre a Central de Cobertura
- **THEN** o fundo do mapa é exibido com ruas, limites e rótulos legíveis
- **AND** nenhuma requisição de tile inclui chave de API
- **AND** nenhuma mensagem de "API key" aparece dentro do mapa

#### Scenario: Seletor de coordenadas usa o mesmo fundo
- **WHEN** um administrador abre o seletor de coordenadas de uma região
- **THEN** o fundo do mapa é o mesmo do mapa principal

### Requirement: Atribuição do provedor visível

Todo mapa exibido SHALL mostrar a atribuição exigida pelo provedor de tiles ("OpenFreeMap © OpenMapTiles Data from OpenStreetMap") num controle de atribuição legível em todos os temas do produto.

#### Scenario: Atribuição presente
- **WHEN** o mapa é renderizado
- **THEN** o controle de atribuição contém o texto do provedor e um link para o OpenStreetMap

#### Scenario: Atribuição legível nos temas
- **WHEN** o tema ativo é claro, escuro, Cyber, Aurora ou AMOLED
- **THEN** o texto e os links da atribuição mantêm contraste mínimo de 4,5:1 contra o fundo do controle

### Requirement: Degradação sem WebGL ou sem o provedor

Se o navegador não suportar WebGL ou o style do provedor principal não puder ser carregado, o mapa SHALL continuar utilizável com um fundo raster que também não exige chave, e SHALL manter marcadores, popups e clusters funcionando.

#### Scenario: WebGL indisponível
- **WHEN** o navegador não suporta WebGL
- **THEN** o mapa exibe o fundo raster de reserva com a atribuição correspondente
- **AND** marcadores, popups e clusters de região continuam funcionando

#### Scenario: Provedor principal fora do ar
- **WHEN** o download do style do provedor principal falha
- **THEN** o mapa passa ao fundo raster de reserva sem recarregar a página
- **AND** nenhum erro não tratado aparece para o usuário

### Requirement: Comportamento do mapa preservado

A troca de fonte de tiles SHALL NOT alterar o comportamento de marcadores, popups, clusters, seleção de região nem enquadramento do mapa.

#### Scenario: Seleção de região na lista
- **WHEN** o usuário seleciona na lista uma região cujo marcador está dentro de um cluster
- **THEN** o mapa aproxima até o marcador ficar visível e abre o popup dessa região

#### Scenario: Filtros refletem no mapa
- **WHEN** o usuário aplica busca ou filtro de tecnologia ou status
- **THEN** o mapa mostra somente os marcadores das regiões que aparecem na lista
