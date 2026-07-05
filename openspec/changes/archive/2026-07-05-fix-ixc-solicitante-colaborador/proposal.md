## Why

Atualmente, ao abrir um chamado de suporte de TI na intranet, a OS criada no IXC Soft registra o técnico selecionado (ex: MARCIO ou EVERTON) no campo `id_tecnico` ("Colaborador responsável"). Com isso, o campo exibe o nome do técnico como se ele fosse o criador/solicitante do chamado, indevidamente, em vez de exibir o colaborador logado que realmente solicitou o atendimento. A ideia é que a OS mostre o colaborador logado como solicitante ("Colaborador responsável") e ainda assim seja agendada para o técnico selecionado para atendimento.

## What Changes

- O frontend passará o e-mail do usuário logado na intranet no payload da requisição de abertura de chamado (`POST /api/ixc/su-ticket`).
- O backend buscará o ID de técnico/funcionário do usuário logado no IXC Soft a partir de seu e-mail (resolvendo via API `/webservice/v1/usuarios`).
- Caso o usuário seja encontrado no IXC, a OS manual será criada com `id_tecnico` associado ao ID do usuário logado que abriu o chamado. O técnico selecionado para atendimento (ex: MARCIO/EVERTON) continuará sendo associado no ticket (`id_responsavel_tecnico`).
- Caso o usuário logado não seja encontrado no IXC (ou não tenha e-mail), o sistema manterá o comportamento atual de fallback, associando o técnico selecionado à OS.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capability de especificação -->

### Modified Capabilities
- `ti-modal-solicitante-selector`: O campo de técnico da OS (`id_tecnico` / "Colaborador responsável") passa a refletir o ID do colaborador logado solicitante (se disponível no IXC), enquanto o agendamento da OS reflete o técnico selecionado para atendimento.

## Impact

- **Backend**: Rota `POST /api/ixc/su-ticket` no `backend/server.js` para buscar o e-mail do usuário no IXC e ajustar a atribuição de `id_tecnico` na criação da OS manual.
- **Frontend**: `src/components/TiSupportModal.jsx` para enviar o e-mail do usuário logado no payload da requisição.
