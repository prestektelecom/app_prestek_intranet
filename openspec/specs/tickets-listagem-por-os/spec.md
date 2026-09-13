# tickets-listagem-por-os Specification

## Purpose

A listagem "Meus Chamados" (`TicketsList.jsx`): mostra ao colaborador as Ordens de Serviço (OS) abertas em seu nome no IXC Soft, com o ID que ele reconhece do sistema, não o ID interno do atendimento.

## Requirements

### Requirement: Listagem de chamados baseada em Ordens de Serviço
A rota `POST /api/ixc/su-ticket/list` SHALL consultar a tabela `su_oss_chamado` do IXC filtrando por `id_tecnico = colaborador_id`, retornando as OSes do técnico em vez dos atendimentos (`su_ticket`). Cada registro retornado SHALL incluir pelo menos: `id` (ID da OS), `id_ticket` (ID do atendimento original), `mensagem`, `status`, `data_agenda`.

#### Scenario: Backend retorna registros de su_oss_chamado
- **WHEN** a rota `/api/ixc/su-ticket/list` é chamada com `colaborador_id` válido
- **THEN** o array `tickets` na resposta contém registros de `su_oss_chamado` (não de `su_ticket`), com campo `id` sendo o ID da OS

#### Scenario: Lista ordenada pela OS mais recente primeiro
- **WHEN** a rota retorna registros
- **THEN** os registros estão ordenados por `su_oss_chamado.id` descendente

### Requirement: Coluna ID exibe número da OS
A coluna "ID" na tabela de chamados SHALL exibir o `id` da OS (ex: `#1906959`), que é o identificador usado no sistema IXC para referenciar a Ordem de Serviço.

#### Scenario: ID da OS exibido na tabela
- **WHEN** tickets são carregados e exibidos na tabela
- **THEN** a coluna "ID" exibe o valor de `row.id` da OS, não o ID do atendimento

### Requirement: Status da OS com categorias corretas
O `StatusBadge` SHALL mapear os códigos de status de `su_oss_chamado` para quatro categorias visuais, cada uma com sua própria cor semântica do tema ativo: "Aberto" (tom de destaque/accent), "Finalizado" (tom de sucesso), "Cancelado" (tom de perigo) e "Pendente" (tom de aviso, categoria de fallback para status não mapeados).

#### Scenario: Status AG mapeado como Aberto
- **WHEN** um registro tem `status = 'AG'` (Agendada)
- **THEN** o badge exibe "Aberto" com a cor de destaque do tema (`C.accentSoft`/`C.accentDeep`)

#### Scenario: Outros status abertos mapeados corretamente
- **WHEN** um registro tem `status` em `['A', 'AS', 'EN', 'AN', 'EX']`
- **THEN** o badge exibe "Aberto"

#### Scenario: Status F mapeado como Finalizado
- **WHEN** um registro tem `status = 'F'`
- **THEN** o badge exibe "Finalizado" com a cor de sucesso do tema (`C.successSoft`/`C.success`)

#### Scenario: Status C mapeado como Cancelado
- **WHEN** um registro tem `status = 'C'`
- **THEN** o badge exibe "Cancelado" com a cor de perigo do tema (`C.dangerSoft`/`C.danger`)

### Requirement: Contadores do hero refletem status de OS
Os KPIs no `TicketsHero` SHALL contar com base nos status da OS: "Abertos" conta `AG/A/AS/EN/AN/EX`, "Finalizados" conta `F`, "Pendentes" conta qualquer status que não seja "Aberto" nem "Finalizado" (incluindo `C`/Cancelado, que também aparece com sua própria categoria de filtro).

#### Scenario: Contador de abertos soma status AG/A/AS/EN/AN/EX
- **WHEN** há registros com status AG, A, AS, EN, AN e EX
- **THEN** o KPI "Abertos" exibe a soma de todos eles

#### Scenario: Contador de finalizados conta apenas F
- **WHEN** há registros com status F
- **THEN** o KPI "Finalizados" exibe apenas esses

### Requirement: Data da OS exibida como data de agendamento
A coluna "Data" SHALL exibir `row.data_agenda` da OS, formatada para `pt-BR` (dd/mm/aaaa), com fallback para a data embutida no protocolo quando `data_agenda` estiver ausente.

#### Scenario: Data de agendamento formatada
- **WHEN** um registro tem `data_agenda = '2026-07-20 10:00:00'`
- **THEN** a coluna "Data" exibe `20/07/2026`

### Requirement: Mensagem da OS parseada corretamente
A coluna "Assunto" SHALL usar `parseTicketMessage(row.mensagem)` para extrair o conteúdo limpo do template de chamado, removendo delimitadores e labels de seção.

#### Scenario: Mensagem extraída do template
- **WHEN** `row.mensagem` contém o template `====DESCREVA A SITUAÇÃO:====...====`
- **THEN** a coluna exibe apenas o texto da situação, sem os delimitadores ou labels

### Requirement: KPI "Pendentes" consistente com o filtro
O KPI "Pendentes" do hero SHALL contar estritamente os registros cuja categoria de status seja `pendente`, a mesma base usada pelo filtro "Pendentes" — não SHALL incluir registros `cancelado`.

#### Scenario: Hero e filtro concordam
- **WHEN** existe pelo menos um chamado com status `cancelado`
- **THEN** o KPI "Pendentes" não inclui esse chamado na contagem, e o filtro "Cancelados" o exibe separadamente

### Requirement: Pills de filtro acessíveis e com contraste correto
Os pills de filtro de status SHALL expor `aria-pressed` refletindo o estado ativo, SHALL exibir um indicador de foco visível ao navegar por teclado, e SHALL ter área de toque efetiva de no mínimo 44px.

O pill no estado ativo SHALL usar um tom de texto que passa 4,5:1 de contraste em todos os cinco temas (`C.onAccent`), não um token que só coincide com o valor correto em alguns temas.

#### Scenario: Pill ativo legível nos cinco temas
- **WHEN** um pill de filtro está no estado ativo, em qualquer tema
- **THEN** seu contraste de texto contra o fundo é de no mínimo 4,5:1

#### Scenario: Estado do pill anunciado
- **WHEN** um leitor de tela encontra um pill de filtro
- **THEN** o estado ativo/inativo é anunciado via `aria-pressed`
