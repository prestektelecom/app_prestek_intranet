## MODIFIED Requirements

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
