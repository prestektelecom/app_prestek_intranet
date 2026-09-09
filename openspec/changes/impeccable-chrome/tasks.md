## 0. Backlog consolidado (origem)

Crítica 19/40 (`.impeccable/critique/2026-09-07T22-51-04Z__src-app-jsx.md`), audit 9/20 (`docs/impeccable/audit-chrome-2026-09-07.md`) e passagem manual (claro/Cyber × desktop/celular × 2 papéis; amostragem AMOLED desktop e Aurora celular). Decisões 8 a 11 do `programa-impeccable/proposal.md`.

Achados só da passagem manual, além dos relatórios: dropdown aberto vira spinner a cada poll de 30s (visto em AMOLED); "Sair da Conta" em `#D50000` sobre `#0A0A0A` no AMOLED (3,9:1); swatch AMOLED (`#222`) invisível sobre o próprio fundo; rótulo "Mais" ativo em `#9A3412` sobre índigo no Aurora; sem rolagem horizontal a 390px (suspeita do overlay descartada).

## 1. Permissão e navegação (P0) — `harden`

- [x] 1.1 Criar `src/navigation.js` com `NAV_ITEMS` (id, icon, label, group, somenteAdmin, mobileSlot), `visibleNav(user)` e `viewTitle(id)`; rótulos "Início" e "Colaboradores" em todas as superfícies
- [x] 1.2 Sidebar consome `visibleNav(user)` para os grupos Menu e Sistema; "Painel Admin" e "TI" só para admin
- [x] 1.3 `App.jsx`: `ADMIN_VIEWS` e gate de `admin`, `ti`, `plantao-historico` renderizando `NotFound` variante `sem-permissao` — verificado no navegador com `currentView='admin'` persistido para não-admin
- [x] 1.4 `NotFound` ganha `variant` com copy honesta para falta de permissão; bege e `rounded-[32px]` removidos, tela agora lê tokens de tema; variante sem permissão usa um cadeado em vez da animação "404"
- [x] 1.5 Sheet "Mais" e barra inferior consomem a fonte única (itens sem slot vão para o sheet; admin em grupo separado "Administração")

## 2. Teclado, foco e semântica (P1) — `harden`

- [x] 2.1 Criar `src/hooks/useDismissable.js` (click-outside, Escape, foco de entrada e retorno, trava de scroll opcional)
- [x] 2.2 Sino: usar `useDismissable`; itens de notificação viram `button`; `aria-label` com concordância ("1 não lida"); "Ver todos" sem `outline: none`
- [x] 2.3 Menu do perfil: card do usuário vira `button` com `aria-haspopup="menu"`/`aria-expanded`; "Modo escuro" vira `button role="switch" aria-checked`; swatches com `aria-label` e `aria-pressed`; `useDismissable` — conteúdo compartilhado em `ProfileMenu.jsx`
- [x] 2.4 Sheet "Mais": `role="dialog" aria-modal aria-label="Mais opções"`, `useDismissable` com trava de scroll, X de 44×44 com `aria-label="Fechar"`, alça deixa de ser clicável
- [x] 2.5 `index.css`: regra global `:focus-visible` com `outline: 2px solid var(--accent); outline-offset: 2px`; `outline: none` removido das buscas
- [x] 2.6 `aria-current="page"` no item ativo (Sidebar, barra, sheet); `aria-expanded` no colapsar; `aria-label="Navegação principal"` na barra inferior; logo com `alt=""` dentro do botão que já diz "Prestek Intranet"

## 3. Tema e contraste (P1) — `colorize`

