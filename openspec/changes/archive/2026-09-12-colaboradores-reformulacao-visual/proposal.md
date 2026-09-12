## Why

`src/components/Directory.jsx` (a aba **Colaboradores**) é a última tela grande da intranet que não foi migrada para os padrões que a Central de Vendas, a Cobertura e o Setor TI já consolidaram. São 681 linhas num arquivo só, quase 100% em `style={{}}` inline, com seis subcomponentes declarados no mesmo arquivo.

O problema não é organizacional, é funcional: a tela **reimplementa localmente quatro utilitários que já existem** em `src/components/ui/` e, ao reimplementar, reintroduziu exatamente os bugs que aqueles utilitários foram criados para corrigir. O comentário no topo de `ui/HeroSearchInput.jsx:4-6` já registra que esta migração estava planejada ("aquelas duas páginas migram num commit à parte").

Levantamento do estado atual:

| Severidade | Problema |
|---|---|
| **WCAG 1.4.3** | A parada do meio do gradiente do hero é `C.accentDark`, que **inverte** nos três temas escuros (`#C2410C` → `#FDBA74`). Branco sobre pêssego dá **1,71:1**, e é onde ficam o subtítulo e o campo de busca. É a inversão já documentada em `ui/heroGradiente.js:5-23`. |
| **WCAG 1.4.3 / 1.4.11** | `DEPT_COLORS` são oito hex fixos, independentes de tema, usados como **cor de texto** no badge de 11,5px e como borda de 4px. Reprovam 4,5:1 nos oito departamentos — TI (`#FDBA74`) a **1,69:1** no tema claro; Frota (`#0B3D6B`) e Diretoria (`#374151`) somem no amoled. |
| **WCAG 2.4.7** | As ações de contato do card só existem no `:hover`, sem `:focus-within`. Quem navega por teclado tabula para um `<a>` com `opacity: 0`. A media query de fallback (`hover: none and pointer: coarse`) não cobre notebook Windows com touchscreen e mouse. |
| **WCAG 1.4.11 / 2.5.8** | O campo de busca tem `outline: 'none'` e sinaliza foco só pela borda (2,19:1). O botão `✕` tem ~20×20px e nenhum `aria-label`. |
| **Confiabilidade** | **Não existe estado de erro.** Todo fetch tem `.catch(() => null)` e o `finally` sempre limpa o loading, então queda de backend é renderizada como "Nenhum colaborador encontrado" — uma falha de infraestrutura apresentada como fato de negócio. |
| **Correção** | `getDeptColor` usa `includes('ti')` com TI no índice 1: **"Marketing" e "Logística" recebem a cor do TI**. E as chaves não têm acento, então "Suporte Técnico" não casa com `'tecnic'` e cai no cinza. |
| **Correção** | Três contadores discordam entre si: o chip do departamento 13 mostra `N` mas clicar exibe `N + count(15) + count(68)`; o KPI "Departamentos" conta ids brutos enquanto a faixa de chips filtra `(INATIVO)`. |
| **Semântica** | Zero `aria-`, `role=` ou `tabIndex` no arquivo inteiro. Um diretório de pessoas não é `<ul>`, o scroll infinito injeta 16 cards sem live region, e há salto de heading `h1` → `h3`. |
| **Layout** | `maxWidth: 1440`, padding `32px` fixo (não responsivo), vertical assimétrico (32 topo / 48 base) e ritmo interno de quatro valores (28/24/20/20) — divergente da Central de Vendas, que é a referência de espaçamento do projeto. |

Além disso, a tela só oferece grid de cards. Para a tarefa mais comum — "qual o ramal do fulano?" — quatro colunas de cards altos são pouco densos numa base de ~200 pessoas.

**Correção de uma premissa comum:** não há azul hardcoded no código. `Directory.jsx` já usa `C.accentDeep / accentDark / accent` e é laranja nos cinco temas. O azul `#1F5BA8/#2D7BD4/#4A9EF5` só sobrevive nas specs arquivadas, que esta change corrige.

## What Changes

