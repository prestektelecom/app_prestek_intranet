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
- [ ] Otimizar `Logo.webp` (316 KB, 1616×1087) para um recorte menor no Login: painel usa 168×113, formulário mobile usa 48×32. Gerar `Logo_480.webp` (~16 KB) e apontar `LoginForm.jsx`/`LoginBrandPanel.jsx` para ele. Não é bloqueio, é otimização de peso (P3 registrado na crítica de 2026-09-10).

- [ ] Impeccable: **Fases 1 (chrome) e 2 (Login + NotFound) fechadas**. Próximo: Fase 3 (Dashboard), tarefas 3.1 a 3.8 em `openspec/changes/programa-impeccable/tasks.md` — inclui resolver `dashboard-hero-slideshow` (23/30) e reabrir os 3 P0 do snapshot de crítica fechado em 2026-09-07T13-39-40Z (horário de plantão inventado, `sem_dados` tratado como erro, comunicados sem teclado)
- [ ] Antes da Fase 16: decidir a arquitetura da Sidebar (grupos por frequência: "Dia a dia" / "Empresa" / "Administração"), apontada como P2 nas duas últimas críticas do chrome
- [x] Arquivar a change `impeccable-chrome` — 2026-09-10: 10 deltas sincronizados em `openspec/specs/` (4 novas, 3 modificadas, 3 apagadas) e pasta movida para `changes/archive/2026-09-10-impeccable-chrome`
- [x] Arquivar a change `impeccable-login` — 2026-09-10: 5 deltas sincronizados em `openspec/specs/` (3 novas: login-screen, login-api, not-found-screen; 2 modificadas: chrome-header-context, mobile-bottom-navigation); pasta movida para `changes/archive/2026-09-10-impeccable-login` (via copy+rm, o `mv` deu EPERM de novo)

## Decisões (Impeccable)

- 2026-09-08: Painel Admin renderizado fora do shell fica para a Fase 15, não entra na change do chrome.
- 2026-09-08: badges preenchidos usam o par `dangerFill`/`onDanger` ou `warningFill`/`onWarning` do tema (Badge Pair Rule no DESIGN.md); texto pequeno sobre laranja é `onAccent`, nunca branco.
- 2026-09-10 (Fase 2, Login): escopo completo (P0 + 4 P1 + Lottie + mobile); painel esquerdo vira painel da marca com o `Logo.webp` e os anéis de sinal (Lottie de 14 MB sai); "Lembrar senha" vira "Manter conectado" só com sessão (nunca gravar senha); "Problemas ao acessar?" vira a frase "Fale com a TI para recuperar o acesso." sem link, até existir um contato oficial.
- 2026-09-10: `/api/login` distingue "Usuário não encontrado." de "Senha incorreta." (enumeração de e-mail aceita numa intranet interna); backend nunca mais expõe `erro.message` cru ao cliente (regra a seguir nas próximas rotas tocadas).
- 2026-09-10: `lottie-react` removido do projeto (só sobrava como dependência transitiva de `LottieAvatar`); `lottie-web` declarado direto no `package.json`.

## Histórico de sessões

- 2026-09-08: configurada integração Obsidian ↔ Claude Code (CLAUDE.md + esta nota).
- 2026-09-08: Fase 1 do Impeccable re-verificada. Re-audit do chrome 9 → 15/20 (portão passado); re-crítica 19 → 24/40 (alvo 25 não atingido; 2 P1: Painel Admin fora do shell, badge de urgência 3,9:1). Relatório em `docs/impeccable/audit-chrome-2026-09-08.md`. Commitado pelo Felix ("Memoria atualizada", f66902a).
- 2026-09-08 (noite): rodada `colorize` do chrome aplicada; commitada pelo Felix (`de5733d`).
- 2026-09-09: `colorize` verificado no navegador nos 5 temas; 3ª crítica 27/40 com 3 P1 de teclado, corrigidos (`harden`: foco preso no sheet, Escape em captura, skip link, trilho do toggle) e verificados. Fase 1 fechada. Dica operacional: se o Playwright MCP acusar "Browser is already in use", matar os `chrome.exe` com `--user-data-dir=...ms-playwright-mcp\mcp-chrome-*`.
- 2026-09-10: Fase 2 completa (Login + NotFound). Audit 6 → 15/20; crítica em duas rodadas 16 → 24 → 31/40 (0 P0/P1 no fim). Corrigido: exceção crua do backend em e-mail inexistente, formulário sem autofill/nome acessível, senha em claro no localStorage, tela inteira fora do sistema de tokens, copy fabricada ("Prestek Inc.", "SSO · SAML 2.0"), Lottie de 14 MB (removido, virou painel estático com `Logo.webp` + gradiente do hero), anel de foco ausente nos campos de texto, contraste do erro no tema Cyber-Obsidian. Duas changes (`impeccable-chrome`, `impeccable-login`) arquivadas e specs sincronizadas. Commitado ao final da sessão.
