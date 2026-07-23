## ADDED Requirements

### Requirement: Botão de gerenciamento de imagens no Hero Card
O Hero Card SHALL exibir um botão no canto superior direito que abre o modal de gerenciamento de imagens. O botão SHALL ser visível sobre qualquer fundo (gradiente ou imagem).

#### Scenario: Botão sempre visível
- **WHEN** o Hero Card é renderizado (com ou sem imagens)
- **THEN** o botão de imagem SHALL estar visível no canto superior direito com z-index acima de todos os layers de fundo

### Requirement: Modal de gerenciamento de imagens
O sistema SHALL exibir um modal ao clicar no botão de imagem, permitindo ao usuário visualizar, adicionar e remover imagens de fundo do Hero Card.

#### Scenario: Abrir modal
- **WHEN** o usuário clica no botão de imagem do Hero Card
- **THEN** o modal SHALL abrir com a lista de imagens atualmente salvas

#### Scenario: Fechar modal
- **WHEN** o usuário clica no botão de fechar (×) ou fora da área do modal
- **THEN** o modal SHALL fechar sem aplicar alterações não confirmadas

### Requirement: Upload de imagens via arquivo local
O modal SHALL permitir que o usuário selecione arquivos de imagem do dispositivo para adicionar ao Hero Card.

#### Scenario: Seleção de múltiplos arquivos
- **WHEN** o usuário clica na área de upload e seleciona um ou mais arquivos de imagem (JPEG, PNG, WebP, GIF)
- **THEN** cada arquivo selecionado SHALL ser processado e adicionado à lista de imagens

#### Scenario: Tipo de arquivo inválido ignorado
- **WHEN** o usuário seleciona um arquivo que não é imagem
- **THEN** o arquivo SHALL ser ignorado silenciosamente

### Requirement: Redimensionamento automático antes de salvar
Antes de persistir, cada imagem SHALL ser redimensionada via Canvas API para no máximo 1280px na maior dimensão, com qualidade JPEG de 0.82, para respeitar o limite de ~5 MB do localStorage.

#### Scenario: Imagem grande redimensionada
- **WHEN** o usuário adiciona uma imagem com largura ou altura superior a 1280px
- **THEN** a imagem SHALL ser redimensionada proporcionalmente para que a maior dimensão seja 1280px antes de converter para base64

#### Scenario: Imagem pequena não afetada
- **WHEN** o usuário adiciona uma imagem com largura e altura inferiores a 1280px
- **THEN** a imagem SHALL ser convertida para JPEG base64 sem redimensionamento, mantendo suas dimensões originais

### Requirement: Remoção de imagens individuais
O modal SHALL permitir remover cada imagem individualmente através de um botão de remoção visível no thumbnail.

#### Scenario: Remoção de imagem
- **WHEN** o usuário clica no botão × sobre um thumbnail de imagem no modal
- **THEN** aquela imagem SHALL ser removida da lista imediatamente (sem confirmação adicional)

### Requirement: Persistência em localStorage
As imagens SHALL ser persistidas no localStorage sob a chave `dashboardHeroBgImages` como array JSON de data URLs base64.

#### Scenario: Salvar imagens
- **WHEN** o usuário fecha o modal após adicionar ou remover imagens
- **THEN** a lista atualizada SHALL ser salva em `localStorage['dashboardHeroBgImages']` e o slideshow SHALL refletir as novas imagens imediatamente

#### Scenario: Migração de chave legada
- **WHEN** o localStorage contém `dashboardHeroBg` (string, formato legado) mas não `dashboardHeroBgImages`
- **THEN** o sistema SHALL ler o valor legado, convertê-lo para array de um elemento e utilizá-lo como estado inicial

### Requirement: Grid de thumbnails no modal
O modal SHALL exibir as imagens salvas em um grid de thumbnails com proporção de aspecto fixo, cada um com botão de remoção sobreposto.

#### Scenario: Visualização de thumbnails
- **WHEN** o modal está aberto e há imagens salvas
- **THEN** cada imagem SHALL ser exibida como thumbnail (object-cover, proporção 16:9 ou similar) com botão × no canto superior direito

#### Scenario: Estado vazio
- **WHEN** o modal está aberto e não há imagens salvas
- **THEN** o modal SHALL exibir uma mensagem de estado vazio indicando que nenhuma imagem foi adicionada
