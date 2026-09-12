## Context

Escopo P0+P1 dos relatórios de crítica (`.impeccable/critique/2026-09-12T19-11-53Z__src-components-comunicados-jsx.md`, 17/36) e audit (9/20, Ruim) da Fase 5 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. Trap de foco e semântica de diálogo em `CrudModal`/`DeleteModal` (P0)

Mesmo padrão já usado em `TiSupportModal` (Fase 3) e `ManagePlantaoModal` (Fase 4): `useDismissable(modalRef, { open, onClose, lockScroll: true, closeOnOutside: true })` para Escape + clique fora + foco de entrada/retorno, mais um `trapTab` local ligado a `onKeyDown` no container do diálogo. Adicionar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h2>`/título de cada modal. Aplicar aos dois modais (`CrudModal` e `DeleteModal`), já que nenhum dos dois tem qualquer gerenciamento de foco hoje (pior que o achado da Fase 4, que ao menos movia o foco).

### 2. Contraste crítico em `AdminComunicados.jsx` (P0)

Trocar `bg-white` (linha ~257) pelo token de superfície já usado no resto do painel admin (`bg-surface` ou equivalente — confirmar qual token o restante do `AdminComunicados.jsx`/painel admin já usa antes de escrever, para manter consistência local). Não alterar `style={{ color: C.ink }}` do título — uma vez que o fundo passa a acompanhar o tema, `C.ink` (que já é a cor de texto correta do tema) volta a fazer sentido.

### 3. Tokens de contraste em badges e chips (P1)

- `getTypeMeta` (`Comunicados.jsx:52-71`): trocar `color: C.danger` / `C.warning` / `C.success` por `C.dangerStrong` / `C.warningStrong` / `C.successStrong` — exatamente o par documentado em `useBentoTheme.js` para texto sobre fundo `-Soft` (`soft: C.dangerSoft` etc. permanecem inalterados).
- `ChipButton` (`Comunicados.jsx:478-513`), badge de contagem (linha ~505):
  - Estado inativo: `color: C.muted` → `color: C.ink2`. `C.muted` é reservado para ícone inativo/placeholder, nunca texto abaixo de 14px — regra transversal já documentada na Fase 1 do programa (`programa-impeccable/tasks.md`, seção Transversal) e violada aqui.
  - Estado ativo: `color: 'white'` → `color: C.onAccent` — o token existe exatamente para "texto sobre o laranja (badge ativo)", conforme o comentário-fonte de `useBentoTheme.js`.
- Escopo desta correção: só o texto do badge de contagem (a violação medida). O texto do label do chip (linha ~494, `color: active ? color : ...` sobre um fundo de 12% de opacidade da mesma cor) não foi medido como falha por nenhum dos dois assessments e não entra no escopo.

### 4. Truncamento do corpo do comunicado (P1)

`ComunicadoCard` (`Comunicados.jsx:515+`): a descrição usa `whiteSpace: 'pre-wrap'` sem limite. Adicionar `line-clamp` (3-4 linhas) com um estado local `expandido` por card e um botão "Ler mais"/"Ler menos" para expandir sob demanda — preserva o conteúdo completo (não trunca dados, só a exibição inicial). Separadamente, remover asteriscos literais de markdown (`*texto*`) antes de exibir, com uma função simples de sanitização (`descricao.replace(/\*(.*?)\*/g, '$1')`), sem introduzir uma biblioteca de markdown completa — o objetivo é parar de mostrar o caractere cru, não renderizar negrito de verdade.

## Fora de escopo (P2/P3, registrados no audit/memória)

- Chips de filtro com 36px de altura (abaixo do mínimo de 44px).
- 5 achados de tamanho de fonte fora da rampa do DESIGN.md.
- Hierarquia de headings (h1 → h3 sem h2).
- Ícones de editar/excluir só com `title`, sem `aria-label`.
- Placeholder do campo de busca cortado sem reticências a 390px.
- Inconsistências de copy/formatação de data entre `Comunicados.jsx` e `AdminComunicados.jsx` ("DEPTO." vs "DEPTO:", "10 jul" vs "10 de jul.").
- Divergência de contagem entre o hero (todos) e os chips (filtrados por busca).
