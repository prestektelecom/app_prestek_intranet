# ti-modal-solicitante-selector Specification

## Purpose
Componente de modal para abertura de chamados de TI na intranet. Gerencia a seleção do solicitante e do técnico responsável no frontend, e define as regras de atribuição dos respectivos IDs no backend ao criar o ticket (`su_ticket`) e a OS manual (`su_oss_chamado`) no IXC Soft.

## Requirements

### Requirement: Campo de seleção de solicitante no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` que permite ao usuário escolher o solicitante do chamado. A opção padrão SHALL ser o próprio usuário logado. O nome selecionado SHALL ser enviado ao backend como `nome_solicitante` na requisição de criação do chamado.

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

### Requirement: Atribuição de responsável no ticket e técnico na OS
O sistema SHALL atribuir o `funcionario_id` do colaborador logado ao campo `id_responsavel_tecnico` do ticket (`su_ticket`) ao abrir um chamado de TI via intranet. O campo `id_tecnico` da OS manual (`su_oss_chamado`) SHALL sempre receber o ID do técnico de TI selecionado pelo usuário (Marcio ou Everton).

#### Scenario: Abertura de chamado com colaborador logado identificado no banco local
- **WHEN** um colaborador abre um chamado de TI pela intranet, seleciona um técnico e envia o formulário
- **THEN** o backend busca o `funcionario_id` do solicitante em `usuarios_perfil` usando `colaborador_id` ou `email_solicitante`
- **THEN** o ticket (`su_ticket`) é criado com `id_responsavel_tecnico` = `funcionario_id` do solicitante
- **THEN** o ticket (`su_ticket`) é criado com `id_usuarios` = `usuario_id` do solicitante (mantido)
- **THEN** a OS manual (`su_oss_chamado`) é criada com `id_tecnico` = ID do técnico de TI selecionado (Marcio/Everton)
- **THEN** o painel do IXC exibe o colaborador logado como "Colaborador responsável" no atendimento

#### Scenario: Abertura de chamado quando funcionario_id não é encontrado no banco local
- **WHEN** o banco local não retorna `funcionario_id` para o colaborador logado
- **THEN** o ticket (`su_ticket`) é criado com `id_responsavel_tecnico` = ID do técnico de TI selecionado (fallback)
- **THEN** a OS manual (`su_oss_chamado`) é criada com `id_tecnico` = ID do técnico de TI selecionado
- **THEN** o chamado é aberto com sucesso sem interrupção para o usuário

#### Scenario: Registro de rastreabilidade
- **WHEN** qualquer chamado de TI é aberto via intranet
- **THEN** o log de debug SHALL registrar qual `funcionario_id` foi resolvido para `id_responsavel_tecnico` e qual `tecnico_id` foi usado para `id_tecnico` da OS
