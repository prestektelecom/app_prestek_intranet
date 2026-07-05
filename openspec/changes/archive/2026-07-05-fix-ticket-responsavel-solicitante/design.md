## Context

Ao abrir chamados de TI, a intranet cria um ticket no IXC Soft (`su_ticket`) e em seguida uma OS (`su_oss_chamado`). O campo **`id_responsavel_tecnico`** do ticket é o que o IXC exibe como **"Colaborador responsável"** no painel de atendimento. Atualmente esse campo recebe o ID do técnico de TI selecionado (Marcio ou Everton), fazendo com que o chamado pareça ter sido aberto pelo próprio técnico.

Uma tentativa anterior de correção colocou o ID do colaborador solicitante no campo `id_tecnico` da OS, que o IXC rejeita com erro de validação de setor ("O colaborador selecionado não está vinculado ao setor dessa O.S."), pois usuários comuns não são técnicos cadastrados no setor de TI.

O banco local (`usuarios_perfil`) já armazena tanto `usuario_id` quanto `funcionario_id` de todos os colaboradores, sincronizados no login. Todos os colaboradores têm vínculo com um usuário IXC.

## Goals / Non-Goals

**Goals:**
- Exibir o colaborador logado como **"Colaborador responsável"** no ticket (`su_ticket.id_responsavel_tecnico`).
- Manter o técnico de TI selecionado (Marcio/Everton) no campo `id_tecnico` da OS manual (`su_oss_chamado`), garantindo compatibilidade com o setor de TI no IXC.
- Manter o `id_usuarios` do ticket com o `usuario_id` do colaborador logado (já implementado e correto).
- Garantir fallback seguro: se `funcionario_id` não for resolvido, usar o técnico selecionado em `id_responsavel_tecnico`.

**Non-Goals:**
- Alterar o frontend — `TiSupportModal.jsx` já envia os dados corretos.
- Criar novos cadastros no IXC para funcionários.
- Alterar campos de agendamento ou status da OS.

## Decisions

### 1. Campo correto para identificar o solicitante no ticket

- **Opção A:** `id_usuarios` — campo já corretamente preenchido com o `usuario_id` do colaborador, mas no IXC não representa "Colaborador responsável" visualmente.
- **Opção B:** `id_responsavel_tecnico` — campo exibido pelo IXC como "Colaborador responsável" no painel de atendimento.
- **Decisão:** Usar `id_responsavel_tecnico` com o `funcionario_id` do colaborador logado. O IXC aceita qualquer funcionário cadastrado nesse campo (não exige vínculo de setor, ao contrário do `id_tecnico` da OS).

### 2. Onde buscar o `funcionario_id` do solicitante

- **Opção A:** Buscar na API do IXC (`/webservice/v1/funcionarios`) via e-mail — adiciona latência e ponto de falha.
- **Opção B:** Buscar no banco local `usuarios_perfil.funcionario_id` — já populado no login, acesso instantâneo e sem dependência de API externa.
- **Decisão:** Banco local (`usuarios_perfil`), usando a query já existente, apenas redirecionando o resultado para o campo correto.

### 3. Atribuição da OS (`su_oss_chamado.id_tecnico`)

- **Decisão:** O `id_tecnico` da OS **sempre** recebe o `tecnico_id` selecionado (Marcio/Everton). Esse campo exige vínculo de setor no IXC — por isso não pode receber o `funcionario_id` do solicitante.

## Risks / Trade-offs

- **[Risco]** `funcionario_id` nulo no banco local → **[Mitigação]** Fallback: usar `tecnico_id` selecionado em `id_responsavel_tecnico` (comportamento anterior).
- **[Risco]** IXC rejeitar o `funcionario_id` em `id_responsavel_tecnico` por alguma validação desconhecida → **[Mitigação]** O log de debug registra o payload e a resposta do IXC; o fallback é aplicado automaticamente.
- **[Trade-off]** O campo `id_responsavel_tecnico` com o solicitante muda o significado semântico original (técnico responsável → quem abriu). Isso é deliberado e alinhado com a necessidade de rastreabilidade.
