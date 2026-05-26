## Context

`Directory.jsx` é o componente da aba "Colaboradores" da intranet Prestek. Atualmente tem ~317 linhas com: header textual simples, busca + `<select>` de departamento, grid 4 colunas de cards genéricos (avatar, nome, ramal, email, status) e paginação numérica de 8 itens/página.

O projeto usa **React + Vite**, **Tailwind CSS** (utility-first) e inline styles em JS (padrão do Dashboard). A paleta oficial segue o objeto `C` definido no `Dashboard.jsx`:
- `accent: #4A9EF5`, `accentDeep: #1F5BA8`, `accentSoft: #EAF4FF`
- `ink: #0B1B2E`, `ink2: #475467`, `muted: #8896A8`, `line: #E4ECF5`
- `success: #1F8A5B`, `warning: #D97706`, `danger: #E84545`

Fonts: `"Plus Jakarta Sans"` (corpo) + `"JetBrains Mono"` (labels/mono).

## Goals / Non-Goals

**Goals:**
- Hero banner com gradiente idêntico ao Dashboard (sem criar componente extra)
- Busca inline centralizada no hero (UX moderna, busca visível imediatamente)
- KPIs de métricas no hero (total colaboradores, ativos, nº de deptos)
- Chips horizontais scrolláveis para filtro de departamento (com `overflow-x: auto` e `scrollbar-hide`)
- Cards redesenhados: borda-esquerda colorida por depto, avatar ring colorido, hover reveal de ações (email + telefone)
- Indicador de presença pulsante (`.pulse-online` via CSS keyframe)
- Scroll infinito nativo com `IntersectionObserver` — sem lib externa
- Manter toda a lógica de dados intacta (fetch hooks, `resolverDepartamento`, `sessionStorage`)

**Non-Goals:**
- Não adicionar novas dependências npm
- Não criar novos endpoints de API
- Não modificar `Sectors.jsx`, `Sidebar.jsx` ou outros componentes
- Não implementar dark mode adicional (o projeto usa classes Tailwind para isso)
- Não criar modal de perfil expandido (pode ser fase futura)

## Decisions

### D1 — Scroll infinito via IntersectionObserver (sem lib)
**Decisão**: Usar `useRef` + `IntersectionObserver` nativos.
- Alternativa considerada: `react-infinite-scroll-component` (lib externa — evitada para não aumentar bundle)
- Alternativa considerada: manter paginação e apenas redesenhar (rejeitada — UX inferior para centenas de registros)
- **Batch size**: 16 cards por carga. Ao observar o "sentinel" div no final da lista, incrementa `visibleCount`.

### D2 — Chips de filtro com contador
**Decisão**: Renderizar `<button>` para cada departamento único com badge de contagem.
- Scroll horizontal com `scrollbar-hide` (já definido no `index.css`)
- Chip ativo: `background: accentSoft, color: accentDeep, border: accent`
- Chip inativo: `background: white, color: ink2, border: line`
- "Todos" sempre o primeiro chip, com total geral

### D3 — Sistema de cores por departamento
**Decisão**: Mapa estático de palavras-chave → cor. Mesma abordagem do `ICON_MAP` em `Sectors.jsx`.
```js
const DEPT_COLORS = [
  { keys: ['atendimento', 'suporte', 'relacionamento'], color: '#4A9EF5' },   // azul
  { keys: ['ti', 'tecnologia', 'noc', 'sistema'],       color: '#7FD4E8' },   // cyan
  { keys: ['comercial', 'venda', 'marketing'],           color: '#D97706' },   // âmbar
  { keys: ['financeiro', 'cobrança', 'cobranc'],         color: '#1F8A5B' },   // verde
  { keys: ['rh', 'recursos humanos', 'gestão'],          color: '#8B5CF6' },   // violeta
  { keys: ['instalação', 'campo', 'tecnico', 'tecnic'], color: '#E84545' },   // coral
  { keys: ['infraestrutura', 'infra', 'frota'],          color: '#0B1B2E' },   // ink
];
// fallback: #8896A8 (muted)
```

### D4 — Hero com busca inline
**Decisão**: Campo de busca embutido dentro do hero banner (não abaixo dele).
- Layout: gradiente `linear-gradient(120deg, accentDeep, accentDark, accent)` — idêntico ao `HeroCard` do Dashboard
- Grid pattern SVG overlay e blur orbs (cópia exata do `HeroCard`)
- Input estilizado com `background: rgba(255,255,255,0.15)` + `backdropFilter: blur(6px)` (glassmorphism)
- KPIs: 3 pills (`total`, `ativos`, `deptos`) com estilo `rgba(255,255,255,0.18)`

### D5 — Card v2: estrutura e hover
**Decisão**: Card com `position: relative`, borda esquerda colorida (4px), avatar ring e hover reveal via CSS transitions.
- Estado normal: mostra nome, depto, ramal
- Estado hover: revela 2 botões de ação (email + telefone) com `opacity 0 → 1` + `translateY(4px → 0)`
- Indicador de presença: bolinha `#1F8A5B` com `box-shadow: 0 0 0 0 rgba(31,138,91,0.4)` pulsando via `@keyframes pulse`

## Risks / Trade-offs

- **Rewrite total do JSX** → Risco de regressão na lógica de dados. Mitigação: manter todos os hooks e funções utilitárias sem alteração, apenas substituir o JSX de retorno.
- **IntersectionObserver** → Não suportado em IE11 (irrelevante para intranet corporativa moderna).
- **Mapa de cores estático** → Departamentos com nomes não mapeados receberão cor `muted`. Mitigação: o fallback é neutro e não quebra o visual.
- **Scroll infinito + busca/filtro** → Ao mudar filtro, `visibleCount` deve resetar para 16. Mitigação: `useEffect([busca, deptoFiltro])` reseta o contador.
