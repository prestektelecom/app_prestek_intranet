## Purpose

Feed de comunicados renderizado como cards Bento, com filtros, busca e ordenação, na página principal de Comunicados (`Comunicados.jsx`).

## Requirements

### Requirement: Card Bento por comunicado
Cada comunicado SHALL ser renderizado como um card com `borderRadius: 18`, `border: 1px solid C.line`, `borderLeft: 4px solid <cor-do-tipo>`, fundo `C.surface` e `boxShadow` contextual.

#### Scenario: Renderização com bordas semânticas
- **WHEN** um comunicado do tipo "Urgente" é exibido
- **THEN** o card tem `borderLeft: 4px solid C.danger` (#E84545)

#### Scenario: Renderização Importante
- **WHEN** um comunicado do tipo "Importante" é exibido
- **THEN** o card tem `borderLeft: 4px solid C.warning` (#D97706)

#### Scenario: Renderização Geral
- **WHEN** um comunicado do tipo "Geral" é exibido
- **THEN** o card tem `borderLeft: 4px solid C.success` (#1F8A5B)

### Requirement: Hover effect no card
Ao passar o mouse sobre um card, o card SHALL executar `transform: translateY(-4px)` e exibir boxShadow contextual com a cor do tipo do comunicado.

#### Scenario: Hover eleva o card
- **WHEN** o usuário passa o mouse sobre um card de comunicado
- **THEN** o card sobe 4px e exibe sombra colorida com opacidade 15%

### Requirement: Badge de tipo com JetBrains Mono e contraste WCAG AA
O tipo do comunicado SHALL ser exibido como badge com `fontFamily: '"JetBrains Mono", monospace'`, texto em uppercase, com background `<tipo>Soft` e cor de texto na variante `<tipo>Strong` do token semântico (não o tom base), garantindo contraste ≥ 4,5:1.

#### Scenario: Badge Urgente
- **WHEN** o comunicado é do tipo "Urgente"
- **THEN** o badge exibe "URGENTE" com `background: C.dangerSoft` e `color: C.dangerStrong`

#### Scenario: Badge Importante ou Geral
- **WHEN** o comunicado é do tipo "Importante" ou "Geral"
- **THEN** o badge usa `C.warningStrong` ou `C.successStrong`, respectivamente, sobre o `-Soft` correspondente

### Requirement: Metadados com tipografia JetBrains Mono
A data de criação e o departamento autor SHALL ser exibidos com `fontFamily: '"JetBrains Mono", monospace'` em `C.muted`, usando formato de tempo relativo (ex: "há 2h", "3d", "14 jun").

#### Scenario: Data recente
- **WHEN** o comunicado foi criado há menos de 24 horas
- **THEN** a data exibe "há Xh" onde X é o número de horas

#### Scenario: Data mais antiga
- **WHEN** o comunicado foi criado há 7 ou mais dias
- **THEN** a data exibe no formato "DD mmm" (ex: "14 jun")

### Requirement: Link opcional no rodapé do card
Quando `item.link_opcional` está presente, o card SHALL exibir uma linha divisória e um link "Ver mais →" com `color: C.accent` e animação `arrow_forward` no hover.

#### Scenario: Link presente
- **WHEN** o comunicado tem `link_opcional` preenchido
- **THEN** o rodapé do card exibe o link com ícone de seta que avança no hover

#### Scenario: Link ausente
- **WHEN** o comunicado não tem `link_opcional`
- **THEN** nenhum rodapé com link é renderizado

### Requirement: Layout grid responsivo
Os cards SHALL ser organizados em grid: 1 coluna em mobile, 2 colunas em `md`, 3 colunas em `lg`.

#### Scenario: Grid em desktop
- **WHEN** o viewport é >= 1024px
- **THEN** os comunicados são exibidos em 3 colunas

### Requirement: Skeleton de carregamento
Durante o fetch inicial da API, SHALL ser exibidos 6 cards skeleton animados (pulse) com as mesmas dimensões do card real.

#### Scenario: Loading state
- **WHEN** `loading === true`
- **THEN** 6 cards skeleton com animação pulse são exibidos no grid

### Requirement: Estado vazio
Quando não há comunicados após aplicar filtros, SHALL ser exibido um estado vazio centralizado com ícone `C.accentSoft`, título e botão "Limpar filtros" que reseta busca e tipo.

#### Scenario: Sem resultados com filtro ativo
- **WHEN** o filtro ou busca não retorna comunicados
- **THEN** o empty state com botão "Limpar filtros" é exibido

#### Scenario: Ações de edição admin no card
- **WHEN** o usuário tem `is_admin === true`
- **THEN** os botões de editar e excluir aparecem no canto do card com `C.muted` e hover colorido

### Requirement: Truncamento do corpo do comunicado

O corpo (`descricao`) de cada card SHALL ser truncado a um número máximo de linhas por padrão, com uma forma de expandir para ler o conteúdo completo. Asteriscos literais de markdown (`*texto*`, comuns em texto colado do WhatsApp) SHALL ser removidos antes da exibição.

#### Scenario: Descrição longa
- **WHEN** um comunicado tem descrição que excede o limite de exibição padrão (~220 caracteres)
- **THEN** o card exibe até 4 linhas com um botão "Ler mais"
- **AND** clicar em "Ler mais" expande para o texto completo e o botão passa a exibir "Ler menos"

#### Scenario: Descrição curta
- **WHEN** um comunicado tem descrição dentro do limite de exibição padrão
- **THEN** o card exibe a descrição completa, sem botão de expandir

#### Scenario: Descrição com markdown de WhatsApp
- **WHEN** a descrição contém texto entre asteriscos (ex: `*ATENÇÃO*`)
- **THEN** o card exibe o texto sem os caracteres de asterisco
