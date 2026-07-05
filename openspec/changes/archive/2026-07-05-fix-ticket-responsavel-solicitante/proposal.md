## Why

Ao abrir um chamado de suporte de TI pela intranet, o campo **"Colaborador responsável"** exibido no painel do IXC Soft (tabela `su_ticket`, campo `id_responsavel_tecnico`) mostra o técnico selecionado para atendimento (Marcio ou Everton), em vez do colaborador que realmente **abriu** o chamado. A tentativa anterior de correção colocou o ID do solicitante no campo `id_tecnico` da OS (`su_oss_chamado`), o que o IXC rejeita com erro ("colaborador não vinculado ao setor") porque usuários comuns não são técnicos de TI.

## What Changes

- O campo `id_responsavel_tecnico` do ticket (`su_ticket`) passará a receber o `funcionario_id` do colaborador logado na intranet (quem abriu o chamado), buscado no banco local (`usuarios_perfil`).
- O campo `id_tecnico` da OS manual (`su_oss_chamado`) continuará recebendo o ID do técnico de TI selecionado (Marcio/Everton), que é quem executará o atendimento e está vinculado ao setor correto no IXC.
- O campo `id_usuarios` do ticket (`su_ticket`) também continuará com o `usuario_id` do colaborador logado (comportamento já implementado e correto).
- Fallback seguro: caso o `funcionario_id` do solicitante não seja encontrado no banco local, o `id_responsavel_tecnico` do ticket usará o técnico selecionado (comportamento anterior).

## Capabilities

### New Capabilities
<!-- Nenhuma nova capability -->

### Modified Capabilities
- `ti-modal-solicitante-selector`: O campo `id_responsavel_tecnico` do ticket (`su_ticket`) passa a refletir o `funcionario_id` do colaborador logado (solicitante), enquanto o `id_tecnico` da OS (`su_oss_chamado`) continua com o técnico de TI selecionado para execução.

## Impact

- **Backend**: Rota `POST /api/ixc/su-ticket` em `backend/server.js` — ajustar a atribuição de `id_responsavel_tecnico` na criação do ticket e garantir que `id_tecnico` da OS permaneça sempre com o técnico de TI selecionado.
- **Frontend**: Nenhuma alteração necessária — o `TiSupportModal.jsx` já envia `colaborador_id` e `email_solicitante` corretamente no payload.
