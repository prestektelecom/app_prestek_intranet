---
target: Painel Admin (AdminDashboard.jsx) — Assessment B (detector + browser evidence), Fase 15
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 4
p1_count: 7
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\AdminDashboard.jsx"
target_fingerprint: "sha256:1169907d039ae2a70540646e37b5d3225639738fc5552ba82c9b0cce766a6c41"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\AdminDashboard.jsx"
timestamp: 2026-09-15T22-51-43Z
slug: src-components-admindashboard-jsx
---
# Assessment B — Detector + Browser Evidence · Painel Admin (`src/components/AdminDashboard.jsx`)

Fase 15 do programa Impeccable. Metade determinística do par (isolada da Assessment A).

## 1. Detector CLI

`.claude/skills/impeccable/scripts/impeccable detect --json src/components/AdminDashboard.jsx src/components/admin/`

- **Exit 0. 6 achados, 100% `advisory`, todos da mesma regra `design-system-font-size`.**
- AdminDashboard.jsx:66, :190, :230 (10px), :349 (120px — ícone decorativo, falso positivo conhecido); AdminComunicados.jsx:166, :265 (10px).
- **Zero achados de contraste, acessibilidade, tema ou touch target.**

**O detector está praticamente cego neste alvo, e isso é esperado.** `AdminDashboard.jsx`, `AdminUsuarios.jsx`, `AdminComunicados.jsx` e `ResponsaveisManual.jsx` estilizam via o hook JS `useBentoTheme()` com `style={{}}` inline — não há literal de cor no arquivo para o regex ler. Mesmo padrão já confirmado em `Configuracoes.jsx` (Fase 13) e `Ti.jsx` (Fase 14). Uma contagem baixa aqui não é sinal de saúde. Todos os achados P0/P1 abaixo vieram de medição ao vivo, nenhum do detector.

Observação de arquitetura: `AdminAuditoria.jsx` é o único sub-painel que usa o **outro** sistema de token (variáveis CSS: `text-muted`, `bg-card`, `border-border`). Dois painéis irmãos do mesmo hub, dois sistemas de token.

## 2. Evidência ao vivo

**Sessão:** não havia sessão admin ativa (`@Stitch:user` ausente em `localStorage` e `sessionStorage`; app na tela de login). Não adivinhei credenciais, conforme a restrição. Adaptei em duas frentes, ambas com medição real no navegador (aba própria, `?impeccableB=1`):

1. **Contraste:** valores de token resolvidos pelo próprio motor CSS do Chrome (`getComputedStyle`), compostos manualmente camada a camada até o primeiro ancestral opaco, WCAG por luminância relativa. Os 5 temas de `useBentoTheme.js` são constantes determinísticas, então os números são exatos.
2. **Geometria e teclado:** reprodução fiel injetada **dentro da página real do app**, com as `className` copiadas verbatim do JSX — a folha Tailwind e a fonte Material Symbols resolvem de verdade. Nó removido ao final.

### 2.1 O achado sinalizado pela memória do programa — CONFIRMADO, ainda quebrado

`NavRow` (`AdminDashboard.jsx:48/59/67`) usa `C.surface` como cor de TEXTO sobre `background: C.accent`.

| Tema | `C.surface` sobre `C.accent` | Token correto `C.onAccent` |
|---|---|---|
| **Claro** | **2,79:1 — REPROVA** (< 4,5 e < 3) | 6,22:1 |
| Default Dark | 6,11:1 | 6,11:1 |
| Cyber-Obsidian | 5,01:1 | 6,11:1 |
| Deep-Space Aurora | 7,94:1 | 7,94:1 |
| AMOLED | 7,06:1 | 7,06:1 |

Vale para o rótulo (linha 48) e para o ícone (linha 59). O **badge de contagem** (linha 67), `C.surface` sobre `rgba(245,249,255,0.25)` sobre o accent, é pior: **2,20:1 no claro**.

É o padrão já catalogado 6+ vezes: passa nos 4 escuros porque `surface === onAccent` por design, reprova só no claro. O próprio `useBentoTheme.js` documenta isso ("Branco sobre o accent rende 2,8:1 no claro, então é navy") — a correção é `C.onAccent`, que já existe.

### 2.2 Branco sobre accent reprova nos CINCO temas

| Controle | Claro | Dark | Cyber | Aurora | AMOLED |
|---|---|---|---|---|---|
| Botão "Sair" (`text-white` s/ `C.accent`) | 2,79 | 2,80 | 2,80 | **2,26** | 2,80 |
| Chip de filtro ativo, AdminComunicados:213 (`'#fff'`) | 2,79 | 2,80 | 2,80 | **2,26** | 2,80 |
| Botão "Filtrar", AdminAuditoria:90 (`#EC7D23` hardcoded) | 2,79 | 2,79 | 2,79 | 2,79 | 2,79 |
| Pills de ResponsaveisManual:280/292 (`'#fff'`) | 2,79 | 2,80 | 2,80 | 2,26 | 2,80 |

