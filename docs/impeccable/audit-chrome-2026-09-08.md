# Re-audit técnico — Chrome global (Fase 1 do programa Impeccable, após a change `impeccable-chrome`)

Data: 2026-09-08 · Alvos idênticos ao audit de 2026-09-07: `src/App.jsx`, `src/components/Header.jsx`, `Sidebar.jsx`, `MobileBottomNav.jsx`, `MobileMoreSheet.jsx`, `notifications/`, `responsive/`, `ThemeSwitcher.tsx`, `hooks/useBentoTheme.js`, `contexts/ThemeContext.tsx`, mais os arquivos que a change criou e que hoje compõem o chrome: `navigation.js`, `hooks/useDismissable.js`, `hooks/useComunicados.js`, `hooks/useProfileDisplay.js`, `ProfileMenu.jsx`, `MobileProfileSheet.jsx`, `common/BottomSheet.jsx`, `NotFound.jsx`.
Evidência: `impeccable detect --json` (4 advisory, exit 0; eram 9), contraste WCAG calculado por script sobre os cinco objetos de `useBentoTheme.js` (18 pares × 5 temas), e medições no navegador (Playwright, `localhost:5000`, sessão injetada em dois papéis): ordem de tabulação e anel de foco, Escape e retorno de foco nos três overlays, gate de permissão, alvos de toque a 390px, altura e safe-area da barra inferior, popup do perfil no colapsado (AMOLED), opacidade dos overlays (Cyber), sheet "Mais" (Aurora), badges (Default Dark). Capturas em `.playwright-mcp/audit2-*.png`. Console: zero erros de runtime (só o 404 do `favicon.ico`).

## Placar

| # | Dimensão | Nota | Antes | Achado-chave |
|---|---|---|---|---|
| 1 | Acessibilidade | 3 | 1 | Teclado, foco, Escape e ARIA resolvidos em todo o chrome. Restam: texto do badge branco sobre vermelho abaixo de 4,5:1 em 4 dos 5 temas; sem "pular para o conteúdo" (17 paradas de Tab antes da página); borda dos swatches abaixo de 3:1 nos escuros |
| 2 | Performance | 3 | 2 | Polling único, `NavRow` fora do render, perfil calculado uma vez. Resta: 17 views importadas de forma síncrona em `App.jsx` (bundle principal de 1,6 MB, sem `React.lazy`) |
| 3 | Design responsivo | 3 | 2 | Barra inferior 64px + safe-area, todos os alvos do chrome ≥ 44px, sem rolagem horizontal, header 18px. Resta: `FilterBar` (mobile) com botões "Filtros" (~36px) e "Limpar" (texto solto) abaixo de 44px |
| 4 | Tema | 3 | 2 | Zero hex literal nos 20 arquivos; `popover` opaco verificado no Cyber; Default Dark alcançável (`className === "dark"`). Resta: o mesmo contador de não lidos é amarelo no sino e vermelho na Sidebar e na barra inferior; `onDanger` usado como "texto sobre laranja" |
| 5 | Integridade da implementação | 3 | 2 | Fonte única de navegação verificada nas três superfícies e no título; DESIGN.md (Layout) bate com o código. Resta: `badge-count` e `button-primary` do DESIGN.md prescrevem branco sobre laranja (2,8:1), contra a própria regra "nunca texto pequeno" |
| **Total** | | **15/20** | **9/20** | **Bom (14–17)** |

Tendência: 9 → 15. Alvo da tarefa 7.6 (≥ 15) atingido.

## Veredito de integridade

**Aprovado.** O chrome agora expressa um sistema único e verificável: `navigation.js` alimenta Sidebar, barra inferior, sheet "Mais" e o título do Header (rótulos "Início", "Colaboradores", "Meus chamados" iguais nas três superfícies; "TI" e "Painel Admin" somem para não-admin nas três, e `canAccess` bloqueia a rota persistida com a tela "Você não tem acesso a esta área" no desktop e no celular). Os três overlays passam pelo mesmo `useDismissable` e pelo mesmo `BottomSheet`; os cinco temas passam pelos mesmos tokens, com `popover`, `scrim` e `*Strong` presentes nos cinco objetos. O detector só acusa 4 advisories, todos de `text-[10px]` em `FilterBar` e `ResponsiveTable`, que a change não tocou. A ressalva de integridade é documental: o DESIGN.md prescreve branco sobre laranja em `badge-count` e `button-primary`, e a seção Colors do mesmo documento diz que o laranja rende 2,8:1 sobre branco e "nunca é texto pequeno". O código segue o componente e herda a contradição.

