## Context

Intranet React/Vite + Express/PG. Gestão por capacidade já existe (`gate('x')`, `usuarios_permissoes`, lido do banco a cada requisição). Auditoria via `registrarAuditoria`. Não há staging: o backend local já fala com o banco de produção.

## Goals / Non-Goals

**Goals:** canal simples de sugestões com status; gestão por capacidade; auditoria das mudanças.
**Non-Goals:** anonimato, votação/curtidas, anexos, notificação por e-mail, integração com IXC, comentários em thread.

## Decisions

- **Tabela `sugestoes`** (migration 025, idempotente, sem seed): `id SERIAL`, `usuario_id VARCHAR(50)` (FK `usuarios_perfil`), `usuario_nome`, `tipo`, `titulo`, `descricao`, `status` (padrão `nova`), `resposta`, `respondido_por`, `criado_em`, `atualizado_em`; índices em `(usuario_id, criado_em)` e `(status)`. Valores de `tipo`/`status` validados no backend, sem CHECK, como no catálogo de permissões (acrescentar valor não exige migration).
- **Rotas:** `POST /api/sugestoes` e `GET /api/sugestoes/minhas` (qualquer logado); `GET /api/sugestoes` e `PATCH /api/sugestoes/:id` com `gate('sugestoes')`. Autoria sempre de `req.usuario`.
- **Anti-spam:** máximo de 5 envios por usuário em 24 h, contado no banco (sobrevive a reinício, ao contrário de limitador em memória).
- **Auditoria:** `sugestao_status` e `sugestao_resposta` com o id da sugestão; o texto da sugestão não vai para o log.
- **Capacidade `sugestoes`:** entra em `CAPACIDADES` e em `src/constants/permissoes.js`; nenhuma mudança de modelo.
- **Frontend:** view `Sugestoes` com formulário + "Minhas sugestões"; para gestores, uma segunda aba "Todas" com filtros e edição de status/resposta inline (confirmação clara, sem `window.confirm`). Item no menu e na `MobileBottomNav`/"Mais". Reutiliza `PageShell`, `FilterBar`, `ResponsiveTable`.
- **Alternativa rejeitada:** abrir chamado de TI no IXC por sugestão (polui a fila de suporte e depende de contrato válido, ver incidente de 2026-09-17).

## Risks / Trade-offs

- Sem notificação, o autor só vê a resposta ao abrir a tela → aceitável na v1; sino de notificação pode vir depois.
- Texto livre pode conter dado sensível → aviso curto no formulário.
- Teste com `pool` falso não pega erro de SQL → rodar as consultas no banco real (leitura) e aplicar só o arquivo 025.

## Migration Plan

1. Aplicar só `025_sugestoes.sql` em produção via `pg` (nunca `migrations/run.js`).
2. Deploy do backend (reiniciar `pm2 prestek-backend`) e novo build do front.
3. Reverter: `DROP TABLE sugestoes` e remover a capacidade do catálogo; nada mais depende dela.
