## ADDED Requirements

### Requirement: Atribuição de permissões por capacidade exige confirmação explícita
Alterar as permissões por capacidade de um usuário SHALL exigir uma etapa de confirmação explícita, nomeando a pessoa afetada e listando o que será concedido e o que será revogado, antes de qualquer gravação. A confirmação SHALL usar um diálogo próprio da aplicação, nunca uma caixa de diálogo nativa do navegador.

#### Scenario: Salvar alteração abre confirmação nominal
- **WHEN** o administrador altera as capacidades de um usuário e aciona a ação de salvar
- **THEN** a aplicação SHALL exibir uma confirmação nomeando o usuário e listando as capacidades concedidas e revogadas, antes de enviar qualquer requisição
- **THEN** cancelar a confirmação SHALL NOT alterar as permissões do usuário

#### Scenario: Sem alterações não há o que confirmar
- **WHEN** o administrador não alterou nenhuma capacidade
- **THEN** a ação de salvar SHALL estar indisponível

### Requirement: A seleção de capacidades é acessível e nomeia a ação
O controle de atribuição SHALL agrupar as capacidades como um conjunto de opções com rótulo de grupo, cada uma com nome acessível, e o botão de confirmar SHALL descrever a ação executada. Para um administrador, a interface SHALL indicar que ele já possui todas as capacidades em vez de exibir opções editáveis.

#### Scenario: Capacidades agrupadas e rotuladas
- **WHEN** o administrador abre a atribuição de permissões de um usuário não administrador
- **THEN** cada capacidade SHALL ser uma opção com nome acessível dentro de um grupo rotulado

#### Scenario: Administrador não tem opções editáveis
- **WHEN** o usuário exibido é administrador
- **THEN** a interface SHALL informar que ele possui todas as capacidades
- **THEN** a interface SHALL NOT oferecer opções de capacidade para ele

### Requirement: Falha ao salvar permissões é anunciada sem bloquear a interface
Uma falha ao salvar permissões SHALL ser comunicada dentro do próprio fluxo de confirmação, de forma perceptível a tecnologia assistiva, sem `alert()` nativo, e SHALL manter o estado anterior visível.

#### Scenario: Erro de gravação é anunciado
- **WHEN** a requisição de alteração de permissões falha
- **THEN** a aplicação SHALL exibir a falha dentro do diálogo, de forma anunciável a tecnologia assistiva
- **THEN** as permissões exibidas SHALL continuar sendo as anteriores à tentativa