## Sumário executivo

- Placar: **15/20** (Bom), vindo de 9/20 (Pobre)
- Issues: **0 P0 · 1 P1 · 7 P2 · 7 P3** (antes: 1 P0 · 7 P1 · 8 P2 · 6 P3)
- Fechados desde o audit anterior (verificados no navegador): gate de admin (P0); `div` clicáveis (P1); Escape e foco nos overlays (P1); `:focus-visible` global (P1); contraste de muted, ativo mobile e cabeçalhos do sino (P1); overlays translúcidos e popup recortado (P1); Default Dark (P1); `NavRow` no render (P1); cinco pollings (P2); Header morto (P2); quatro componentes mortos (P2); três listas de navegação (P2); safe-area e alvos (P2); semântica do sheet (P2); hex fixos (P2); busca desonesta (P2); ⌘K, `sort()` no render, clamp, "1 não lidas", `100vh` (P3)
- Top 4 restantes: (1) texto do badge de urgência abaixo de 4,5:1; (2) sem link "pular para o conteúdo"; (3) views sem code-splitting; (4) cor do contador de não lidos diverge entre sino e navegação
- Próximos passos: `colorize` (badges, swatches, token de texto sobre accent, DESIGN.md) → `harden` (skip link, `type="button"`) → `optimize` (`React.lazy` nas views) → `adapt` (`FilterBar`) → `polish`

## Achados por severidade

### P1

**[P1] Texto branco do badge de urgência abaixo de 4,5:1 em quatro temas**
- Local: `NotificationBell.jsx:53-55` (`C.onDanger` sobre `C.danger` quando há urgente), `MobileBottomNav.jsx:81` e `Sidebar.jsx:85-86, 98` (sempre `danger`/`dangerSoft`), tokens `onDanger: '#FFFFFF'` nos cinco objetos de `useBentoTheme.js`.
- Categoria: Acessibilidade / Tema. WCAG 1.4.3 (texto de 11px bold não é "grande").
- Medido: branco sobre `danger` = 3,91:1 (claro), **2,78:1 (Default Dark)**, 3,68:1 (Cyber), 3,80:1 (Aurora), 5,48:1 (AMOLED). Navy `#0B1B2E` sobre os mesmos vermelhos = 4,43 / 6,25 / 4,72 / 4,57 / 3,16.
- Impacto: o número de urgências, a informação mais importante do sino, é o texto de pior contraste do chrome. A contagem também vai no `aria-label`, então leitor de tela não perde; visão reduzida perde.
- Recomendação: `onDanger` deixa de ser branco fixo. Claro: preenchimento `dangerStrong` (`#B02121`) com branco (6,81:1). Default Dark, Cyber e Aurora: texto navy (`onWarning`) sobre o vermelho do tema (4,6 a 6,3:1). AMOLED: preenchimento `dangerStrong` (`#FF5252`) com navy (5,44:1). Um token `onDanger` por tema resolve sem tocar nos componentes.
- Comando: `/impeccable colorize`

### P2

**[P2] Sem atalho "pular para o conteúdo"**
- Local: `App.jsx:178-203` (shell), `Sidebar.jsx:256` (nav).
- Categoria: Acessibilidade. WCAG 2.4.1.
- Medido: do `body`, são 17 Tabs (logo, colapsar, 13 itens de nav, perfil, sino) até o primeiro controle da página, em toda troca de view.
- Recomendação: um `<a href="#conteudo" class="sr-only focus:not-sr-only">Pular para o conteúdo</a>` como primeiro filho do shell e `id="conteudo" tabIndex={-1}` no wrapper de `renderView()`. Mover o foco para esse wrapper ao trocar de view resolve também o "onde estou" para leitor de tela.
- Comando: `/impeccable harden`