Nenhum passa em tema nenhum. O de Auditoria é hardcoded, então nem muda de tema.

### 2.3 Extremos de gradiente (padrão da Fase 14, reincidente)

Card "Gerenciar Usuários" (`AdminDashboard.jsx:346`) e cabeçalho do modal (`AdminComunicados.jsx:324`), ambos com `text-white`:

| Parada do gradiente | Claro | Escuros |
|---|---|---|
| `C.accentDeep` (0%) | 9,37:1 | 9,37:1 (Aurora 7,31) |
| `C.accentDark` (50%) | 5,18:1 | **1,69:1** (`#FDBA74`) |
| `C.accent` (100%) | **2,79:1** | **2,80:1** (Aurora 2,26) |

A mesma cor de texto passa numa ponta e reprova feio na outra. `text-white/80` do subtítulo: 1,93–2,29:1.

### 2.4 Bug de direção inversa — novo

`AdminUsuarios.jsx:207`, pill "Admin": `C.accentDeep` sobre `C.accentSoft`.

Claro 8,83:1 (ok) · **Default Dark 1,50:1 · Cyber 1,61:1 · AMOLED 1,77:1 · Aurora 1,93:1**.

`accentDeep` é um marrom escuro; sobre laranja translúcido em superfície escura ele some. O rótulo que diz se a pessoa é admin é ilegível nos 4 temas escuros.

### 2.5 Outras medições

- `C.muted` como texto real (7ª+ reincidência), só no claro: KPI label / "Menu" / "Voltar à Intranet" / bottom nav inativo / descrições **3,01:1**; subtítulo "Bem-vindo" sobre `C.bg` **2,85:1**; toggle off de Usuários **2,87:1**.
- "Ver Tudo" (`C.accent` sobre surface): **2,79:1** no claro.
- `sIconBox` accent sobre accentSoft: **2,63:1** no claro (piso de 3:1 para não-texto).
- Ícone `create_comunicado` de Auditoria: `#C2410C` sobre `#FFF7ED` **hardcoded** — 4,88:1, mas caixa clara fixa dentro de UI escura.

### 2.6 Cabeçalho hardcoded — o pior achado

`AdminDashboard.jsx:145`: `background: 'rgba(255,255,255,0.88)'`. Não é token. Não muda de tema.

| Texto sobre o cabeçalho | Claro | Dark | Cyber | Aurora | AMOLED |
|---|---|---|---|---|---|
| "Prestek Admin" (`C.ink`) | 17,24 | **1,23** | **1,23** | **1,23** | **1,32** |
| Nome do admin (`C.ink2`) | 7,64 | **2,32** | **2,32** | **2,05** | **2,70** |

Em qualquer tema escuro o título do produto é branco sobre branco. Terceira recorrência exata do padrão de `PlantaoHistorico.jsx` (Fase 4) e `AdminComunicados.jsx` (Fase 5) — agora no chrome de topo de toda a área administrativa.

### 2.7 Teclado

Medido na reprodução, dentro da página real:

- Os **três cards de "Atalhos"** (`AdminDashboard.jsx:343, 361, 376`) são `<div onClick>` sem `tabIndex`, `role` ou `onKeyDown`. Medido: `tabIndex === -1`, recusa `.focus()`, ausente da ordem de Tab, `role === null`. **Inalcançáveis por teclado.** Recorrência exata do P0 de `ui/gradient-card.jsx` (Fase 10).
- **Zero** `role="dialog"`, `aria-modal`, trap de foco, `useDismissable` ou handler de Escape em todo o `AdminDashboard.jsx` e seus sub-painéis. O modal de criar/editar comunicado (`AdminComunicados.jsx:319`) — que escreve no feed real da intranet — não tem nenhum: Tab escapa para a página atrás, Escape não fecha, clique fora não fecha, foco não entra. 7ª recorrência.
- **Zero** `aria-current`, `aria-selected`, `aria-pressed`, `role="tab"`, `aria-live`, `role="status"`, `role="alert"` em toda a superfície. A aba ativa é comunicada **só por cor**, nos dois navegadores (sidebar e bottom bar). Nenhuma região live: o resultado de qualquer ação é mudo para leitor de tela.
- **Zero** `htmlFor` nos 4 arquivos; 7+ `<label>` órfãos (5 no modal de comunicado, 2 nos filtros de auditoria).

### 2.8 Alvos de toque

