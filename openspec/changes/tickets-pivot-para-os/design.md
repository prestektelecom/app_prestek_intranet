## Context

O IXC Soft modela suporte em duas entidades:

- **`su_ticket`** — o atendimento (chamado). Criado pelo usuário. Tem `id` interno, `protocolo`, `status` (T/F), e pode gerar uma ou mais OSes.
- **`su_oss_chamado`** — a Ordem de Serviço. Gerada a partir do ticket (manualmente neste projeto). Tem `id` próprio, `id_ticket` (FK), `id_tecnico`, `status` granular (AG/A/AS/EN/F/C...) e `mensagem`.

A rota `/api/ixc/su-ticket/list` consulta `su_ticket` e retorna o `id` do atendimento. O usuário quer ver o `id` da OS. A decisão é mudar o endpoint IXC consultado nessa rota — um "pivot de tabela" — e ajustar o frontend para o novo schema de campos.

## Goals / Non-Goals

**Goals:**
- A listagem retorna registros de `su_oss_chamado`, com o `id` sendo o número real da OS
- O status exibido reflete o ciclo de vida da OS (não do ticket)
- A data exibida é a data de agendamento da OS
- O conteúdo da mensagem continua sendo parseado com `parseTicketMessage` (o template é o mesmo)
- Cada registro inclui `id_ticket` para rastreabilidade futura

**Non-Goals:**
- Não alterar a criação de tickets (`TiSupportModal`, `POST /api/ixc/su-ticket`)
- Não exibir histórico de múltiplas OSes por ticket (mostrar a mais recente ou a única)
- Não implementar filtros ou paginação (já funciona com `rp: 100`)
- Não adicionar link para abrir OS no IXC

## Decisions

### Decisão 1: Pivot completo para `su_oss_chamado` (vs. N+1 enriquecimento)
**Escolha**: Trocar o endpoint consultado de `su_ticket` para `su_oss_chamado`.

**Motivo**: 1 request IXC em vez de N+1. Mais simples, mais rápido, sem lógica de enriquecimento. A API IXC aceita filtro por `su_oss_chamado.id_tecnico` (confirmado em `test-ixc-os2.js`).

**Alternativa descartada**: Para cada ticket retornado, buscar sua OS via `id_ticket` — criaria N+1 requests e complexidade desnecessária.

### Decisão 2: Manter o campo `id_tecnico` como filtro (mesmo semântica do `id_responsavel_tecnico` do ticket)
**Escolha**: Filtrar por `su_oss_chamado.id_tecnico = colaborador_id`.

**Motivo**: O fluxo de criação (`server.js` linha 1857) já define `id_responsavel_tecnico` do ticket com o mesmo `ixc_func_id` que é atribuído como `id_tecnico` da OS criada manualmente. São o mesmo valor, apenas em tabelas diferentes.

### Decisão 3: Status agrupados em 3 categorias no frontend
**Escolha**: `AG/A/AS/EN/AN/EX` → "Aberto" (azul), `F` → "Finalizado" (verde), `C` → "Cancelado" (vermelho).

**Motivo**: Simplicidade para o usuário final. O detalhe granular de status existe no IXC; na intranet o técnico só precisa saber: ainda ativo? concluído? cancelado?

### Decisão 4: Campo `data_agenda` para a coluna Data
**Escolha**: Exibir `row.data_agenda` (data de agendamento da OS).

**Motivo**: É a data mais relevante para o técnico — quando a OS está programada para ser atendida. Formato já é `YYYY-MM-DD HH:mm:ss`, parseable pelo `Date` nativo.

### Decisão 5: `parseTicketMessage` reutilizado sem mudança
**Escolha**: Manter a função e apontar para `row.mensagem` em vez de `row.menssagem`.

**Motivo**: O backend salva o mesmo `mensagemFormatada` na OS (server.js linha 1960). O parser já reconhece o template `====DESCREVA A SITUAÇÃO:====`.

## Risks / Trade-offs

- **[Risco médio] Técnico sem OSes retorna lista vazia** → Aceitável — se não há OS, não há trabalho a exibir. O estado "Nenhum chamado encontrado" já existe.
- **[Risco baixo] Múltiplas OSes por ticket** → A API retorna todas; o frontend exibe todas como itens separados. Semanticamente correto: cada OS é uma tarefa.
- **[Risco baixo] Campo `id_tecnico` vazio em OSes antigas** → OSes criadas antes dessa rota poderiam ter `id_tecnico` diferente. Escopo é OSes criadas pela intranet, onde o campo é sempre preenchido.
- **[Trade-off] BREAKING** → Qualquer consumer da rota `/api/ixc/su-ticket/list` que dependa do schema atual precisará de ajuste. Atualmente o único consumer é `TicketsList.jsx`.

## Migration Plan

1. Atualizar `backend/server.js` — trocar query na rota `/api/ixc/su-ticket/list`
2. Atualizar `TicketsList.jsx` — `StatusBadge`, contadores, colunas
3. Testar em ambiente dev com dados reais do IXC
4. Verificar que a lista exibe IDs como `#1711411` (OS) e não `#785966` (ticket)