**[P2] O mesmo contador de não lidos tem duas cores conforme a superfície**
- Local: `NotificationBell.jsx:53-55` (amarelo + navy quando só há "Importante", vermelho quando há "Urgente") vs `MobileBottomNav.jsx:81` (`danger` sempre) e `Sidebar.jsx:85-86, 98` (`dangerSoft`/`dangerStrong` ou ponto `danger`, sempre).
- Categoria: Tema / Integridade.
- Medido em Default Dark a 390px com 4 não lidos, todos "Importante": sino `#FACC15`, barra inferior `#FF6B6B`.
- Impacto: o usuário vê um "4" amarelo no topo e um "4" vermelho embaixo para a mesma coisa; a cor deixa de comunicar severidade.
- Recomendação: expor de `useNotificacoes` um `severidade: 'urgente' | 'importante'` e derivar o par de cores num único helper (`badgeColors(C, severidade)`) consumido pelos três.
- Comando: `/impeccable colorize`

**[P2] Texto do badge ativo da Sidebar e do botão do `NotFound` em branco sobre laranja (2,8:1 no claro)**
- Local: `Sidebar.jsx:85-86` (`color: C.surface` sobre `C.accent`), `NotFound.jsx:98` (`color: C.onDanger` sobre `C.accent`, 14px bold). DESIGN.md `badge-count` e `button-primary` prescrevem exatamente isso.
- Categoria: Acessibilidade / Integridade. WCAG 1.4.3.
- Medido: branco sobre `#EC7D23` = 2,79:1 (claro); navy sobre `#EC7D23` = 6,22:1; nos escuros `surface` sobre `#F97316` já passa (5,0 a 7,9:1).
- Recomendação: token `onAccent` (navy no claro, `surface` nos escuros) e usá-lo nos dois lugares; corrigir `badge-count` e `button-primary` no DESIGN.md para não contradizer a regra "The Orange Is Fill Rule". Em botões grandes (≥ 18,66px bold ou ≥ 24px) o branco continua aceitável.
- Comando: `/impeccable colorize` (código) + `/impeccable document` (DESIGN.md, Fase 16)

**[P2] Swatches de variante quase invisíveis nos temas escuros**
- Local: `ProfileMenu.jsx:130-140` (círculo `v.theme.bg` com borda `C.line` de 2px sobre `C.popover`).
- Categoria: Acessibilidade / Tema. WCAG 1.4.11 (limite de componente ≥ 3:1).
- Medido: `line` sobre `popover` = 1,19 a 1,30:1 nos cinco temas; no AMOLED o swatch do próprio AMOLED é `#000` sobre `#0A0A0A`. Default Dark e Cyber têm o mesmo `bg` (`#070B13`) e o mesmo `accent`, logo swatches idênticos, distinguíveis só pelo anel interno (`#0B121F` vs `#111C2C`).
- Recomendação: borda em `C.ink2` (≥ 5:1 em todo tema) nos inativos e `C.accent` no ativo; para Default Dark vs Cyber, usar o `success` como ponto central (verde vs ciano), que é a diferença real entre os dois.
- Comando: `/impeccable colorize`

**[P2] Dezessete views importadas de forma síncrona no `App.jsx`**
- Local: `App.jsx:2-19`.
- Categoria: Performance.
- Medido: `dist/assets/index-*.js` com 1,6 MB e um chunk de 2,6 MB (build da tarefa 7.1 já avisava "> 500 kB"); nenhum `React.lazy` em `src/`.
- Impacto: quem abre a intranet para ver o plantão baixa também o mapa de Cobertura (Leaflet), o editor de organograma, o Painel Admin e o hub de TI.
- Recomendação: `React.lazy` + `Suspense` por view em `renderView()`, com um skeleton do tamanho do hero como fallback; Coverage, OrgChartEditor, AdminDashboard e Ti primeiro.
- Comando: `/impeccable optimize`

