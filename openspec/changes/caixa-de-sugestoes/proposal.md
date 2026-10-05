## Why

Hoje não existe um canal dentro da intranet para o colaborador sugerir melhorias da própria intranet (ou apontar o que incomoda). As ideias chegam soltas, por conversa ou chamado de TI, e se perdem. Uma caixa de sugestões com status dá visibilidade a quem sugere e fila organizada à TI.

## What Changes

- **Botão flutuante** "Sugerir" (lâmpada), presente em toda tela logada, que abre um **popup** com o formulário (tipo, título, descrição). Não há tela nem item de menu: decisão do Felix em 2026-10-05 (opção A), para reduzir a fricção de enviar.
- Cada sugestão é enviada por e-mail à TI; o acompanhamento é por e-mail. As rotas de gestão (`GET /api/sugestoes`, `PATCH /api/sugestoes/:id`, capacidade `sugestoes`) continuam no backend, mas **sem interface por ora**.
- Tabela local `sugestoes` (migration 025). O IXC não é tocado.
- Nova capacidade `sugestoes` no catálogo de permissões de gestão.
- Mudanças de status e respostas registradas na Auditoria (`sugestao_status`, `sugestao_resposta`).
- Limite de envio por usuário (anti-spam) e textos com tamanho máximo.

## Capabilities

### New Capabilities
- `caixa-de-sugestoes`: envio, acompanhamento e gestão de sugestões de melhoria da intranet.

### Modified Capabilities
- `permissoes-por-capacidade`: o catálogo ganha a capacidade `sugestoes`.

## Impact

- Backend: `backend/server.js` (rotas `/api/sugestoes`), `backend/middleware/permissoes.js` (catálogo), migration `backend/migrations/025_sugestoes.sql` (aplicar só esse arquivo em produção, nunca `run.js` inteiro).
- Frontend: nova view em `src/`, entrada no menu/`MobileBottomNav`/"Mais", `src/constants/permissoes.js`, aba de permissões do Painel Admin (novo rótulo).
- Interface nova: exige `/impeccable` (audit + critique) antes de fechar.
- Sem dependência nova, sem variável de `.env` nova.
