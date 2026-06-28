## MODIFIED Requirements

### Requirement: Campo de Técnico Responsável no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` habilitado (editável) contendo as opções de técnicos disponíveis: "MARCIO EDUARDO FELIX" (id: 59570) e "EVERTON DOS SANTOS VIEIRA" (id: 59841). O campo SHALL exibir uma opção-placeholder "Quem vai atender" como padrão vazio. O chamado enviado ao backend SHALL conter `tecnico_id` correspondente ao ID do técnico selecionado no IXC.

#### Scenario: Exibição do técnico no modal com seleção obrigatória
- **WHEN** o modal está aberto
- **THEN** o modal SHALL exibir um campo `<select>` com label "Enviar para" e a opção placeholder "Quem vai atender" como estado inicial
- **THEN** o botão "Abrir Chamado" SHALL estar desabilitado enquanto nenhum técnico for selecionado

#### Scenario: Envio do chamado com técnico atribuído
- **WHEN** o usuário seleciona um técnico e envia o chamado
- **THEN** o frontend SHALL passar o `tecnico_id` correspondente à opção selecionada no payload da requisição
- **THEN** o backend SHALL persistir o `id_tecnico` na OS vinculada no IXC
