## ADDED Requirements

### Requirement: Placeholder visual de featured announcement no card de comunicados
O card de Comunicados da dashboard SHALL exibir um banner hero no topo do card com fundo colorido (gradiente ou cor sólida com ícone/texto), simulando o layout de um comunicado em destaque, mesmo quando a imagem real não está disponível.

#### Scenario: Banner placeholder renderizado sem imagem real
- **WHEN** o card de comunicados é carregado
- **THEN** um banner hero é exibido no topo com gradiente, badge de tipo e título do comunicado mais recente (ou texto padrão se não houver comunicados)

#### Scenario: Banner usa dados do comunicado mais recente disponível
- **WHEN** há ao menos um comunicado carregado da API
- **THEN** o banner exibe o título e tipo do comunicado mais recente como conteúdo do featured slot

#### Scenario: Banner com estado vazio
- **WHEN** não há comunicados carregados
- **THEN** o banner exibe um placeholder visual com texto "Nenhum comunicado em destaque"

### Requirement: Lista de comunicados abaixo do featured banner
O card SHALL exibir a lista compacta de comunicados (excluindo o featured) abaixo do banner, mantendo o comportamento atual de clique para navegar à página de comunicados.

#### Scenario: Lista exclui o item em destaque
- **WHEN** há mais de um comunicado
- **THEN** o banner exibe o primeiro, e a lista abaixo exibe os demais (a partir do segundo)
