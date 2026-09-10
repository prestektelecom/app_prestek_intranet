---
tags: [projeto, prestek, claude-memoria]
repo: https://github.com/felixskmarcio/prestek_intranet
---

# Prestek Intranet — memória do projeto

React/Vite/Tailwind + Express/PG/Redis + integração IXC.

> Esta nota é a memória persistente do Claude Code para o projeto. Ela é importada
> pelo `CLAUDE.md` e carregada em toda sessão. Pode ser editada livremente pelo
> Obsidian (o projeto fica dentro do vault); o Claude também escreve aqui.
> Nota-índice no vault: [[prestek-intranet]].

## O que é

Portal interno da Prestek: comunicados, ramais e serviços, chamados de TI
(via IXC) e plantões. Detalhes técnicos em `CONTEXTO_IA.md`, convenções de
responsividade em `AGENTS.md`, design em `DESIGN.md`.

## Ambiente

- Código local: `F:\vault\20 Projetos\prestek_intranet` (dentro do vault Obsidian)
- Produção: `/root/prestek_intranet`

## Decisões

- Cores: #F5F9FF / #EC7D23; z-index definido em DESIGN.md §6
- 2026-09-08: memória persistente do Claude Code fica nesta nota, importada via
  `@MEMORIA.md` no `CLAUDE.md`. Imports de fora da pasta do projeto não carregam,
  por isso a nota mora aqui e não em `20 Projetos/prestek-intranet.md`.

## Pendências

- [ ] Impeccable: **Fase 1 (chrome) fechada**. Próximo: Fase 2 (Login + NotFound), tarefas 2.1 a 2.6 em `openspec/changes/programa-impeccable/tasks.md`. Levar para a Fase 2 os P2 do chrome que tocam o NotFound: header diz "Painel Admin" na tela de sem-permissão, "Mais" acende embaixo, Lottie do 404 preto no escuro
- [ ] Antes da Fase 16: decidir a arquitetura da Sidebar (grupos por frequência: "Dia a dia" / "Empresa" / "Administração"), apontada como P2 nas duas últimas críticas
- [ ] Arquivar a change `impeccable-chrome` (o `openspec archive` falha com EPERM nesta máquina; mover à mão para `changes/archive/`)

## Decisões (Impeccable)

- 2026-09-08: Painel Admin renderizado fora do shell fica para a Fase 15, não entra na change do chrome.
- 2026-09-08: badges preenchidos usam o par `dangerFill`/`onDanger` ou `warningFill`/`onWarning` do tema (Badge Pair Rule no DESIGN.md); texto pequeno sobre laranja é `onAccent`, nunca branco.

## Histórico de sessões

- 2026-09-08: configurada integração Obsidian ↔ Claude Code (CLAUDE.md + esta nota).
- 2026-09-08: Fase 1 do Impeccable re-verificada. Re-audit do chrome 9 → 15/20 (portão passado); re-crítica 19 → 24/40 (alvo 25 não atingido; 2 P1: Painel Admin fora do shell, badge de urgência 3,9:1). Relatório em `docs/impeccable/audit-chrome-2026-09-08.md`. Commitado pelo Felix ("Memoria atualizada", f66902a).
- 2026-09-08 (noite): rodada `colorize` do chrome aplicada; commitada pelo Felix (`de5733d`).
- 2026-09-09: `colorize` verificado no navegador nos 5 temas; 3ª crítica 27/40 com 3 P1 de teclado, corrigidos (`harden`: foco preso no sheet, Escape em captura, skip link, trilho do toggle) e verificados. Fase 1 fechada. Dica operacional: se o Playwright MCP acusar "Browser is already in use", matar os `chrome.exe` com `--user-data-dir=...ms-playwright-mcp\mcp-chrome-*`.
