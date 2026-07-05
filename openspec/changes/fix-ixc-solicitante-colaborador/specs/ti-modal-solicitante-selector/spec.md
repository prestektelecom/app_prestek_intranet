## MODIFIED Requirements

### Requirement: Campo de seleção de solicitante no modal de TI
O modal de abertura de chamado de TI SHALL enviar o e-mail do usuário logado na requisição. O backend SHALL buscar o ID do funcionário/técnico correspondente a esse e-mail no IXC Soft. A OS criada no IXC SHALL ter o campo `id_tecnico` (Colaborador responsável) preenchido com o ID do colaborador logado solicitante (se encontrado no IXC), enquanto o agendamento da OS é atribuído ao técnico selecionado para atendimento.

#### Scenario: Abertura do modal e envio do chamado
- **WHEN** o usuário preenche a descrição, seleciona o técnico para atendimento e clica em "Abrir Chamado"
- **THEN** o frontend SHALL enviar o e-mail do usuário logado e o `tecnico_id` selecionado para o backend
- **THEN** o backend SHALL tentar obter o ID do técnico no IXC Soft correspondente ao e-mail do solicitante
- **THEN** o backend SHALL criar a OS manual com `id_tecnico` correspondente ao ID do solicitante logado (ou fallback para o técnico se não encontrado) e associar a OS ao técnico de atendimento selecionado
