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
- [ ] **Urgente — rotacionar segredos expostos no histórico do git** (achados em 2026-09-11 ao corrigir G2): chave de um projeto Supabase (`lovable_keys.txt`, sem relação com este stack), um token IXC hardcoded (`tmp_check_ti.js`), e as credenciais SSH já sinalizadas em `backend/.env copy.example`. Remover do rastreamento do git não anula a exposição já feita — os valores continuam no histórico até uma reescrita (`git filter-repo`, fora de escopo por enquanto).
- [ ] Decidir sobre push/PR da branch `main` com o commit `1e530a0` (correção de segurança G1-G6) — commitado localmente em 2026-09-11, ainda não enviado ao remoto por decisão do Felix.
- [ ] Otimizar `Logo.webp` (316 KB, 1616×1087) para um recorte menor no Login: painel usa 168×113, formulário mobile usa 48×32. Gerar `Logo_480.webp` (~16 KB) e apontar `LoginForm.jsx`/`LoginBrandPanel.jsx` para ele. Não é bloqueio, é otimização de peso (P3 registrado na crítica de 2026-09-10).

- [x] Impeccable: **Fases 1 (chrome), 2 (Login + NotFound), 3 (Dashboard) e 4 (Plantão) fechadas**. Próximo: Fase 5 (Comunicados), tarefas 5.1 a 5.6 em `openspec/changes/programa-impeccable/tasks.md`
- [ ] Antes da Fase 16: decidir a arquitetura da Sidebar (grupos por frequência: "Dia a dia" / "Empresa" / "Administração"), apontada como P2 nas duas últimas críticas do chrome
- [x] Arquivar a change `impeccable-chrome` — 2026-09-10: 10 deltas sincronizados em `openspec/specs/` (4 novas, 3 modificadas, 3 apagadas) e pasta movida para `changes/archive/2026-09-10-impeccable-chrome`
- [x] Arquivar a change `impeccable-login` — 2026-09-10: 5 deltas sincronizados em `openspec/specs/` (3 novas: login-screen, login-api, not-found-screen; 2 modificadas: chrome-header-context, mobile-bottom-navigation); pasta movida para `changes/archive/2026-09-10-impeccable-login` (via copy+rm, o `mv` deu EPERM de novo)
- [x] Arquivar a change `impeccable-dashboard` — 2026-09-11: 3 deltas sincronizados (2 requisitos novos em `dashboard-view`, 1 em `ti-modal-solicitante-selector`; `dashboard-customization` removida por completo); pasta movida para `changes/archive/2026-09-11-impeccable-dashboard`
- [x] Arquivar as changes `modernizar-visao-geral-escala` e `escala-botao-criar-plantao` (Fase 4, tarefa 4.1) — 2026-09-11/12: `archive/2026-09-11-modernizar-visao-geral-escala` (4 requisitos renomeados via REMOVED+ADDED) e `archive/2026-09-11-escala-botao-criar-plantao`
- [x] Arquivar a change `impeccable-plantao` — 2026-09-12: 2 deltas sincronizados (`escala-criar-plantao-cta` modificado, `escala-ui-redesign` com 1 requisito novo de trap de foco + 1 modificado de dark mode); pasta movida para `changes/archive/2026-09-12-impeccable-plantao`

## Decisões (Impeccable)

