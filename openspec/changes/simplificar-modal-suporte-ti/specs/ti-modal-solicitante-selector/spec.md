## MODIFIED Requirements

### Requirement: Campo de seleção de solicitante no modal de TI
O modal de abertura de chamado de TI SHALL NÃO exibir o campo `<select>` de solicitante. O nome do solicitante SHALL ser derivado do usuário logado e enviado ao backend como `nome_solicitante` na requisição de criação de chamado.

#### Scenario: Abertura do modal sem campo de solicitante
- **WHEN** o usuário clica em "Suporte TI" no Dashboard
- **THEN** o modal SHALL exibir o formulário sem o campo de seleção de solicitante

#### Scenario: Envio do chamado com solicitante do usuário logado
- **WHEN** o usuário preenche a descrição, seleciona um técnico e clica em "Abrir Chamado"
- **THEN** o sistema SHALL enviar o `nome_solicitante` correspondente ao nome do usuário logado para o backend

### Requirement: Campo de Técnico Responsável no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` ativo com o label "Enviar para". O campo SHALL iniciar sem opção selecionada e SHALL exigir que o usuário escolha uma das opções disponíveis: "MARCIO EDUARDO FELIX" (`59570`) ou "EVERTON DOS SANTOS VIEIRA" (`59841`). O `tecnico_id` enviado ao backend SHALL corresponder à opção selecionada.

#### Scenario: Exibição do campo de técnico no modal
- **WHEN** o modal está aberto
- **THEN** o modal SHALL exibir um campo `<select>` com o label "Enviar para", placeholder "Quem vai atender" e as opções "MARCIO EDUARDO FELIX" e "EVERTON DOS SANTOS VIEIRA"

#### Scenario: Validação de técnico não selecionado
- **WHEN** o usuário não selecionou nenhum técnico
- **THEN** o botão "Abrir Chamado" SHALL permanecer desabilitado

#### Scenario: Envio do chamado com técnico selecionado
- **WHEN** o usuário seleciona "MARCIO EDUARDO FELIX" e envia o chamado
- **THEN** o frontend SHALL passar `tecnico_id: "59570"` no payload da requisição de abertura do chamado

#### Scenario: Envio do chamado com técnico Everton selecionado
- **WHEN** o usuário seleciona "EVERTON DOS SANTOS VIEIRA" e envia o chamado
- **THEN** o frontend SHALL passar `tecnico_id: "59841"` no payload da requisição de abertura do chamado
