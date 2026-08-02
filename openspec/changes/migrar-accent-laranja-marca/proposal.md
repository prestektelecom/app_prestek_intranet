## Why

O app rodava com **três identidades visuais simultâneas e nenhuma era a da marca**:
teal `#0D9488` no Bento (de uma tentativa anterior, rejeitada), azul-céu `#4A9EF5` no
Login/NotFound, e o `Logo_P.webp` laranja/navy cru na Sidebar ao lado de tudo isso.

As cores reais da Prestek foram extraídas dos pixels de `src/image/logos/` — os únicos
assets de marca do projeto (não existe SVG, favicon nem manifest):

| Cor | Hex | Onde aparece no logo |
|---|---|---|
| Laranja | **`#EC7D23`** | parênteses `(p)`, ondas, "TELECOM" |
| Navy | **`#064496`** | onda interna, wordmark "PRESTEK" |

Este change adota o laranja do logo como accent em todo o app.

Contexto histórico: changes arquivados de jul/2026 removeram laranja/âmbar de propósito
(`comunicados-bento-blue-redesign/tasks.md:67` proíbe `orange-`/`amber-`). Esta decisão
reverte aquela, com o usuário ciente.

## What Changes

- `accent`, `accentDark`, `accentDeep`, `accentSoft`, `cyan` migram para a escala laranja
  nos 4 objetos de `useBentoTheme.js` e nos 5 blocos de `index.css`
- `warning` migra de âmbar para **amarelo** — com accent laranja, "aviso" e "destaque"
  passavam a ser o mesmo tom
- Os **382 hex azuis de marca** em 33 arquivos migram junto
- Login e NotFound deixam de ter identidade própria e adotam o accent geral
- Nenhuma funcionalidade ou comportamento é alterado

## Capabilities

### New Capabilities

*(nenhuma — mudança puramente de estilo)*

### Modified Capabilities

*(nenhuma — sem alteração de requisitos comportamentais)*

> `skip_specs: true` — refactor visual puro, sem requisitos de comportamento.

## Impact

### Escala

`accentDeep` precisa ser bem mais escuro que `accent`, e nos temas escuros `accentDark`
fica **mais claro** que `accent` — é o brilho do meio do gradiente do hero, papel que o
`#7AB8F8` original cumpria.

| Token | LIGHT | CYBER / AMOLED / `.dark` | AURORA |
|---|---|---|---|
| `accent` | `#EC7D23` (marca) | `#F97316` | `#FB923C` |
| `accentDark` | `#C2410C` | `#FDBA74` | `#FDBA74` |
| `accentDeep` | `#7C2D12` | `#7C2D12` | `#9A3412` |
| `accentSoft` | `#FFF7ED` | `rgba(249,115,22,α)` | `rgba(251,146,60,α)` |
| `cyan` | `#FDBA74` | `#FDBA74` | `#FDBA74` |
| `warning` | `#CA8A04` | `#FACC15` | `#FACC15` |

Alphas de `accentSoft` preservados por tema (0.12 no Cyber, 0.15 nos demais).

### Fontes de cor tocadas

1. **`src/hooks/useBentoTheme.js`** — 4 objetos; ~38 componentes herdam via `useBentoTheme()`
2. **`src/index.css`** — 5 blocos (`--accent*`, `--primary*`, `--ring`, `--hover-border-*`)
   mais 11 valores fora dos blocos que nenhum token alcança: `@keyframes login-pulse`,
   `.layout.is-editing`, `@keyframes glow-pulse`, o `conic-gradient` de
   `.bento-hover-border::before` e `.widget-editable:hover`
3. **382 hex em 33 arquivos** — maiores: `Coverage.jsx` (53), `Schedule.jsx` (42),
   `Processos.jsx` (33), `RankingPodium.jsx` (28), `Offices.jsx` (27), `schedule/*` (~75)

### Fora de escopo

Classes Tailwind `blue-*` categóricas permanecem azuis — ver D5. Com accent laranja a
coexistência ficou mais confortável que com teal.
