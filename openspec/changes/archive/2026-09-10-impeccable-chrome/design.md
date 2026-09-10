## Context

Chrome global = `App.jsx` (shell e roteamento por `currentView`), `Sidebar` (desktop ≥ lg), `Header` (todas as larguras), `NotificationBell`, `MobileBottomNav` + `MobileMoreSheet` (< lg), `ThemeContext` + `useBentoTheme` (cinco temas). Não há roteador; `currentView` é string em estado do `App`, persistida em `sessionStorage`/`localStorage`. A sessão do usuário é um objeto com `is_admin` e `funcionario` vindo do IXC.

Refinamento, não redesign: o mundo visual (laranja raro sobre azul-gelo, trilho de 3px no item ativo, sidebar 248/72px) fica. O que muda é permissão, acessibilidade, contraste, contexto do header e a barra inferior.

## Decisões

### 1. Navegação em uma fonte única

`src/navigation.js` exporta `NAV_ITEMS = [{ id, icon, label, group: 'menu' | 'sistema', somenteAdmin?, mobileSlot? }]` e helpers `visibleNav(user)` e `viewTitle(id)`. Sidebar, sheet e header consomem daí. Rótulos ficam os da Sidebar ("Dashboard" vira "Início" em todas as superfícies, porque o produto é só PT-BR); "Colaboradores" substitui "Equipe" na barra inferior. Alternativa rejeitada: manter três listas e sincronizar na mão, que é o que produziu a divergência atual.

### 2. Gate de rota no `App`

`ADMIN_VIEWS = ['admin', 'ti', 'plantao-historico']`. `App.jsx` resolve `const allowed = !ADMIN_VIEWS.includes(currentView) || user?.is_admin` e renderiza `<NotFound variant="sem-permissao" />` quando não permitido. O `NotFound` ganha `variant` (`'nao-encontrado' | 'sem-permissao'`) com copy honesta: "Você não tem acesso a esta área. Se precisar, fale com a TI." Backend continua sendo a barreira real (403); a UI só para de mentir.

### 3. `useDismissable(ref, { open, onClose, initialFocus, returnFocus })`

Um hook para os três overlays (sino, menu do perfil, sheet "Mais") e o novo sheet de perfil mobile: `mousedown` fora, `keydown Escape`, move o foco para `initialFocus` ao abrir e devolve ao elemento que tinha foco ao fechar; para sheets, também `document.body.style.overflow = 'hidden'`. Substitui os três `useEffect` de click-outside que existem hoje e o padrão de `MobileDrawer` que morre.

### 4. Foco visível

Regra global em `index.css`: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` e `input:focus-visible { outline-offset: 0 }`. Remove-se `outline: none` das buscas. Nenhum componente do chrome define foco próprio; o anel é do sistema. AMOLED: `--accent` `#F97316` sobre preto passa (≥ 3:1 para componente).

### 5. Contraste por token, não por exceção

- `C.muted` deixa de ser cor de texto abaixo de 12px em superfície clara; overlines, cargo e "⌘K" passam para `C.ink2` (7,3:1 sobre `surfaceSoft`).
- Badge do sino: fundo `C.danger` com texto branco quando há urgente (passa em todos os temas: `#E84545` 4,5:1, `#FF2A54`, `#FF007A`, `#D50000` sobre branco ≥ 4,5:1); fundo `C.warning` com texto `C.ink` quando só importante (amarelo `#CA8A04`/`#FACC15` com navy/preto ≥ 7:1). Borda do badge = `C.bg` (não mais `#F5F9FF` fixo).
- Barra inferior: ativo usa `C.accent` no ícone e `C.ink` no rótulo (nunca `accentDeep` como texto); inativo usa `C.ink2`.
- Cabeçalho de grupo do sino: texto `C.dangerStrong`/`C.warningStrong` (novos em `useBentoTheme`, espelhando `--danger-strong`/`--warning-strong` do `index.css`).
- "Sair da Conta": `C.danger` reprova no AMOLED (`#D50000` sobre `#0A0A0A` = 3,9:1). Usa `C.dangerStrong`, que nos escuros aponta para um vermelho mais claro; no AMOLED, `dangerStrong` passa a `#FF5252`.