`::after` computa `content: none` em **todos** os controles — não há expansão por pseudo-elemento nesta tela, então nenhum destes é o falso positivo já catalogado. Confirmado também por `elementFromPoint` 6px fora da caixa (não resolve para o botão).

| Controle | Medido | 44px |
|---|---|---|
| NavRow da sidebar | 223 × **48** | ok |
| "Voltar à Intranet" | 223 × **44** | ok |
| Bottom nav | flex × **61** | ok |
| "Atualizar" | 152,5 × **46** | ok |
| Botão "Sair" (`h-9`) | 122,9 × **36** | **FALHA** |
| "Ver Tudo" | 59,2 × **20** | **FALHA** |
| Toggle admin (`min-h-[36px]`) | 159,2 × **36** | **FALHA** |
| Chip de filtro | 71,6 × **28** | **FALHA** |
| Editar/excluir comunicado | 37,8 × **36** | **FALHA** |
| Limpar busca | 37,4 × **25** | **FALHA** |
| "Filtrar" (Auditoria) | 67,8 × **36** | **FALHA** |
| Paginação | 78,8 × **34** | **FALHA** |

## 3. Lista priorizada

**[P0] Cabeçalho do Painel Admin hardcoded branco — título invisível nos 4 temas escuros** (§2.6). 1,23:1. `AdminDashboard.jsx:145`. Trocar por `C.surface`/`C.popover` + `C.line`.

**[P0] Os três cards de Atalhos são inalcançáveis por teclado** (§2.7). `role="button"` + `tabIndex={0}` + `onKeyDown` com a guarda `e.target !== e.currentTarget` já usada na Fase 10.

**[P0] Conceder/revogar admin não tem confirmação.** `AdminUsuarios.jsx:53` — um clique dispara `PUT /privilegios` sobre um usuário real. É a ação mais privilegiada do produto. Enquanto isso, *excluir um comunicado* tem `window.confirm`. Calibração de risco invertida. (Não testado ao vivo, por restrição — lido no código.)

**[P0] Modal de comunicado sem nenhuma semântica de diálogo** (§2.7). 7ª recorrência, no modal que escreve no feed real.

**[P1] `C.surface` sobre `C.accent` no nav ativo — 2,79:1 no claro, badge 2,20:1** (§2.1). Usar `C.onAccent`.

**[P1] Branco sobre accent reprova nos 5 temas em 6+ controles** (§2.2), incluindo `#EC7D23` hardcoded em Auditoria.

**[P1] Extremos de gradiente: 9,37:1 → 1,69:1 com a mesma cor de texto** (§2.3).

**[P1] `C.accentDeep` sobre `C.accentSoft` a 1,50–1,93:1 nos 4 escuros** (§2.4) — o rótulo "Admin" some.

**[P1] Bottom bar mobile expõe só 4 das 6 abas.** `menuItens.slice(0, 4)` (`AdminDashboard.jsx:222`): **Auditoria e Plantões são inalcançáveis abaixo de `lg`**. Sem `<nav>`, sem `aria-current`; estado ativo só por cor nos dois navegadores.

**[P1] Zero regiões live e zero estado ARIA** em toda a superfície (§2.7).

**[P1] 8 alvos de toque abaixo de 44px**, sem expansão por pseudo-elemento (§2.8).

**[P2]** `C.muted` como texto a 2,85–3,01:1 no claro (7ª+ reincidência) · 3× `alert()` com `e.message` cru do backend (banido desde a Fase 2) · `window.confirm` nativo · 7+ `<label>` sem `htmlFor` · dois sistemas de token entre painéis irmãos · mapas de ícone de ação duplicados e divergentes entre `AdminDashboard` e `AdminAuditoria` · falha de `dashboard-stats` só faz `console.warn`, KPIs ficam em "—" para sempre sem erro nem retry · hierarquia h1→h3 · ícone de auditoria hardcoded claro dentro de tema escuro · `text-faint/60` em Auditoria.

**[P3]** 6 achados advisory de fonte fora da rampa (1 é falso positivo de ícone, `fontSize: 120px`) · anel de foco global branco de 3px mede 2,79:1 sobre a linha ativa laranja.

## 4. Falsos positivos e limitações

- `AdminDashboard.jsx:349` `fontSize: 120px` — ícone decorativo `opacity-10`, não texto. Descartado.
- Detector cego por arquitetura de token (JS hook + inline style), não por ausência de problemas.
- **Não verificado ao vivo com dado real** (sem sessão admin): render dos sub-painéis com dados de produção, foco/Tab no DOM real, comportamento do `ResponsiveTable` em mobile, e o fluxo de `toggleAdmin`. Tudo acima veio de medição de token ao vivo + reprodução fiel + leitura de código.
