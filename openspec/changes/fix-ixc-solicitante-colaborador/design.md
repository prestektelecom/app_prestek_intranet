## Context

Ao abrir chamados de TI, a intranet cria um ticket no IXC Soft (`su_ticket`) e, em seguida, cria uma Ordem de Serviço (`su_oss_chamado`). Atualmente, o campo `id_tecnico` da OS manual é preenchido com o ID do técnico selecionado no frontend (MARCIO ou EVERTON). Isso faz com que no IXC o chamado pareça ter sido aberto pelo próprio técnico (no campo "Colaborador responsável"), impossibilitando rastrear quem realmente solicitou o atendimento diretamente pela OS.

Esta especificação define como passar o e-mail do usuário solicitante, obter seu ID de funcionário no IXC, e atribuí-lo no campo `id_tecnico` da OS, mantendo a atribuição do ticket ao técnico selecionado.

## Goals / Non-Goals

**Goals:**
- Associar a OS (`su_oss_chamado.id_tecnico`) ao ID de funcionário do usuário logado na intranet que abriu o chamado.
- Manter o agendamento e atribuição do ticket (`su_ticket.id_responsavel_tecnico`) para o técnico selecionado para atendimento (ex: MARCIO ou EVERTON).
- Garantir fallback seguro para o técnico selecionado caso o colaborador logado não possua cadastro correspondente no IXC.

**Non-Goals:**
- Criar novos cadastros no IXC para funcionários inexistentes.
- Alterar campos de agendamento na OS (`status: 'AG'`, datas) ou outros vínculos estruturais.

## Decisions

### 1. Envio do E-mail no Payload
- **Opção A:** Buscar o e-mail do usuário no banco local do backend a partir do `colaborador_id`.
- **Opção B:** Enviar o e-mail diretamente do frontend no payload da requisição.
- **Decisão:** Opção B, pois o frontend já possui o objeto `user` completo na sessão (com `user.funcionario.email` ou `user.email`). É mais simples, robusto e evita queries extras no banco local.

### 2. Fluxo de Atribuição no Backend
No backend, faremos a seguinte divisão:
1. `su_ticket`: permanece usando `tecnico_id` (técnico selecionado para atendimento) no campo `id_responsavel_tecnico`.
2. Busca na API `/webservice/v1/usuarios` do IXC Soft usando o `email_solicitante` recebido do frontend.
3. Se encontrar o usuário, extrai o campo `funcionario` e o define como `id_tecnico` da OS manual.
4. Se não encontrar (ou falhar), usa o `tecnico_id` selecionado como fallback no `id_tecnico` da OS (mantendo o comportamento atual).

## Risks / Trade-offs

- **[Risco]** Colaborador logado não tem cadastro no IXC → **[Mitigação]** O código fará fallback seguro usando o técnico selecionado para o campo `id_tecnico`, garantindo que a OS seja criada com sucesso de qualquer forma.
- **[Risco]** Sobrecarga de chamadas à API do IXC → **[Mitigação]** A busca por e-mail é feita uma única vez por abertura de chamado e de forma assíncrona com timeout rápido.