- [x] 3.1 `ThemeContext`: `DarkVariant` ganha `'default'` como padrão; `applyThemeClasses` só adiciona `dark-<v>` quando `v !== 'default'` — verificado: `documentElement.className === 'dark'`
- [x] 3.2 `useBentoTheme`: `BENTO_DARK_DEFAULT` espelhando o bloco `.dark`; tokens `popover` e `scrim` nos cinco objetos; `dangerStrong`/`warningStrong`/`successStrong` nos cinco (AMOLED `dangerStrong #FF5252`, Aurora `#FF4DA0`)
- [x] 3.3 Seletor de variantes (Sidebar e `ThemeSwitcher`): quatro opções, swatches derivados de `BENTO_DARK_*`, nomes iguais ao DESIGN.md; `ThemeSwitcher.tsx` sem hex literal
- [x] 3.4 Sino, popup do perfil e sheets usam `C.popover`
- [x] 3.5 Badge do sino: `danger` + branco quando há urgente; `warning` + navy quando só importante; borda `C.bg`
- [x] 3.6 Overlines "MENU/SISTEMA", cargo e "Ctrl+K" em `C.ink2`; cabeçalho de grupo do sino em `dangerStrong`/`warningStrong`; "Sair da conta" em `dangerStrong`; laranja como texto pequeno no sino em `C.accentDark`
- [x] 3.7 Barra inferior: ativo = ícone `C.accent` + rótulo `C.ink`; inativo `C.ink2`
- [x] 3.8 Sombras do popup e do sino via `--shadow-lg`; knob do toggle e backdrop (`C.scrim`) sem hex fixo; fallback `#ef4444` removido
- [x] 3.9 (extra) Item ativo da Sidebar passa a seguir o `nav-item-active` do DESIGN.md (fundo Laranja Suave, texto `accentDark`, ícone `accent`) em vez do trilho de 3px que o detector marca como `side-tab`

## 4. Header com contexto e busca honesta (P1) — `layout` + `clarify`

- [x] 4.1 `Header`: título da view (`viewTitle`) em headline (18/20px), slot `HeaderActionsContext` (vazio nesta change), sino; altura `--header-h: 64px`; cálculo de avatar/cargo agora alimenta só o sheet de perfil mobile
- [x] 4.2 Busca: só na Sidebar e só em `services`, placeholder "Buscar planos por nome, valor ou ID", hint "Ctrl+K", um único listener (o do Header saiu com o campo)
- [x] 4.3 Popup do perfil sem recorte: `aside` com `overflow: visible` e `z-index: 1000`, lista de nav em `<nav>` rolável, popup `z-index: 50` — verificado no colapsado em AMOLED: 232px visíveis, "Sair da conta" clicável
- [x] 4.4 Sidebar: `height: 100dvh`; `NavRow` e `GroupLabel` movidos para o escopo do módulo

## 5. Chrome mobile (P2) — `adapt`

- [x] 5.1 Barra inferior: Início, Plantão, Comunicados (badge de não lidos), Chamados, Mais; "Mais" ativo só com sheet aberto ou view sem slot; `height: var(--bottom-nav-h)` com safe-area; `App.jsx` usa `pb-[var(--bottom-nav-h)]`
- [x] 5.2 Header mobile: avatar (44×44, `aria-label="Sua conta, <nome>"`) abre `MobileProfileSheet` (nome, setor, Configurações, Modo escuro + variantes, Sair); busca sai do header
- [x] 5.3 Removidos `MobileDrawer.jsx`, `PageShell.jsx`, `ResponsiveBreadcrumb.jsx`, `TouchFriendlyActions.jsx`, o estado `isMobileDrawerOpen` e a prop `onMenuClick`

## 6. Dados compartilhados e código morto (P2) — `optimize`

- [x] 6.1 `src/hooks/useComunicados.js`: um fetch a cada 30s compartilhado; `useNotificacoes(user)` expõe urgentes/importantes, `naoLidos`, `marcarLida`, `marcarTodas`, `loaded` (só primeira carga), `erro`
- [x] 6.2 Sino, Sidebar e barra inferior usam `useNotificacoes`; badge de "Comunicados" passa a contar não lidos; dropdown não vira spinner no poll; estado de erro com copy própria
- [x] 6.3 Avatar: `CustomEvent('stitch:avatar')` disparado ao salvar em Configurações; Sidebar/Header ouvem (mais `storage` entre abas) em vez de polling de 1,5s
- [x] 6.4 `NotificationBell`: ordenação em `useMemo` no hook (sem `sort()` no render); descrição com clamp de 2 linhas

## 7. Verificação e portão