**[P2] `FilterBar` (só mobile) com alvos abaixo de 44px e sem `type="button"`**
- Local: `FilterBar.jsx:22-29, 35-50, 53-59`.
- Categoria: Responsivo / Acessibilidade.
- Medido: "Filtros" com `py-2` (~36px); "Limpar" e "Limpar filtros" são texto solto sem área mínima; nenhum dos quatro `button` tem `type`, então dentro de um `form` enviam o formulário.
- Recomendação: `min-h-[44px]` nos três, `type="button"` nos quatro, e `Icons.Filter` (ou `tune`) no lugar de `Icons.Settings`, que é o ícone de Configurações no resto do chrome.
- Comando: `/impeccable adapt`

**[P2] `C.muted` como texto de 10 a 12px no `ResponsiveTable`**
- Local: `ResponsiveTable.jsx:39` (cabeçalho `text-xs` da tabela) e `:120` (`dt` de 10px nos cards mobile). Consumido por `TicketsList` e `AdminUsuarios`.
- Categoria: Acessibilidade. WCAG 1.4.3.
- Medido: `muted` sobre `surfaceSoft` = 2,87:1 e sobre `surface` = 3,01:1 no claro (passa nos quatro escuros).
- Impacto: terceira superfície com o mesmo padrão (chrome antes da change, Dashboard, agora `responsive/`). Vira transversal (ver programa, seção Transversal).
- Recomendação: `C.ink2` nos dois; regra no DESIGN.md "muted só para ícone inativo e placeholder".
- Comando: `/impeccable colorize`

### P3

- **[P3] `hover:bg-black/5` nas linhas do `ResponsiveTable`** (`:62`): preto a 5% é invisível sobre superfícies escuras. Trocar por `C.surfaceSoft` via estilo inline ou classe de tema. `/impeccable colorize`
- **[P3] `C.onDanger` como nome do token para "texto sobre laranja"** (`NotFound.jsx:98`): funciona porque ambos são brancos, mas mente sobre a intenção; some com o `onAccent` do P2 acima.
- **[P3] Cabeçalho com `backdrop-filter: blur(14px)` permanente** (`Header.jsx:24`): custo de composição a cada frame de rolagem em celulares modestos. Aceitável no desktop; abaixo de `lg`, trocar por `C.bg` opaco (o `E0` de alpha só faz diferença sobre o hero). `/impeccable optimize`
- **[P3] `${C.bg}E0` concatena alfa em hex** (`Header.jsx:24`): só funciona porque todos os `bg` são hex de 6 dígitos; um `bg` em `rgba` (como o `surface` do Cyber) quebraria em silêncio. Preferir um token `chrome` já com alfa ou `color-mix()`.
- **[P3] Tamanhos fora da rampa** (detector, 4 ocorrências): `FilterBar.jsx:44, 67, 75` e `ResponsiveTable.jsx:120` a 10px. Subir para 11px (`overline`). `/impeccable typeset`
- **[P3] `useBentoTheme.js` e `index.css` são duas fontes do mesmo tema**, sincronizadas à mão (comentário no topo do hook admite). Candidato a `extract`: gerar um dos lados a partir do outro ou ler as variáveis CSS via `getComputedStyle` uma vez por troca de tema. Fase 16.
- **[P3] `favicon.ico` 404** em toda carga (`index.html`); único erro de console do chrome.

## Padrões sistêmicos

1. **Branco sobre laranja como texto pequeno** está no código (badge ativo, botão do NotFound) porque está no DESIGN.md (`badge-count`, `button-primary`), que por sua vez contradiz a própria seção Colors. É drift documental, não de implementação; o `document` da Fase 16 precisa fechar essa contradição, e `button-primary` aparece em dezenas de páginas (a seção Buttons do DESIGN.md fala em 25 ocorrências do gradiente).
2. **`C.muted` como texto pequeno em superfície clara** completou a terceira ocorrência (`ResponsiveTable`). Já é transversal.
3. **Cor semântica derivada por superfície** em vez de por dado: o sino calcula a cor a partir da severidade, a navegação assume vermelho. Padrão a observar nas Fases 5 (tipos de comunicado) e 8 (status de chamado).
4. **Tudo importado de forma síncrona**: o único `import()` dinâmico de `src/` é a animação do 404. Vale para o `App.jsx` (chrome) e, pela mesma lógica, para os modais pesados de cada página nas fases seguintes.