### 6. Variante `default` do escuro e token `popover`

`DarkVariant = 'default' | 'cyber' | 'aurora' | 'amoled'`, padrão `'default'`. `applyThemeClasses` adiciona `dark` sempre e `dark-<v>` só quando `v !== 'default'`. `useBentoTheme` ganha `BENTO_DARK_DEFAULT` copiado do bloco `.dark` do `index.css` (`surface #111C2C` opaca, `success #2DB37F`, `danger #FF6B6B`) e cada objeto ganha `popover` (opaco: `#FFFFFF` claro, `#111C2C` default e cyber, `#1D1742` aurora, `#0A0A0A` amoled). Sino, popup do perfil, sheet e sheet de perfil usam `C.popover`. Swatches do seletor leem `BENTO_DARK_*.bg`/`.accent` em vez de hex. Migração: quem tinha `dark_theme_variant` ausente passa a `default`; quem tinha `cyber` gravado continua no Cyber.

### 7. Header com contexto

Desktop: `[Título da view em headline] ... [slot de ações da página] [sino]`. O título vem de `viewTitle(currentView)`; o slot de ações é um `HeaderActionsContext` que a página pode preencher (nesta change, nenhuma página preenche; o slot fica vazio sem ocupar espaço). Altura cai de 72px para 64px (token `--header-h`). Mobile: `[avatar → sheet de perfil] [título] [sino]`; a busca some do header. Busca fica só na Sidebar, visível apenas quando `currentView === 'services'`, com placeholder "Buscar planos por nome, valor ou ID" e hint "Ctrl+K"; um único listener em `Sidebar`. O `Header` deixa de calcular avatar e cargo no desktop.

### 8. Popup do perfil sem recorte

`aside` passa a `overflow: visible`; a lista de navegação ganha um wrapper `overflowY: auto; flex: 1`. O popup continua `absolute` e o `aside` recebe `z-index: 1000` (tabela do DESIGN.md), popup `z-index: 50` (flutuante leve dentro do chrome).

### 9. Mobile

Barra: Início (`dashboard`), Plantão (`schedule`), Comunicados (`announcements`, com badge de não lidos vindo de `useComunicados`), Chamados (`tickets`), Mais. Ativo de "Mais" só com o sheet aberto ou em view que não tem slot. Altura `calc(64px + env(safe-area-inset-bottom))`, `padding-bottom: env(safe-area-inset-bottom)`; `App.jsx` usa `--bottom-nav-h`. Sheet de perfil (`MobileProfileSheet`) reaproveita o conteúdo do popup do perfil (Configurações, Modo Escuro + variantes, Sair) e mostra nome, setor e avatar no topo. X do sheet a 44×44 com `aria-label="Fechar"`.

### 10. Dados compartilhados

`useComunicados()` (SWR-like simples: um `fetch` a cada 30s num módulo, assinantes recebem o mesmo array) alimenta sino, Sidebar e barra inferior; `notif_seen_<id>` continua no sino, mas a contagem de não lidos é exportada para os badges de "Comunicados" na Sidebar e na barra. Avatar: `Configuracoes` já grava em `localStorage`; troca-se o polling de 1,5s por um `CustomEvent('stitch:avatar')` disparado ao salvar e ouvido por Sidebar/Header.

### 11. `NavRow` e `GroupLabel` fora do render

Viram componentes de módulo recebendo `C`, `collapsed`, `active`, `onClick`. Elimina remontagem da nav a cada estado da Sidebar.

## Riscos

- `useComunicados` muda a semântica do badge da Sidebar (de "todos os urgentes" para "não lidos"); é o comportamento pedido pela crítica, e o sino já persiste "lido".
- A variante `default` muda o escuro padrão de quem nunca escolheu variante; anotar no commit.
- Remover `PageShell`/`ResponsiveBreadcrumb` contradiz a seção Layout do DESIGN.md até o `document` da Fase 16; anotado na seção Transversal do programa.
