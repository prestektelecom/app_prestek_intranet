## Context

`NavRow` (`src/components/Sidebar.jsx:49-107`) é o botão de cada item de navegação da Sidebar
desktop. Ele já rastreia um estado local `hover` (`useState` + `onMouseEnter`/`onMouseLeave`)
usado para trocar `background`/`color` do botão inteiro; o ícone (`<span>` em volta de
`IconComponent`) só herda a cor via `currentColor`, sem nenhum estilo próprio.

Os ícones vêm de `src/components/common/Icons.jsx`: ~20 componentes funcionais sem props,
cada um um `<svg>` de traço que espalha o mesmo objeto `sk = { fill: 'none', stroke:
'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }`. Como
todos compartilham essa base, qualquer efeito aplicado no `<span>` que os envolve (via CSS/
inline style no wrapper, não no SVG em si) funciona igual para todos sem precisar tocar
`Icons.jsx` ícone por ícone.

O projeto já tem um anel `:focus-visible` global (`index.css:704`, documentado no requisito
"Foco visível do sistema" de `chrome-keyboard-access`) — a navegação por teclado não está
zerada, só mais pobre que o hover de mouse (que também muda fundo e cor, não só o anel).

## Goals / Non-Goals

**Goals:**
- Dar ao ícone de cada item da Sidebar um efeito de hover perceptível além da troca de cor
  (`transform: scale` + aumento de `stroke-width`), sem tocar largura/altura (sem layout
  shift).
- Fazer o mesmo efeito dispar por `:focus-visible` (Tab), não só por mouse — fechando o gap de
  paridade hover-vs-foco encontrado na exploração, em vez de alargá-lo.
- Manter o efeito uniforme entre os ~20 ícones sem coreografia por ícone.

**Non-Goals:**
- Nenhuma animação de "desenho" do traço (`stroke-dasharray`/`dashoffset`) — exigiria calcular
  o comprimento de cada path por ícone; custo de manutenção alto para um ganho marginal numa
  navegação vista dezenas de vezes por dia.
- Nenhuma coreografia por forma interna do ícone (ex.: os 4 retângulos do ícone de Início
  entrando em sequência) — não generaliza para ícones de geometria simples (círculo, traço
  único) e adicionaria uma "personalidade" diferente por ícone, o que as diretrizes de motion
  do `ui-ux-pro-max` desaconselham para elementos vistos com essa frequência.
- Nenhuma mudança na barra inferior mobile (`MobileBottomNav`) ou no sheet "Mais" — este
  change cobre só a Sidebar desktop, onde o hover de mouse existe; toque não tem estado de
  hover equivalente.

## Decisions

### D1 — Efeito único (escala + peso do traço), não uma família de efeitos por ícone

**Decisão:** todo ícone recebe o mesmo par de mudanças — `transform: scale(1.1)` no `<span>`
wrapper e `stroke-width` de 1.7 para 2 — disparado pelo mesmo estado que já controla o hover
de fundo/cor do `NavRow`.

**Alternativas consideradas:**
- Draw-in do traço via `stroke-dasharray`/`stroke-dashoffset`.
- Stagger das formas internas de cada ícone (ex.: retângulos do ícone de Início entrando em
  sequência).
- Nudge/translate do ícone na direção do conteúdo.

**Rationale:** as duas primeiras exigem trabalho por ícone (calcular comprimento de path ou
coreografar formas), sem generalizar para os ~20 ícones da lista; a terceira pressupõe uma
direção implícita que nem todo ícone tem (ex.: o ícone de Início é um grid, sem direção). O
efeito escolhido é `transform`-only (barato, sem layout shift) e funciona porque todos os
ícones já compartilham o mesmo objeto `sk` — zero ajuste por ícone.

### D2 — Foco por teclado dispara o mesmo estado do hover, não um efeito separado

**Decisão:** o botão do `NavRow` ganha `onFocus`/`onBlur` que alimentam o mesmo estado usado
por `onMouseEnter`/`onMouseLeave` (ou um estado irmão combinado num único booleano derivado,
ex. `isEmphasized = hover || focused`) — o efeito no ícone, o fundo e a cor do texto reagem
igual a hover de mouse e foco de teclado.

**Alternativas consideradas:**
- Deixar o foco só com o anel `:focus-visible` global (comportamento atual) e amarrar o efeito
  novo só ao mouse.
- Criar um tratamento visual diferente para foco (ex.: só o ícone reage, fundo/cor não).

**Rationale:** a primeira alternativa piora a paridade já imperfeita entre os dois modos de
interação (mouse ganharia um efeito a mais que teclado nunca vê); a segunda cria um terceiro
padrão visual sem necessidade. Unificar hover-mouse e foco-teclado no mesmo estado é a leitura
mais simples de "todo controle tem os mesmos estados", já é o padrão usado no resto do chrome
(`chrome-keyboard-access`).

## Risks / Trade-offs

- **`transition` em `stroke-width` nem sempre anima suave em todos os navegadores** (é uma
  propriedade de apresentação SVG, não CSS puro em alguns motores mais antigos) — mitigação:
  testar visualmente nos navegadores relevantes do projeto; se não animar suave em algum, o
  salto instantâneo de 1.7→2 ainda é aceitável (o `scale` já carrega a maior parte do efeito
  percebido).
- **Unificar hover e foco no mesmo estado visual também aplica o efeito de "peso" (fundo
  `C.surface`, texto `C.ink`) a itens focados por Tab que hoje só tinham o anel fino** — mudança
  de comportamento pré-existente, não só do ícone; vale confirmar que não conflita
  visualmente com o próprio anel `:focus-visible` desenhado por cima.
- Baixo risco geral: mudança é `transform`+atributo SVG, sem novo estado de dados, sem rota de
  backend, sem migration.