- [x] 7.1 `npx vite build` limpo (31,8s, só o aviso de chunk > 500 kB que já existia)
- [x] 7.2 Diff revisado contra o contrato de `/api/comunicados` (`200 {sucesso, comunicados[]}` ou `500 {sucesso:false}`; lista vazia não é erro) e o formato da sessão (`is_admin`, `funcionario.id`)
- [x] 7.3 Agente `impeccable-finish-reviewer` sobre o diff — disposição "fix", 5 bloqueios e 8 melhorias, todos aplicados: `useComunicados` em `useSyncExternalStore` com `version` e `seenIds` em estado (contagem nunca diverge entre sino, Sidebar e barra); popup do perfil vira `role="dialog"` (filhos não são `menuitem`); anel de foco nos cartões do `ThemeSwitcher` via `label:has(> input.sr-only:focus-visible)`; item do sino sem `aria-label` que apagava o conteúdo (usa `sr-only`); swatches de 44px no sheet mobile; tokens `onDanger`/`onWarning`; badges a 11px, raios 8, `kbd` sem mono; `useProfileDisplay` calculado uma vez no `App`; `BottomSheet` compartilhado; `VIEWS` redundante removido; "Meus chamados"; badge da Sidebar com `sr-only`; anel do badge em `C.surface`; DESIGN.md (Layout) corrigido; build limpo de novo
- [x] 7.4 Passagem manual: regular × claro × 1440 (sino, Escape, foco, gate); admin × Default Dark × 1440 (TI/Painel Admin, badge, popup) e × 390 (barra, sheet de perfil, sheet "Mais", Escape, trava de scroll); AMOLED × colapsado (popup sem recorte, `dangerStrong`). Pendente: Cyber e Aurora por amostragem na re-crítica
- [x] 7.5 `/impeccable critique src/App.jsx` de novo (alvo idêntico) — tendência 19 → ≥ 25 sem P0/P1 — 2026-09-08: **24/40** (Aceitável, 60%), 0 P0, 2 P1, 4 P2. **Alvo não atingido** (faltou 1 ponto e sobraram 2 P1). Dual-agent com navegador em 2 papéis, 2 viewports, 5 temas por amostragem; overlay injetado em 3 vistas, zero findings no header, sino e sheets. Os P1 que sobraram são de outra natureza que os da 1ª rodada: (1) Painel Admin renderizado fora do shell (`App.jsx:154-156`; escopo da Fase 15, mas a decisão de shell é do chrome); (2) badge de urgência a 3,9:1 e o mesmo número em três cores entre sino, Sidebar e barra (coincide com o P1 do re-audit). P2: sino que marca lida mas não abre o comunicado; 13 itens em lista chata com Comunicados na 11ª posição; switch de tema que apaga "Sistema" e swatches Default/Cyber idênticos; "Sair da conta" sem confirmação e esperando o fetch de presença. Snapshot em `.impeccable/critique/` (slug `src-app-jsx`)
- [x] 7.6 `/impeccable audit` de novo nos mesmos alvos — 9 → ≥ 15 — 2026-09-08: **15/20** (a11y 3, perf 3, responsivo 3, tema 3, integridade 3); 0 P0, 1 P1, 7 P2, 7 P3; detector 9 → 4 advisories (todos `text-[10px]` em `responsive/`, não tocados). Relatório em `docs/impeccable/audit-chrome-2026-09-08.md`. Verificado no navegador em dois papéis: teclado/foco/Escape nos 3 overlays, gate de admin no desktop e no celular, alvos ≥ 44px e safe-area a 390px, popup no colapsado (AMOLED), overlays opacos (Cyber), sheet (Aurora). Restante que fica para a Fase 16 ou para uma rodada `colorize` curta: texto do badge de urgência abaixo de 4,5:1 (P1, é o `onDanger` branco fixo), sem "pular para o conteúdo", views sem `React.lazy`, contador de não lidos amarelo no sino e vermelho na navegação, `FilterBar` com alvos < 44px, `C.muted` no `ResponsiveTable`
- [x] 7.7 Exceções, se houver, em `.impeccable/critique/ignore.md` com motivo, data e responsável — nenhuma nova: os achados restantes são backlog, não exceção
- [x] 7.8 Anotar na seção Transversal do programa: `C.muted` como texto pequeno, `div` clicável, overlay sem ciclo de vida, DESIGN.md à frente do código — feito; o re-audit acrescentou a 3ª ocorrência do `C.muted` (`ResponsiveTable`), o "branco sobre laranja como texto pequeno" prescrito pelo próprio DESIGN.md, a cor semântica derivada por superfície e a ausência de code-splitting

## Fora do chrome, visto de passagem (não bloqueia)

- `/api/os-chamados/<id>` responde 500 para o funcionário 59841 (admin de teste); erro do Dashboard, fica para a Fase 3.
