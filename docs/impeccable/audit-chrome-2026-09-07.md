# Audit técnico — Chrome global (Fase 1 do programa Impeccable)

Data: 2026-09-07 · Alvos: `src/App.jsx`, `src/components/Header.jsx`, `Sidebar.jsx`, `MobileBottomNav.jsx`, `MobileMoreSheet.jsx`, `notifications/`, `responsive/`, `ThemeSwitcher.tsx`, `hooks/useBentoTheme.js`, `contexts/ThemeContext.tsx`.
Evidência: `impeccable detect --json` (9 advisory, exit 0) e overlay do detector injetado em 3 vistas (desktop claro, celular claro com sheet aberto, desktop escuro Cyber), mais medições de foco, contraste WCAG, alvos de toque e z-index feitas no navegador (Playwright, `localhost:5000`, sessão injetada). Scan e medições vieram da Avaliação B da crítica do mesmo dia; nenhum arquivo do chrome mudou entre a crítica e este audit.

## Placar

| # | Dimensão | Nota | Achado-chave |
|---|---|---|---|
| 1 | Acessibilidade | 1 | Sair, tema e notificações inacessíveis por teclado (`div` clicáveis); nenhum `:focus-visible` do sistema; buscas sem anel; Escape não fecha overlays; badge 1,5:1 no escuro |
| 2 | Performance | 2 | `NavRow`/`GroupLabel` definidos dentro do render da Sidebar (remontam a cada estado); 5 pollings paralelos; Header calcula avatar/cargo sem renderizar |
| 3 | Design responsivo | 2 | Sem `safe-area-inset-bottom`; sino 40×40 e X do sheet 32×32; placeholder cortado a 390px; drawer morto; `64px` acoplado entre `App` e `MobileBottomNav` |
| 4 | Tema | 2 | Tokens `C.*` na maior parte, mas hex fixos (`#F5F9FF` no badge, `#fff` no toggle, swatches, `#ef4444`), `accentDeep` como texto ativo no escuro (1,88:1), `surface` translúcida em overlays no Cyber, "Default Dark" inalcançável, `ThemeSwitcher.tsx` inteiro em hex com `dark:` |
| 5 | Integridade da implementação | 2 | 4 componentes mortos em `responsive/`; 3 listas de navegação duplicadas com rótulos divergentes; DESIGN.md descreve `PageShell` e item ativo que o código não usa |
| **Total** | | **9/20** | **Pobre (6–9)** |

## Veredito de integridade

**Reprovado, com ressalvas.** O chrome expressa um sistema coerente nos tokens de cor (todo componente lê `useBentoTheme`), na tabela de z-index (100% dentro do DESIGN.md) e no colapso da sidebar. Mas a estrutura tem drift verificado: a navegação existe em três listas independentes (`Sidebar.jsx:11-21` + `:285-289`, `MobileMoreSheet.jsx:34-53`, `MobileDrawer.jsx:6-19`) com rótulos e regras de admin diferentes; `responsive/` guarda quatro componentes que ninguém importa (`MobileDrawer`, `PageShell`, `ResponsiveBreadcrumb`, `TouchFriendlyActions`); o DESIGN.md afirma que "cada página segue `PageShell`" e que o item ativo tem fundo Laranja Suave, e nenhum dos dois é verdade. Detector: 9 advisory, zero warnings.

## Sumário executivo

- Placar: **9/20** (Pobre)
- Issues: **1 P0 · 7 P1 · 8 P2 · 6 P3**
- Top 5: (1) admin exposto na Sidebar e sem gate na rota; (2) ações essenciais em `div` sem teclado e sem Escape; (3) contraste reprovado em badge, muted e ativo mobile no escuro; (4) overlays translúcidos e popup recortado; (5) componentes de nav definidos dentro do render e pollings redundantes.
- Próximos passos: `harden` (permissão, teclado, Escape, foco) → `colorize` (tokens de contraste, popover opaco, Default Dark) → `layout` (popup, header com contexto) → `adapt` (mobile) → `optimize` (NavRow, pollings, código morto) → `polish`.

## Achados por severidade

### P0

**[P0] Painel Admin visível e roteável para não-admin**
- Local: `Sidebar.jsx:288` (item `admin` sem `somenteAdmin`), `App.jsx:149-151` (rota sem gate).
- Categoria: Integridade / Acessibilidade de permissão.
- Impacto: colaborador comum abre o `AdminDashboard` inteiro; backend devolve 403 e a UI mostra "Super Admin" com KPIs vazios. Viola o princípio 4 do PRODUCT.md.
- Recomendação: `somenteAdmin: true` + filtro em `:441`; `user?.is_admin ? <AdminDashboard/> : <NotFound/>` em `App.jsx:149`; variante "Sem permissão" do `NotFound`.
- Comando: `/impeccable harden`