- 2026-09-08: Painel Admin renderizado fora do shell fica para a Fase 15, não entra na change do chrome.
- 2026-09-08: badges preenchidos usam o par `dangerFill`/`onDanger` ou `warningFill`/`onWarning` do tema (Badge Pair Rule no DESIGN.md); texto pequeno sobre laranja é `onAccent`, nunca branco.
- 2026-09-10 (Fase 2, Login): escopo completo (P0 + 4 P1 + Lottie + mobile); painel esquerdo vira painel da marca com o `Logo.webp` e os anéis de sinal (Lottie de 14 MB sai); "Lembrar senha" vira "Manter conectado" só com sessão (nunca gravar senha); "Problemas ao acessar?" vira a frase "Fale com a TI para recuperar o acesso." sem link, até existir um contato oficial.
- 2026-09-10: `/api/login` distingue "Usuário não encontrado." de "Senha incorreta." (enumeração de e-mail aceita numa intranet interna); backend nunca mais expõe `erro.message` cru ao cliente (regra a seguir nas próximas rotas tocadas).
- 2026-09-10: `lottie-react` removido do projeto (só sobrava como dependência transitiva de `LottieAvatar`); `lottie-web` declarado direto no `package.json`.
- 2026-09-11 (Fase 3, Dashboard): grid do Dashboard fica fixo por decisão, não reativado. `isDraggable`/`isResizable` continuam `false`; o PRODUCT.md e a spec `dashboard-customization` foram atualizados para não descrever mais isso como capacidade ativa. Os endpoints de backend `/api/user/dashboard-layout` permanecem no código, sem uso, caso a capacidade volte a ser considerada no futuro.
- 2026-09-11: escopo da change `impeccable-dashboard` limitado a P0 + P1 por decisão do Felix; os P2/P3 (nome de aniversariante com anotação do IXC, fetches redundantes de comunicados/departamentos, links mortos do rodapé, teto do badge de variação, tamanhos de fonte) ficam registrados no audit para uma rodada de polish futura, não entram nesta change.
- 2026-09-12 (Fase 4, Plantão): escopo da change `impeccable-plantao` limitado a P0 + P1 por decisão do Felix (3 P0: sobrescrita silenciosa de data em "Novo Plantão", trap de foco ausente, contraste crítico em `PlantaoHistorico.jsx`; 2 P1: microtipografia fora da rampa, "não atribuído" inconsistente entre N2/Supervisão). P2/P3 (z-index do modal, semântica do diálogo de exclusão, hex remanescente em `HistoricoPreviewModal.jsx`/`SelectEmployee.jsx`, touch targets do mini-calendário, badge "selecionado(s)" na aba Histórico, bug de capitalização "Setembro De 2026") ficam para uma rodada de polish futura.
- 2026-09-12: `toIsoDay(new Date())` é um bug latente sempre que alguém precisar do dia local de "agora" — a função lê campos UTC (pensada para strings "ingênuas" do IXC), então à noite no fuso de Brasília (UTC-3) ela adianta a data em 1 dia. Usar `getFullYear`/`getMonth`/`getDate` diretamente para "hoje" local; achado e corrigido em `openNewPlantao` (Fase 4).

## Decisões (Segurança)

- 2026-09-11: campanha Mantis (`GUIA-CORRECAO.md`, anexado pelo Felix) apontou 6 achados (G1-G6) no backend/frontend. Corrigidos G1 (nenhuma rota `/api/*` exigia login → JWT via `requireAuth`, montado globalmente em `/api` exceto `/login` e `/health`), G5 (admin confiava no header `x-admin-email` vindo do cliente → identidade agora vem de `req.usuario.email`, do JWT verificado), G3 (login sem rate limit → `express-rate-limit`, 5/min), G4 (CORS refletia qualquer origem → whitelist via `CORS_ORIGENS`, default `http://localhost:5000`, a porta real do Vite — o guia supunha 5173, errado). G6 já estava corrigido de sessão anterior. G2 (PII versionada) resolvido destravando os dumps do git e atualizando `.gitignore`; achados 4 arquivos extras com segredos reais não listados no guia (ver Pendências). Commit `1e530a0`, não enviado ao remoto.
- 2026-09-11: frontend injeta `Authorization: Bearer` via patch global de `window.fetch` em `main.jsx` (atalho para não reescrever ~22 pontos de `fetch('/api/...')`), comparando por `pathname` para cobrir tanto chamadas relativas quanto as que montam URL absoluta via `VITE_API_URL`/`localhost:3001` (vários componentes admin faziam isso). O mesmo patch desloga automaticamente em qualquer 401 fora de `/api/login` — sem isso, sessões salvas antes desta mudança ficavam com a tela travada e widgets vazios, sem caminho de volta ao login.

## Histórico de sessões

