## Why

Hoje o hover de um item da Sidebar (`NavRow`, `src/components/Sidebar.jsx:49-107`) só muda
cor: o fundo do botão vai de `transparent` para `C.surface` e o texto/ícone de `C.ink2` para
`C.ink`/`C.accent`, via um `transition: 'background .12s, color .12s'` no botão — o `<span>`
que envolve cada `IconComponent` (de `src/components/common/Icons.jsx`, ~20 ícones SVG de
traço, todos compartilhando o mesmo objeto de stroke `sk`) não tem nenhuma transformação
própria. Achado explorando a tela com a skill `ui-ux-pro-max`: dar ao ícone em si um efeito
sutil de hover/foco (não só herdar a cor do texto) é um reforço barato de affordance numa
navegação que o usuário olha dezenas de vezes por dia.

No caminho, achado um gap de paridade: o estado `hover` do `NavRow` só é setado por
`onMouseEnter`/`onMouseLeave` — navegação por teclado (Tab) não aciona o mesmo tratamento de
fundo/cor, só o anel `:focus-visible` global já documentado em `chrome-keyboard-access`
(`index.css:704`). Ou seja, hoje o item focado por teclado já tem *algum* feedback (o anel),
mas não o mesmo tratamento mais rico que o mouse recebe — e se o efeito novo no ícone for
amarrado só a `onMouseEnter`, essa divergência cresce em vez de encolher.

## What Changes

- O `<span>` do ícone em `NavRow` ganha `transform: scale(1.1)` + aumento de `stroke-width`
  (1.7 → 2) em hover, ~150-180ms `ease-out` — só `transform` e um atributo do SVG, nunca
  `width`/`height`, para não causar layout shift.
- O mesmo efeito passa a disparar também em `:focus-visible` por teclado — o botão ganha
  `onFocus`/`onBlur` unificados com o `hover` state já existente (ou um estado irmão), então
  Tab produz o mesmo tratamento visual que o mouse, não só o anel global.
- Aplica-se uniformemente aos ~20 ícones de `Icons.jsx` sem ajuste por ícone (todos herdam o
  mesmo objeto `sk` de stroke).
- Respeita o `prefers-reduced-motion` já coberto globalmente em `index.css` (linhas 728, 920)
  — nenhuma regra nova precisa ser adicionada para isso.

## Capabilities

### New Capabilities
- (nenhuma)

### Modified Capabilities
- `chrome-keyboard-access` — a paridade entre hover de mouse e foco de teclado na Sidebar
  ganha um requisito explícito (hoje a spec só cobre a existência do anel `:focus-visible`,
  não a paridade de tratamento visual entre os dois modos de interação).

## Impact

- `src/components/Sidebar.jsx` (`NavRow`) — efeito de hover/foco no ícone, novo estado de foco
  unificado com o hover existente.
- `src/components/common/Icons.jsx` — nenhuma mudança de geometria; só precisa continuar
  compartilhando o objeto `sk` de stroke para o efeito valer uniformemente.
- Nenhuma rota de backend, nenhuma migration, nenhum dado — mudança 100% de interação/CSS.