## Pontos positivos

- **Teclado de ponta a ponta**: 17 paradas de Tab no chrome, todas `button` com nome acessível, todas com o mesmo anel `2px solid #EC7D23` (ou `#F97316` nos escuros). Sino, popup do perfil e os dois sheets abrem com foco no primeiro controle ("Marcar todas como lidas", "Configurações", "Fechar") e Escape devolve o foco ao gatilho, verificado nos quatro.
- **Gate de permissão real**: `currentView='admin'` e `'ti'` persistidos para não-admin renderizam "Você não tem acesso a esta área" com o título certo no header ("Painel Admin", "TI") e o botão "Voltar para o Início"; a Sidebar e o sheet "Mais" omitem os dois itens e o grupo "Administração" some.
- **Chrome mobile completo**: barra de 64px + `env(safe-area-inset-bottom)`, cinco alvos de 76×64, avatar e sino de 44×44, sheet com `role="dialog" aria-modal`, `body.overflow: hidden` enquanto aberto e restaurado ao fechar, sem rolagem horizontal a 390px, título em 18px.
- **Popup do perfil no colapsado (AMOLED)**: 232px inteiramente visíveis a partir de `x=72`, "Sair da conta" recebe o clique (`elementFromPoint`), em `#FF5252` (6,2:1).
- **Overlays opacos no Cyber**: sino e itens em `rgb(17,28,44)`; header em `rgba(7,11,19,.88)` com blur, como o DESIGN.md pede.
- **Contrastes que antes reprovavam agora passam nos cinco temas**: `ink2` sobre `surfaceSoft` 5,3 a 7,3:1; nav ativo `accentDark` sobre `accentSoft` 4,9 a 10,7:1; cabeçalhos do sino 4,9 a 10,7:1; "Sair da conta" 4,7 a 6,8:1; badge amarelo com navy 5,9 a 11,3:1.
- **Zero hex literal** nos 20 arquivos do chrome (grep). Toda cor passa por `C.*` ou `var(--shadow-*)`.
- **Um fetch para todo o chrome**: `useSyncExternalStore` com `version`, contagens iguais no sino, Sidebar e barra (4/4/4 medidos), poll não apaga a lista aberta.
- **`prefers-reduced-motion`**: a regra global de 0,01ms preserva o estado final (animações de entrada usam `forwards`, a barra do carrossel nasce cheia), então o feedback de abertura de sheet e dropdown se mantém sem movimento. Não é o "kill" destrutivo que o audit manda sinalizar.
- **Z-index 100% dentro da tabela**: Sidebar e header 1000, barra 1000, sheet 1001, popup 50, dropdown 50.

## Ações recomendadas

1. **[P1] `/impeccable colorize`**: `onDanger` por tema (preenchimento `dangerStrong` no claro e AMOLED, navy nos outros três); helper único de cor do badge por severidade para sino, Sidebar e barra; token `onAccent`; borda `ink2` e ponto `success` nos swatches; `ink2` no `ResponsiveTable`; hover das linhas via token.
2. **[P2] `/impeccable harden`**: link "Pular para o conteúdo" + foco no wrapper da view ao navegar; `type="button"` no `FilterBar`.
3. **[P2] `/impeccable optimize`**: `React.lazy`/`Suspense` nas 17 views (Coverage, OrgChartEditor, AdminDashboard, Ti primeiro); header opaco abaixo de `lg`.
4. **[P2] `/impeccable adapt`**: alvos de 44px e ícone de filtro no `FilterBar`.
5. **[P3] `/impeccable typeset`**: os quatro `text-[10px]` para 11px.
6. **`/impeccable document`** (Fase 16): `badge-count`, `button-primary` e a regra de muted no DESIGN.md.
7. **`/impeccable polish`**: passagem final nos cinco temas e dois viewports.

Re-rodar `/impeccable audit` depois do `colorize` para registrar a tendência (15/20 → alvo 17+).
