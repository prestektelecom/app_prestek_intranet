## Why

A coluna "ID" na página "Meus Chamados" exibe o `su_ticket.id` (ID do atendimento interno), mas o usuário quer ver o **ID da OS** (`su_oss_chamado.id`) — o número que aparece no sistema IXC quando o técnico abre a Ordem de Serviço. A origem do problema é estrutural: a rota de listagem consulta `su_ticket`, mas o identificador relevante para o usuário vive em `su_oss_chamado`.

## What Changes

- **BREAKING** — A rota `POST /api/ixc/su-ticket/list` passa a consultar `su_oss_chamado` em vez de `su_ticket`, alterando os campos retornados
- O `id` retornado em cada registro passa a ser o ID da OS (ex: `1711411`) em vez do ID do atendimento (ex: `785966`)
- O campo de texto principal muda de `menssagem` (duplo s, `su_ticket`) para `mensagem` (`su_oss_chamado`) — o conteúdo é o mesmo template formatado
- O campo de data muda de `data_criacao` para `data_agenda`
- O mapeamento de status é ampliado: `AG`, `A`, `AS`, `EN`, `AN`, `EX` → "Aberto"; `F` → "Finalizado"; `C` → "Cancelado" (novo estado)
- Cada registro passa a incluir `id_ticket` (referência ao atendimento original) como informação acessória

## Capabilities

### New Capabilities
- `tickets-listagem-por-os`: A listagem de chamados é pivotada para `su_oss_chamado`, exibindo o ID real da OS e status com semântica correta do ciclo de vida de uma Ordem de Serviço

### Modified Capabilities
_(sem alterações em specs existentes — a listagem de tickets ainda não tem spec arquivada)_

## Impact

- **`backend/server.js`** — rota `POST /api/ixc/su-ticket/list`: trocar endpoint IXC e campos da query
- **`src/components/TicketsList.jsx`** — `StatusBadge`, contadores do hero, colunas da tabela (`key`, `render`)
- **Sem impacto em criação de tickets** (`TiSupportModal` e rota `POST /api/ixc/su-ticket` não mudam)
- **Sem novas dependências externas**
