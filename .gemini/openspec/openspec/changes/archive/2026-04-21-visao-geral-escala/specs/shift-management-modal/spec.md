## ADDED Requirements

### Requirement: Modal de gerenciamento de plantão
O sistema SHALL fornecer um modal "Gerenciar Plantão" para criar, editar e excluir registros de turnos.

#### Scenario: Abrir modal pelo botão de gerenciamento
- **WHEN** o usuário clica no botão "Gerenciar Plantão"
- **THEN** o sistema SHALL exibir o modal com o formulário de plantão

#### Scenario: Fechar modal ao clicar fora
- **WHEN** o usuário clica fora da área do modal
- **THEN** o sistema SHALL fechar o modal e descartar alterações não salvas

### Requirement: Criação de novo turno de plantão
O modal SHALL permitir que administradores criem novos registros de plantão.

#### Scenario: Salvar novo turno com dados válidos
- **WHEN** o usuário preenche todos os campos obrigatórios e clica em "Salvar"
- **THEN** o sistema SHALL persistir o novo turno e exibi-lo na tabela de escala

### Requirement: Exclusão de turno de plantão
O modal SHALL permitir a exclusão de registros de plantão existentes.

#### Scenario: Excluir turno existente
- **WHEN** o usuário clica no botão de exclusão de um turno e confirma
- **THEN** o sistema SHALL remover o turno da escala

### Requirement: Filtro de funcionários por departamento
O modal SHALL filtrar a lista de funcionários exibidos de acordo com o cargo selecionado.

#### Scenario: Cargo N1 exibe apenas funcionários de ATENDIMENTO/NOC
- **WHEN** o usuário seleciona o cargo "N1 - ATENDIMENTO/NOC" no formulário
- **THEN** o sistema SHALL exibir apenas funcionários cujo departamento seja "ATENDIMENTO/NOC"

#### Scenario: Cargo sem filtro exibe todos os funcionários
- **WHEN** o usuário seleciona um cargo sem departamento específico mapeado
- **THEN** o sistema SHALL exibir todos os funcionários disponíveis
