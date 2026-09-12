## Requirements

### Requirement: Banner de comunicado em destaque no Dashboard

O componente `ComunicadoBanner` SHALL ser exibido estaticamente entre o cabeçalho e o Bento Grid no Dashboard, mostrando comunicados de maior prioridade da lista.

#### Scenario: Comunicado urgente tem prioridade no banner
- **WHEN** há comunicados carregados e um ou mais possuem tipo `Urgente`
- **THEN** o banner prioriza comunicados com tipo `Urgente` na rotação

#### Scenario: Comunicado importante assume destaque na ausência de urgentes
- **WHEN** não há comunicados com tipo `Urgente` e existe ao menos um com tipo `Importante`
- **THEN** o banner prioriza comunicados com tipo `Importante`

#### Scenario: Sem comunicados disponíveis
- **WHEN** a lista de comunicados está vazia
- **THEN** o banner NÃO é renderizado (retorna null), sem espaço vazio na página

### Requirement: Exibição visual com imagem de capa

Quando o comunicado em destaque possuir um campo de imagem (`imagem_url`, `imagem`, `foto` ou `capa`) com valor não-nulo e não-vazio, o banner SHALL exibir essa imagem como fundo com overlay gradiente escuro.

#### Scenario: Imagem disponível
- **WHEN** o comunicado em destaque tem campo de imagem populado
- **THEN** o banner exibe a imagem como background com `background-size: cover`
- **AND** um overlay gradiente escuro cobre a imagem de cima para baixo para legibilidade do texto

#### Scenario: Sem campo de imagem (fallback)
- **WHEN** o comunicado em destaque não tem imagem associada
- **THEN** o banner exibe um gradiente sólido temático de fallback baseado no tipo do comunicado

### Requirement: Badge de tipo e texto sobreposto

O banner SHALL exibir, sobre a imagem ou gradiente, um badge de tipo, o título do comunicado e metadados (tempo relativo desde a criação).

#### Scenario: Elementos textuais visíveis
- **WHEN** o banner está renderizado com um comunicado em destaque
- **THEN** o badge de tipo é exibido com cor correspondente ao tipo
- **AND** o título do comunicado é exibido com fonte bold e tamanho destacado
- **AND** o tempo relativo (ex: "há 2h") é exibido junto ao badge

#### Scenario: Clique no banner
- **WHEN** o usuário clica em qualquer área do banner (ou pressiona Enter/Espaço com o banner focado)
- **THEN** a view é alterada para `announcements`

### Requirement: Estado de carregamento e erro do banner

O banner SHALL exibir um skeleton de loading enquanto os dados são buscados da API, e um estado de erro com opção de nova tentativa em caso de falha.

#### Scenario: Carregamento em andamento
- **WHEN** o fetch para `/api/comunicados` ainda não foi concluído
- **THEN** o banner exibe um bloco animado de skeleton

#### Scenario: Falha ao carregar
- **WHEN** o fetch falha
- **THEN** o banner exibe uma mensagem de erro com um botão para tentar novamente

### Requirement: ComunicadosCard evita duplicar o destaque óbvio

O widget `ComunicadosCard` SHALL excluir da sua lista o comunicado que corresponde ao seu próprio critério local de destaque (primeiro Urgente, senão primeiro Importante, senão o mais recente), evitando que esse item específico apareça duas vezes na mesma tela.

#### Scenario: Um destaque claro
- **WHEN** o Dashboard é carregado e há um comunicado Urgente ou Importante único
- **THEN** o `ComunicadosCard` não repete esse item na lista de "restantes"

#### Scenario: Banner rotaciona múltiplos itens de alta prioridade
- **WHEN** o `ComunicadoBanner` está rotacionando 2 ou 3 comunicados Urgentes/Importantes simultaneamente
- **THEN** o `ComunicadosCard` pode continuar exibindo os itens da rotação que não são o seu próprio destaque local — os dois componentes calculam "destaque" de forma independente e não compartilham qual slide está ativo no momento
- **AND** esse comportamento é uma limitação conhecida (não uma garantia de exclusão mútua completa), registrada para uma futura unificação da lógica de destaque entre os dois componentes