### P1

**[P1] Card do usuário, "Modo Escuro", swatches e itens de notificação são `div` com `onClick`**
- Local: `Sidebar.jsx:595-613`, `:497-511`, `:520-548`; `NotificationBell.jsx:222-236`; `MobileMoreSheet.jsx:108-118` (alça de 5px).
- Categoria: Acessibilidade. WCAG 2.1.1 (teclado), 4.1.2 (nome/função).
- Impacto: usuário de teclado não sai da conta, não troca tema, não marca notificação como lida.
- Recomendação: `<button>` com `aria-haspopup`/`aria-expanded`; `role="switch" aria-checked`; `aria-label`/`aria-pressed` nos swatches.
- Comando: `/impeccable harden`

**[P1] Nenhum overlay do chrome fecha com Escape nem gerencia foco**
- Local: `NotificationBell.jsx:115-126`, `Sidebar.jsx:159-167`, `MobileMoreSheet.jsx:10-30`. `MobileDrawer.jsx:24-33` tem o padrão certo (Escape + `body.overflow`), mas é código morto.
- Categoria: Acessibilidade. WCAG 2.1.2.
- Recomendação: um hook `useDismissable(ref, onClose)` compartilhado (click-outside + Escape + foco de entrada/retorno) usado pelos três.
- Comando: `/impeccable harden`

**[P1] Sem `:focus-visible` do sistema; inputs de busca sem anel; "Ver todos" com `outline: none`**
- Local: `index.css` (sem regra global), `Sidebar.jsx:406-409` e `Header.jsx:107` (`outline: none`), `NotificationBell.jsx:472-491`.
- Categoria: Acessibilidade. WCAG 2.4.7.
- Recomendação: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` global; remover `outline: none`.
- Comando: `/impeccable harden`

**[P1] Contraste reprovado: muted no claro, badge do sino nos dois temas, ativo mobile no escuro**
- Local: `Sidebar.jsx:186-188, 412-415, 631-638` (`C.muted` sobre `surfaceSoft` = 2,87:1); `NotificationBell.jsx:316-338` (branco sobre `warning`: 2,94:1 claro, 1,53:1 escuro; borda `#F5F9FF` fixa); `MobileBottomNav.jsx:66` (`C.accentDeep` como texto no escuro = 1,88:1) e `:76-85` (inativo `C.muted` sobre branco = 3,01:1); `NotificationBell.jsx:205-215` ("Importante (N)" 2,84:1).
- Categoria: Tema / Acessibilidade. WCAG 1.4.3, 1.4.11.
- Recomendação: overlines e cargo em `C.ink2`; badge com texto `C.ink` sobre amarelo (ou fundo `warning-strong` com branco) e borda `C.bg`; texto ativo da barra inferior em `C.accent` (escuro) ou `C.ink`; cabeçalho de grupo em `warning-strong`/`danger-strong`.
- Comando: `/impeccable colorize`

**[P1] Overlays com `surface` translúcida no Cyber e popup do perfil recortado no colapsado**
- Local: `useBentoTheme.js:35` (`surface: rgba(17,28,44,0.85)`) usado em `NotificationBell.jsx:352`, `Sidebar.jsx:463`, `MobileMoreSheet.jsx:96`; `Sidebar.jsx:301` (`overflowY: auto` no `aside`) + `:459-461` (popup `absolute`, `left: 64`).
- Categoria: Tema / Layout.
- Impacto: texto vaza por trás do sino, do popup e do sheet no escuro padrão; no colapsado o popup mede `scrollWidth 292 / clientWidth 71` e "Sair da Conta" não recebe clique.
- Recomendação: token `popover` opaco em `useBentoTheme.js`; popup do perfil em `position: fixed` calculado a partir do card (ou `overflow: visible` no `aside` e scroll num wrapper interno); `zIndex: 1000` do popup (`Sidebar.jsx:468`) para a faixa 20-99.
- Comando: `/impeccable layout` + `/impeccable colorize`

**[P1] "Default Dark" documentado mas inalcançável; toggle descarta "Sistema"**
- Local: `ThemeContext.tsx:24-27` (sempre `dark-${darkVariant}`, padrão `cyber`); `Sidebar.jsx:498` (`setTheme(isDark ? 'light' : 'dark')`); `ThemeSwitcher.tsx:69-125` (só 3 variantes).
- Categoria: Tema / Integridade.
- Recomendação (decisão 10 do proposal): adicionar `'default'` a `DarkVariant`, aplicar só `.dark` nesse caso, expor no seletor da Sidebar e do `ThemeSwitcher`, e tornar `default` o padrão; adicionar `BENTO_DARK_DEFAULT` em `useBentoTheme.js` espelhando o bloco `.dark` do `index.css` (`success #2DB37F`, `danger #FF6B6B`, `surface #111C2C` opaca).
- Comando: `/impeccable colorize`

