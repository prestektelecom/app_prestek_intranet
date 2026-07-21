## 1. Backend — Rota de Listagem

- [ ] 1.1 Em `backend/server.js` (rota `POST /api/ixc/su-ticket/list`), trocar `url` de `/webservice/v1/su_ticket` para `/webservice/v1/su_oss_chamado`
- [ ] 1.2 Trocar `qtype` de `'su_ticket.id_responsavel_tecnico'` para `'su_oss_chamado.id_tecnico'`
- [ ] 1.3 Trocar `sortname` de `'su_ticket.id'` para `'su_oss_chamado.id'`

## 2. Frontend — StatusBadge

- [ ] 2.1 Ampliar `StatusBadge` para mapear `AG`, `A`, `AS`, `EN`, `AN`, `EX` → "Aberto" (azul)
- [ ] 2.2 Manter mapeamento `F` → "Finalizado" (verde)
- [ ] 2.3 Adicionar mapeamento `C` → "Cancelado" (cor `C.danger` / `C.dangerSoft`)
- [ ] 2.4 Remover o case `'T'` (não existe em `su_oss_chamado.status`)

## 3. Frontend — Contadores do Hero

- [ ] 3.1 Atualizar cálculo de `abertos`: de `t.status === 'T'` para `['AG','A','AS','EN','AN','EX'].includes(t.status)`
- [ ] 3.2 Manter cálculo de `finalizados`: `t.status === 'F'`
- [ ] 3.3 Atualizar cálculo de `pendentes`: qualquer status fora de abertos e finalizados (inclui `C`)

## 4. Frontend — Colunas da Tabela

- [ ] 4.1 Coluna "Assunto": mudar `key` de `'titulo'` para `'mensagem'`, manter `render` com `parseTicketMessage`
- [ ] 4.2 Coluna "Mensagem": remover esta coluna (o conteúdo já está no Assunto) ou ajustar para campo secundário se desejado
- [ ] 4.3 Coluna "Data": mudar `key` de `'data_criacao'` para `'data_agenda'`, atualizar `formatTicketDate` para usar `row.data_agenda`
- [ ] 4.4 Coluna "ID": confirmar que `key: 'id'` continua correto (agora é o ID da OS ✅)

## 5. Utilitário — formatTicketDate

- [ ] 5.1 Atualizar `formatTicketDate` para ler `row.data_agenda` como campo primário (em vez de `row.data_criacao`)
- [ ] 5.2 Manter fallback via `row.protocolo` para casos sem `data_agenda`

## 6. Verificação

- [ ] 6.1 Confirmar que a lista exibe IDs no formato `#1711411` (OS) em vez de `#785966` (ticket)
- [ ] 6.2 Confirmar que o badge de status funciona para AG, A, F e C
- [ ] 6.3 Confirmar que a data exibida corresponde à data de agendamento da OS
- [ ] 6.4 Confirmar que o KPI "Abertos" no hero soma corretamente os status de OS
