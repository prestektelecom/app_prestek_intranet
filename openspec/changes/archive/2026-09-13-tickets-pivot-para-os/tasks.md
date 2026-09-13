## 1. Backend — Rota de Listagem

- [x] 1.1 Em `backend/server.js` (rota `POST /api/ixc/su-ticket/list`), trocar `url` de `/webservice/v1/su_ticket` para `/webservice/v1/su_oss_chamado`
- [x] 1.2 Trocar `qtype` de `'su_ticket.id_responsavel_tecnico'` para `'su_oss_chamado.id_tecnico'`
- [x] 1.3 Trocar `sortname` de `'su_ticket.id'` para `'su_oss_chamado.id'`

## 2. Frontend — StatusBadge

- [x] 2.1 Ampliar `StatusBadge` para mapear `AG`, `A`, `AS`, `EN`, `AN`, `EX` → "Aberto" (azul)
- [x] 2.2 Manter mapeamento `F` → "Finalizado" (verde)
- [x] 2.3 Adicionar mapeamento `C` → "Cancelado" (cor `C.danger` / `C.dangerSoft`)
- [x] 2.4 Remover o case `'T'` (não existe em `su_oss_chamado.status`)

## 3. Frontend — Contadores do Hero

- [x] 3.1 Atualizar cálculo de `abertos`: de `t.status === 'T'` para `['AG','A','AS','EN','AN','EX'].includes(t.status)`
- [x] 3.2 Manter cálculo de `finalizados`: `t.status === 'F'`
- [x] 3.3 Atualizar cálculo de `pendentes`: qualquer status fora de abertos e finalizados (inclui `C`)

## 4. Frontend — Colunas da Tabela

- [x] 4.1 Coluna "Assunto": mudar `key` de `'titulo'` para `'mensagem'`, manter `render` com `parseTicketMessage`
- [x] 4.2 Coluna "Mensagem": removida (o conteúdo já está no Assunto)
- [x] 4.3 Coluna "Data": mudar `key` de `'data_criacao'` para `'data_agenda'`, `formatTicketDate` usa `row.data_agenda`
- [x] 4.4 Coluna "ID": `key: 'id'` continua correto (agora é o ID da OS ✅)

## 5. Utilitário — formatTicketDate

- [x] 5.1 `formatTicketDate` lê `row.data_agenda` como campo primário
- [x] 5.2 Fallback via `row.protocolo` mantido para casos sem `data_agenda`

## 6. Verificação

- [x] 6.1 Confirmado ao vivo (2026-09-13, Fase 8): lista exibe IDs no formato `#1906959` (OS), não mais o ID do atendimento interno
- [x] 6.2 Confirmado ao vivo: badges de status funcionam para os filtros Abertos/Finalizados/Cancelados/Pendentes/Todos, com dado real de produção (1000 tickets, 17 abertos, 983 finalizados)
- [x] 6.3 Confirmado ao vivo: datas exibidas (`data_agenda`) renderizam corretamente
- [x] 6.4 Confirmado ao vivo: KPI "Abertos" do hero bate com a contagem filtrada

### Nota de reconciliação (2026-09-13, Fase 8)

Esta change estava com todas as 20 tarefas desmarcadas, mas `TicketsList.jsx` e `backend/server.js` já implementam a mudança integralmente — o arquivo foi reescrito em algum momento entre sessões (mesmo padrão já visto em `Dashboard.jsx`, Fase 3, e `colaboradores-reformulacao-visual`, Fase 6). A reescrita foi além do proposto originalmente: o frontend ganhou um hero com KPIs e uma barra de filtros com 5 categorias (Abertos/Finalizados/Cancelados/Pendentes/Todos), não apenas a tabela simples descrita na proposta original. Verificado e arquivado como concluído antes de iniciar a Fase 8 do programa Impeccable.