**[P1] `NavRow` e `GroupLabel` definidos dentro do corpo da `Sidebar`**
- Local: `Sidebar.jsx:174-264`.
- Categoria: Performance.
- Impacto: cada render da Sidebar (hover do perfil, colapso, poll do badge a cada 30s) cria um novo tipo de componente; React desmonta e remonta os 12 botões da nav, perde o `hover` interno e o foco do teclado.
- Recomendação: mover para o escopo do módulo recebendo `C` e `collapsed` por props.
- Comando: `/impeccable optimize`

### P2

**[P2] Cinco pollings paralelos no chrome**: `/api/comunicados` a cada 30s em `Sidebar.jsx:281`, `NotificationBell.jsx:111` e `MobileMoreSheet.jsx:28`; `localStorage` de avatar a cada 1,5s em `Header.jsx:50` e `Sidebar.jsx:129`. Recomendação: um hook `useComunicados()` compartilhado (ou contexto) e um `storage`/evento customizado para o avatar. `/impeccable optimize`

**[P2] Header calcula `avatarUrl`, `cargoName`, `displayName` e não renderiza nada disso** (`Header.jsx:18-70`), incluindo um `resolveNomeSetor` a cada mount. Vira útil com a decisão 8 (header com contexto); senão, apagar. `/impeccable optimize`

**[P2] Quatro componentes mortos em `responsive/`**: `MobileDrawer.jsx` (importado em `App.jsx:24, 197-203` mas sem gatilho), `PageShell.jsx`, `ResponsiveBreadcrumb.jsx`, `TouchFriendlyActions.jsx` (nenhum import em `src/`). O DESIGN.md (Layout) afirma que toda página usa `PageShell`. Recomendação: remover os quatro e corrigir o DESIGN.md no `document` da Fase 16. `/impeccable optimize`

**[P2] Três listas de navegação com rótulos e regras divergentes**: "Dashboard" (Sidebar, Drawer) vs "Início" (BottomNav); "Colaboradores" vs "Equipe"; `somenteAdmin` só no `ti` da Sidebar/Drawer, o `admin` da Sidebar sem regra, o Sheet com regra para ambos. Recomendação: um `navigation.js` único com `{ id, icon, label, group, somenteAdmin }` consumido pelas três superfícies. `/impeccable harden`

**[P2] Mobile sem `safe-area`, alvos abaixo de 44px e placeholder cortado**: `MobileBottomNav.jsx:38` (`height: 64` fixo) e `App.jsx:158` (`pb-[64px]`); sino `NotificationBell.jsx:8-9` (40×40); X do sheet `MobileMoreSheet.jsx:139-140` (32×32); `Header.jsx:106` (placeholder de 40 caracteres a 390px). `/impeccable adapt`

**[P2] Sheet "Mais" sem semântica de diálogo**: `MobileMoreSheet.jsx:61-72` sem `role="dialog"`, `aria-modal`, `aria-label`; botão fechar anuncia "close" (ligadura, `:148`); `nav` inferior sem `aria-label` e itens sem `aria-current` (`MobileBottomNav.jsx:31-52`); botão colapsar sem `aria-expanded` (`Sidebar.jsx:351`). `/impeccable harden`

**[P2] Hex fixos que sobrevivem à troca de tema**: `NotificationBell.jsx:326` (`#F5F9FF`), `:327` (`#FFFFFF`, aceitável sobre vermelho, não sobre amarelo); `Sidebar.jsx:62` (`#fff` no knob), `:66` e `:208, :466, :608` (sombras `rgba(11,27,46,…)` calibradas para o claro), `:525-545` (swatches), `:571-582` (`#ef4444` fallback); `MobileMoreSheet.jsx:82` (`rgba(11,27,46,0.5)` backdrop); `MobileDrawer.jsx:45` (`bg-black/40`); `ThemeSwitcher.tsx` inteiro (`#0B1B2E`, `#E4ECF5`, `#EC7D23`, `#F97316` via classes `dark:`, sem ler `useBentoTheme`). Recomendação: sombras via `--shadow-*`, swatches lendo os objetos `BENTO_DARK_*`, `ThemeSwitcher` migrado para tokens. `/impeccable colorize`

**[P2] Busca do chrome só alimenta Serviços**: `App.jsx:161` é o único consumidor de `searchQuery`; `App.jsx:83-85` limpa ao navegar; placeholders prometem "pessoas ou documentos" (`Header.jsx:106`). Decisão 8: campo só em Serviços com placeholder honesto. `/impeccable clarify`

### P3

