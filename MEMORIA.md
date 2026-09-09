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

- [ ] Impeccable Fase 1 (chrome), rodada `colorize` **aplicada mas não verificada no navegador** (12 arquivos modificados, sem commit): tokens `dangerFill`/`onDanger`/`warningFill`/`onWarning`/`onAccent` nos 5 temas (`useBentoTheme.js` + `index.css`), helper `coresDoBadge` + `severidade` em `useComunicados.js`, badges do sino/Sidebar/barra na mesma cor, `NotFound` com `onAccent`, swatches com borda `ink2` e ponto `success`, `ResponsiveTable` sem `muted`. Build do Vite passou; contraste por script passou nos 5 temas (0 falhas). Falta: (1) medir no navegador (o Playwright MCP ficou travado por um Chrome órfão com o perfil `ms-playwright-mcp\mcp-chrome-9c2af76`; encerrar esses `chrome.exe` antes), (2) re-crítica dual-agent do `src/App.jsx` (alvo ≥ 25/40 sem P1), (3) marcar 1.6/1.7 no programa e commitar, (4) Fase 2 (Login + NotFound)
- [ ] Decisão tomada em 2026-09-08: Painel Admin fora do shell fica para a Fase 15, não entra na change do chrome

## Histórico de sessões

- 2026-09-08: configurada integração Obsidian ↔ Claude Code (CLAUDE.md + esta nota).
- 2026-09-08: Fase 1 do Impeccable re-verificada. Re-audit do chrome 9 → 15/20 (portão passado); re-crítica 19 → 24/40 (alvo 25 não atingido; 2 P1: Painel Admin fora do shell, badge de urgência 3,9:1). Relatório em `docs/impeccable/audit-chrome-2026-09-08.md`. Commitado pelo Felix ("Memoria atualizada", f66902a).
- 2026-09-08 (noite): rodada `colorize` do chrome aplicada no working tree, interrompida antes da verificação no navegador. Servidores de dev (5000/3001) podem ter ficado no ar.