- **Reescrita em `src/components/directory/`.** `Directory.jsx` fica só com shell, fetch, filtros e estado (~200 linhas). Seis módulos novos assumem a apresentação.

- **Hero sobre os primitivos compartilhados.** `fundoHero(C)` + `HeroSearchInput` + retícula de pontos + painel de KPIs em `bg-black/60`, exatamente como `TiHero`/`CoverageHero`/`ServicesHero`. Resolve num commit: rampa invertida, foco a 2,19:1, alvo de 20px do `✕`, emoji no `<h1>`, dois blur orbs mortos (um deles usa `C.cyan`, que vale `#FDBA74` nos quatro temas — pêssego sobre laranja) e o `maxWidth: 1440` morto dentro do hero.

- **Duas rampas de cor por departamento**, selecionadas por tema: `tinta` (texto, ≥4,5:1) e `marca` (faixa e borda, ≥3:1). Matcher com normalização NFD e limite de palavra.

- **Alternância grid/lista.** Segmented control reusando o padrão já repetido em `Ti.jsx`, `Coverage.jsx` e `ServicesFilterBar.jsx`. A lista compacta mostra ~5x mais pessoas por tela. Preferência persistida em `localStorage`.

- **Estado de erro com "Tentar novamente"**, mais um aviso distinto para falha **parcial** (quando só as APIs de departamento caem e todos os cards ficam cinza silenciosamente).

- **Ações de contato visíveis por padrão**, escondidas só onde o hover é confiável, com `:focus-within`.

- **Semântica e ARIA**: `<ul>`/`<li>` no grid e na lista, `aria-live="polite"` no contador, `aria-pressed` nos chips (via o `ChipButton` compartilhado), `alt=""` no avatar, `<form role="search">`, hierarquia de heading corrigida.

- **Espaçamento alinhado à Central de Vendas**: `max-w-[1200px]`, `px-4 md:px-10`, `py-8` simétrico, `gap-8` único, grid de 3 colunas.

- **Correções pontuais**: `pulse-ring` removido (falsa affordance de presença + 16 animações de `box-shadow` simultâneas), verde do status vindo de `C.success` em vez de hardcoded, sombras visíveis nos temas escuros, `loading="lazy"` nos avatares, `sessionStorage.getItem` fora do corpo do render, `useEffect` com deps corretas.

## Capabilities

### New Capabilities

- **`directory-densidade`** — alternância entre visão em grid e visão em lista compacta, com persistência da preferência.

### Modified Capabilities

- **`people-hub-hero`** — o hero passa a ser construído sobre `ui/heroGradiente` e `ui/HeroSearchInput`; o requisito do gradiente azul é substituído pela rampa laranja compartilhada, e os KPIs migram das pílulas translúcidas para o painel escuro.
- **`employee-card-v2`** — ações de contato deixam de ser hover-only; o `pulse-ring` sai; as cores de departamento passam a ter duas rampas por tema.
- **`department-chip-filter`** — os chips passam a usar `ui/ChipButton` (ganham `aria-pressed`), o estilo ativo deixa de ser azul, e a faixa ganha pista visual de overflow.
- **`infinite-scroll-directory`** — o contador de resultados ganha `aria-live="polite"`; o grid vira lista semântica; o esqueleto passa a espelhar o layout real e o número do primeiro lote.

## Impact

**Frontend (novos):** `src/components/directory/DirectoryHero.jsx`, `DirectoryToolbar.jsx`, `EmployeeCard.jsx`, `EmployeeRow.jsx`, `DirectoryStates.jsx`, `deptColors.js`.

**Frontend (reescrito):** `src/components/Directory.jsx`.

**Reuso (sem alteração):** `ui/heroGradiente.js`, `ui/HeroSearchInput.jsx`, `ui/ChipButton.jsx`, `utils/tone.js`, `hooks/useBentoTheme.js`, `utils/avatarPngs.js`.

**Specs a atualizar:** `openspec/specs/people-hub-hero/`, `employee-card-v2/`, `department-chip-filter/`, `infinite-scroll-directory/`.

**Sem impacto** em backend, banco de dados, rotas ou qualquer outra tela. Nenhuma dependência nova.