- **[P3] Hint "⌘K" em empresa Windows** e dois listeners globais de Ctrl+K (`Header.jsx:54-65`, `Sidebar.jsx:133-150`), o do Header focando um input `lg:hidden`. `/impeccable clarify`
- **[P3] `items.sort()` muta o array de estado no render** (`NotificationBell.jsx:218`); ordenar em `useMemo` ao filtrar.
- **[P3] Descrição da notificação sem clamp** (`NotificationBell.jsx:270`) e `aria-label` "1 não lidas" (`:180`). `/impeccable clarify`
- **[P3] Tamanhos fora da rampa** (detector, 6 ocorrências): `FilterBar.jsx:44, 67, 75` e `ResponsiveTable.jsx:120` a 10px; `MobileDrawer.jsx:60-61` a 17px e 9,5px; mais 13,5 / 10,5 / 9,5 / 9px na Sidebar e no sino. `/impeccable typeset`
- **[P3] `height: 100vh` na Sidebar** (`Sidebar.jsx:300`) enquanto o shell usa `h-dvh` (`App.jsx:154`); Sidebar sem `zIndex` declarado (tabela: 1000). `/impeccable layout`
- **[P3] Sombras fora do vocabulário** (`NotificationBell.jsx:354`, `Sidebar.jsx:466`) e `gpt-thin-border-wide-shadow` no dropdown (detector overlay). `/impeccable polish`

## Padrões sistêmicos

1. **Interatividade em `div`**: perfil, tema, notificação, alça do sheet. O padrão `button` só chegou à nav e ao sino.
2. **Overlay sem ciclo de vida**: três overlays, três implementações de click-outside, nenhuma com Escape ou foco; a única completa (`MobileDrawer`) está morta.
3. **Listas de navegação duplicadas** em vez de uma fonte única; a divergência de rótulos e de regra de admin é consequência.
4. **`C.muted` como cor de texto pequeno** (10px ou menos) em superfícies claras: reprova em todo lugar onde aparece.
5. **Polling por componente** em vez de dado compartilhado.
6. **Documentação à frente do código**: DESIGN.md descreve `PageShell` universal, item ativo laranja-suave e cinco temas; o código tem nenhum, trilho navy e quatro temas.

## Pontos positivos

- Todo componente do chrome lê `useBentoTheme()`; a troca entre claro, Cyber, Aurora e AMOLED atualiza cor, borda e sombra sem reload.
- Z-index do chrome (header 1000, bottom nav 1000, sheet 1001, dropdown 50, elevado 10) bate 100% com a tabela do DESIGN.md.
- `--sidebar-w` publicado no `:root` (`Sidebar.jsx:155-157`) para overlays `fixed` respeitarem a sidebar.
- `NotificationBell`: `aria-label` dinâmico, `aria-expanded`, `role="dialog"`, limpeza de IDs obsoletos no `localStorage`, agrupamento e tempo relativo verificados em 4 cenários.
- `MobileDrawer.jsx:24-33` mostra o padrão correto de Escape + trava de scroll; reaproveitar antes de apagar.
- Detector CLI sem nenhum warning; os 3 `ignoreValues` do config continuam válidos.

## Ações recomendadas

1. **[P0] `/impeccable harden`**: gate de admin na Sidebar e em `App.jsx`; variante "Sem permissão" do NotFound; fonte única de navegação com `somenteAdmin`.
2. **[P1] `/impeccable harden`**: `button` no perfil, tema, swatches e itens de notificação; hook compartilhado de dismiss (Escape, click-outside, foco); `:focus-visible` global; `aria-current`, `aria-expanded`, `role="dialog"` no sheet, `aria-label="Fechar"`.
3. **[P1] `/impeccable colorize`**: token `popover` opaco; `BENTO_DARK_DEFAULT` + variante `default`; contraste do badge, do ativo mobile, dos overlines e do cargo; swatches e sombras via tokens; `ThemeSwitcher` em tokens.
4. **[P1] `/impeccable layout`**: popup do perfil sem recorte; header desktop com contexto (decisão 8); `h-dvh` e z-index da Sidebar.
5. **[P1] `/impeccable optimize`**: `NavRow`/`GroupLabel` fora do render; `useComunicados()` compartilhado; avatar sem polling; remover Header morto e os quatro componentes mortos de `responsive/`.
6. **[P2] `/impeccable adapt`**: barra inferior por frequência (decisão 9); avatar + sheet de perfil no header mobile; safe-area; alvos de 44px; placeholder curto.
7. **[P2] `/impeccable clarify`**: "Ctrl+K", busca só em Serviços com placeholder honesto, clamp da notificação, "1 não lida", caixa de frase na copy.
8. **`/impeccable polish`**: passagem final nos 5 temas e 2 viewports.

Re-rodar `/impeccable audit` depois das correções para registrar a tendência (9/20 → alvo 15+).
