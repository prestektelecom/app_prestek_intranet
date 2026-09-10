## Why

A Fase 1 do `programa-impeccable` avaliou o chrome global (Sidebar, Header, sino, barra inferior, sheet "Mais", temas) com navegador, nos dois papéis, em desktop e celular, em claro e nos escuros. Crítica: **19/40** (snapshot `.impeccable/critique/2026-09-07T22-51-04Z__src-app-jsx.md`). Audit: **9/20** (`docs/impeccable/audit-chrome-2026-09-07.md`). O chrome aparece em toda página; corrigi-lo antes das páginas evita reabrir cada uma depois.

Os dois relatórios convergem em quatro defeitos que o portão de qualidade não deixa passar:

1. **Permissão só escondida, não estrutural.** "Painel Admin" aparece para qualquer colaborador e a rota `admin` renderiza o `AdminDashboard` sem checar `is_admin`. Viola o princípio 4 do PRODUCT.md.
2. **Chrome inoperável por teclado.** Sair da conta, trocar tema e ler notificações vivem em `div` clicáveis; nenhum overlay fecha com Escape; não existe `:focus-visible` do sistema e as buscas têm `outline: none`.
3. **Contraste e tema.** Muted a 2,9:1 no claro; badge do sino a 1,5:1 no escuro; rótulo ativo da barra inferior com `accentDeep` a 1,9:1 nos escuros; overlays com `surface` translúcida no Cyber; "Default Dark" documentado mas inalcançável.
4. **Chrome que promete o que não entrega.** Header desktop de 72px com um sino; busca que só filtra Serviços; celular sem nome, avatar ou "Sair"; `MobileDrawer` e mais três componentes de `responsive/` mortos.

## What Changes

- **Permissão:** fonte única de navegação (`src/navigation.js`) com `somenteAdmin`; Sidebar, sheet e qualquer futura superfície leem dela; `App.jsx` faz gate de `admin` e `ti` com uma variante "Sem permissão" do `NotFound`.
- **Teclado e semântica:** card do usuário, "Modo Escuro", swatches e itens de notificação viram `button` com ARIA; hook `useDismissable` compartilhado (click-outside, Escape, foco de entrada e retorno) nos três overlays; regra global `:focus-visible` laranja; `aria-current`, `aria-expanded`, `role="dialog"` no sheet.
- **Tema e contraste:** variante escura `default` exposta e tornada padrão (decisão 10 do programa); `BENTO_DARK_DEFAULT` em `useBentoTheme`; token `popover` opaco; badge, overlines, cargo, cabeçalho de grupo e rótulo ativo mobile em tokens que passam 4,5:1 nos cinco temas; `ThemeSwitcher` migrado para tokens.
- **Header com contexto** (decisão 8): título da view atual, ações da página e sino; busca só em Serviços com placeholder honesto; hint "Ctrl+K" e um único listener.
- **Chrome mobile** (decisão 9): barra inferior por frequência (Início, Plantão, Comunicados, Chamados, Mais); avatar no header abre sheet de perfil (nome, setor, tema, Sair); safe-area; alvos de 44px; `MobileDrawer` removido.
- **Código morto e pollings:** `NavRow`/`GroupLabel` fora do render; `useComunicados()` compartilhado; avatar sem polling; remoção de `MobileDrawer`, `PageShell`, `ResponsiveBreadcrumb`, `TouchFriendlyActions`.

Fora de escopo: busca global, redesign do shell, mudanças nas páginas (só o que o chrome expõe a elas), backend.

## Capabilities

### New Capabilities
- `chrome-navigation`: fonte única de itens de navegação com restrição de papel, e gate de rota para áreas de admin.
- `chrome-keyboard-access`: todo controle do chrome operável por teclado, overlays dispensáveis com Escape, foco visível e gerenciado.
- `chrome-theme-contrast`: contraste mínimo 4,5:1 para texto do chrome nos cinco temas, overlays opacos, variante Default Dark alcançável.
- `chrome-header-context`: header desktop que informa a view atual e concentra ações da página; busca restrita a onde funciona.

### Modified Capabilities
- `mobile-bottom-navigation`: slots reordenados por frequência de uso; estado ativo legível nos temas escuros; `aria-current`.
- `mobile-more-sheet`: lista de itens derivada da fonte única; semântica de diálogo; fecha com Escape; trava o scroll do fundo.
- `notification-bell-ui`: itens de notificação como botões focáveis; descrição com clamp; `aria-label` com concordância correta.

### Removed Capabilities
- `responsive-drawer`: `MobileDrawer` nunca teve gatilho; substituído pelo sheet de perfil no header mobile.
- `responsive-page-shell`: `PageShell` nunca foi importado por página alguma.
- `responsive-breadcrumb`: `ResponsiveBreadcrumb` nunca foi importado.

## Impact

- Arquivos: `src/App.jsx`, `src/navigation.js` (novo), `src/hooks/useDismissable.js` (novo), `src/hooks/useComunicados.js` (novo), `src/hooks/useBentoTheme.js`, `src/contexts/ThemeContext.tsx`, `src/index.css`, `src/components/{Header,Sidebar,MobileBottomNav,MobileMoreSheet,ThemeSwitcher,NotFound}.*`, `src/components/notifications/NotificationBell.jsx`, `src/components/responsive/` (4 remoções).
- Páginas: passam a receber título no header; nenhuma página muda de comportamento.
- DESIGN.md: a seção Layout deixa de citar `PageShell` como universal e a tabela de temas ganha a variante `default` como padrão (ajuste no `document` da Fase 16, anotado aqui).
- Programa: portão da Fase 1 exige crítica ≥ 19 sem P0/P1 abertos e audit re-rodado.
