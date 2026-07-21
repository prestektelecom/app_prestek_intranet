## ADDED Requirements

### Requirement: Listagem de chamados baseada em Ordens de Serviço
A rota `POST /api/ixc/su-ticket/list` SHALL consultar a tabela `su_oss_chamado` do IXC filtrando por `id_tecnico = colaborador_id`, retornando as OSes do técnico em vez dos atendimentos (`su_ticket`). Cada registro retornado SHALL incluir pelo menos: `id` (ID da OS), `id_ticket` (ID do atendimento original), `mensagem`, `status`, `data_agenda`.

#### Scenario: Backend retorna registros de su_oss_chamado
- **WHEN** a rota `/api/ixc/su-ticket/list` é chamada com `colaborador_id` válido
- **THEN** o array `tickets` na resposta contém registros de `su_oss_chamado` (não de `su_ticket`), com campo `id` sendo o ID da OS

#### Scenario: Lista ordenada pela OS mais recente primeiro
- **WHEN** a rota retorna registros
- **THEN** os registros estão ordenados por `su_oss_chamado.id` descendente

### Requirement: Coluna ID exibe número da OS
A coluna "ID" na tabela de chamados SHALL exibir o `id` da OS (ex: `#1711411`), que é o identificador usado no sistema IXC para referenciar a Ordem de Serviço.

#### Scenario: ID da OS exibido na tabela
- **WHEN** tickets são carregados e exibidos na tabela
- **THEN** a coluna "ID" exibe o valor de `row.id` da OS (ex: `#1711411`), não o ID do atendimento

### Requirement: Status da OS com categorias corretas
O `StatusBadge` SHALL mapear os códigos de status de `su_oss_chamado` para três categorias visuais: "Aberto" (azul), "Finalizado" (verde), "Cancelado" (vermelho).

#### Scenario: Status AG mapeado como Aberto
- **WHEN** um registro tem `status = 'AG'` (Agendada)
- **THEN** o badge exibe "Aberto" com cor azul (`accentSoft`/`accentDeep`)

#### Scenario: Outros status abertos mapeados corretamente
- **WHEN** um registro tem `status` em `['A', 'AS', 'EN', 'AN', 'EX']`
- **THEN** o badge exibe "Aberto" com cor azul

#### Scenario: Status F mapeado como Finalizado
- **WHEN** um registro tem `status = 'F'`
- **THEN** o badge exibe "Finalizado" com cor verde (`successSoft`/`success`)

#### Scenario: Status C mapeado como Cancelado
- **WHEN** um registro tem `status = 'C'`
- **THEN** o badge exibe "Cancelado" com cor vermelha (`dangerSoft`/`danger`)

### Requirement: Contadores do hero refletem status de OS
Os KPIs no `TicketsHero` SHALL contar com base nos status da OS: "Abertos" conta `AG/A/AS/EN/AN/EX`, "Finalizados" conta `F`, "Pendentes" conta qualquer outro status não mapeado (ex: `C`).

#### Scenario: Contador de abertos soma status AG/A/AS/EN/AN/EX
- **WHEN** há registros com status AG, A, AS, EN, AN e EX
- **THEN** o KPI "Abertos" exibe a soma de todos eles

#### Scenario: Contador de finalizados conta apenas F
- **WHEN** há registros com status F
- **THEN** o KPI "Finalizados" exibe apenas esses

### Requirement: Data da OS exibida como data de agendamento
A coluna "Data" SHALL exibir `row.data_agenda` da OS, formatada para `pt-BR` (dd/mm/aaaa).

#### Scenario: Data de agendamento formatada
- **WHEN** um registro tem `data_agenda = '2026-07-20 10:00:00'`
- **THEN** a coluna "Data" exibe `20/07/2026`

### Requirement: Mensagem da OS parseada corretamente
A coluna "Mensagem" SHALL usar `parseTicketMessage(row.mensagem)` (sem duplo s) para extrair o conteúdo limpo do template de chamado.

#### Scenario: Mensagem extraída do template
- **WHEN** `row.mensagem` contém o template `====DESCREVA A SITUAÇÃO:====...====`
- **THEN** a coluna exibe apenas o texto da situação, sem os delimitadores ou labels