- 2026-09-08: configurada integração Obsidian ↔ Claude Code (CLAUDE.md + esta nota).
- 2026-09-08: Fase 1 do Impeccable re-verificada. Re-audit do chrome 9 → 15/20 (portão passado); re-crítica 19 → 24/40 (alvo 25 não atingido; 2 P1: Painel Admin fora do shell, badge de urgência 3,9:1). Relatório em `docs/impeccable/audit-chrome-2026-09-08.md`. Commitado pelo Felix ("Memoria atualizada", f66902a).
- 2026-09-08 (noite): rodada `colorize` do chrome aplicada; commitada pelo Felix (`de5733d`).
- 2026-09-09: `colorize` verificado no navegador nos 5 temas; 3ª crítica 27/40 com 3 P1 de teclado, corrigidos (`harden`: foco preso no sheet, Escape em captura, skip link, trilho do toggle) e verificados. Fase 1 fechada. Dica operacional: se o Playwright MCP acusar "Browser is already in use", matar os `chrome.exe` com `--user-data-dir=...ms-playwright-mcp\mcp-chrome-*`.
- 2026-09-10: Fase 2 completa (Login + NotFound). Audit 6 → 15/20; crítica em duas rodadas 16 → 24 → 31/40 (0 P0/P1 no fim). Corrigido: exceção crua do backend em e-mail inexistente, formulário sem autofill/nome acessível, senha em claro no localStorage, tela inteira fora do sistema de tokens, copy fabricada ("Prestek Inc.", "SSO · SAML 2.0"), Lottie de 14 MB (removido, virou painel estático com `Logo.webp` + gradiente do hero), anel de foco ausente nos campos de texto, contraste do erro no tema Cyber-Obsidian. Duas changes (`impeccable-chrome`, `impeccable-login`) arquivadas e specs sincronizadas. Commitado ao final da sessão.
- 2026-09-11: Fase 3 completa (Dashboard). Os 3 P0 de uma crítica anterior (2026-09-07) já estavam corrigidos por uma reescrita do Dashboard entre sessões — nenhuma ação necessária ali. Achado novo: botão "Gerenciar Meus Chamados" branco sobre branco por colisão de classes Tailwind (`bg-surface`/`bg-primary`), invisível no claro mas clicável. Audit 12/20; crítica em duas rodadas 26 → 35/40 (0 P0/P1 no fim). Corrigido: o botão (nova constante `ACTION_BTN_PRIMARY` com `on-accent`, sem herdar a base), `TiSupportModal` sem nenhuma semântica de diálogo (ganhou `role="dialog"`, trap de Tab, Escape, `aria-label` no fechar), o brilho de hover dos 9 cards usando a paleta de demonstração de um componente de terceiro (nova variante `variant="brand"` em `glowing-effect.tsx`), badges de estado com o token errado (`-bento` → `-strong`, incluindo um badge irmão descoberto só na verificação final). Decisão: o grid customizável do PRODUCT.md, hoje travado, fica documentado como fixo, não reativado. `dashboard-hero-slideshow` abandonada (feature já removida numa reescrita anterior, nada a terminar). Achado para a Fase 10: o mesmo `GlowingEffect` sem a variante nova também está em `BentoCard.jsx` (Serviços). `impeccable-dashboard` arquivada e specs sincronizadas.
- 2026-09-11/12: Fase 4 completa (Plantão). Tarefa 4.1: `escala-botao-criar-plantao` implementado (botão "Novo Plantão" no Hero, data editável no `ManagePlantaoModal`, tooltip no calendário) e `modernizar-visao-geral-escala` arquivada; achado e corrigido um bug real de fuso horário em `toIsoDay(new Date())`. Crítica dual-agent 23/40 (Aceitável): 2 P0 (sobrescrita silenciosa de data, sem trap de foco no modal), 2 P1 (microtipografia, "não atribuído" inconsistente); achado do detector: bug de capitalização "Setembro De 2026" (classe `capitalize` do Tailwind maiusculizando a preposição "de"). Audit 9/20 (Ruim): achado crítico não coberto pela crítica — `PlantaoHistorico.jsx` inteiro nunca mudava de tema (`backgroundColor: '#F5F9FF'` inline fixo no wrapper), e a mistura com texto em `var(--foreground)` (tema escuro) produzia contraste ~1:1, texto quase invisível, confirmado ao vivo em Cyber-Obsidian; 117 hex remanescentes em 3 arquivos; touch targets do mini-calendário abaixo de 44px. Escopo da change `impeccable-plantao` (P0+P1) corrigido e verificado ao vivo com Playwright: revalidação de data funcionando nos dois sentidos, trap de foco confirmado com clique real (um teste com `.click()` sintético deu falso alarme), página de histórico corrigida e legível nos temas escuros, tipografia normalizada (achado: 22 dos 64 achados do detector eram falsos positivos de tamanho de ícone, não de texto), estado fantasma da Supervisão consistente com o do N2. `impeccable-plantao` arquivada e specs sincronizadas.
