## ADDED Requirements

### Requirement: Campo de seleção de solicitante no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` que permite ao usuário escolher o solicitante do chamado. A opção padrão SHALL ser o próprio usuário logado. O nome selecionado SHALL ser enviado ao backend como `nome_solicitante` na requisição de criação de chamado.

#### Scenario: Abertura do modal com solicitante pré-selecionado
- **WHEN** o usuário clica em "Suporte TI" no Dashboard
- **THEN** o modal SHALL exibir o campo de seleção de solicitante com o nome do usuário logado já selecionado

#### Scenario: Envio do chamado com solicitante selecionado
- **WHEN** o usuário preenche a descrição e clica em "Abrir Chamado"
- **THEN** o sistema SHALL enviar o `nome_solicitante` correspondente à opção selecionada no `<select>` para o backend

#### Scenario: Exibição do solicitante no banner informativo
- **WHEN** o modal está aberto
- **THEN** o texto do banner informativo SHALL refletir o nome da opção atualmente selecionada no `<select>`, atualizando dinamicamente conforme a seleção muda

### Requirement: Campo de Técnico Responsável no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` contendo apenas a opção "MARCIO EDUARDO FELIX", que SHALL ser o técnico padrão atribuído ao chamado. Este campo SHALL ser desabilitado (disabled). O chamado enviado ao backend SHALL conter `tecnico_id: "59570"` correspondente ao ID do Márcio no IXC.

#### Scenario: Exibição do técnico no modal
- **WHEN** o modal está aberto
- **THEN** o modal SHALL exibir um campo `<select>` com o label "Técnico Responsável" e a opção selecionada fixada como "MARCIO EDUARDO FELIX"

#### Scenario: Envio do chamado com técnico atribuído e agendado
- **WHEN** o usuário envia o chamado
- **THEN** o frontend SHALL passar `tecnico_id: "59570"` no payload da requisição de abertura do chamado

