# chrome-keyboard-access Specification

## Purpose
Acessibilidade por teclado e leitor de tela do chrome (Sidebar, header, sino, sheets): controles nativos com nome e estado ARIA, overlays dispensáveis com foco gerenciado, foco visível global e estado de navegação exposto.

## Requirements

### Requirement: Todo controle do chrome é um elemento interativo nativo
Card do usuário, linha "Modo Escuro", swatches de variante, itens de notificação, alça e botão fechar do sheet SHALL ser `button` (ou controle nativo equivalente) com nome acessível e estado ARIA.

#### Scenario: Card do usuário
- **WHEN** o card do usuário no rodapé da Sidebar recebe foco por Tab e Enter
- **THEN** o menu do perfil abre como `role="dialog"` (seus filhos são botões e um interruptor, não `menuitem`), e o botão expõe `aria-haspopup="dialog"` e `aria-expanded="true"`

#### Scenario: Modo Escuro
- **WHEN** a linha "Modo Escuro" é lida por leitor de tela
- **THEN** ela é anunciada como interruptor (`role="switch"`) com `aria-checked` refletindo o tema

#### Scenario: Swatches de variante
- **WHEN** um swatch de variante escura é focado
- **THEN** ele tem `aria-label` com o nome do tema e `aria-pressed` quando é a variante ativa

#### Scenario: Item de notificação
- **WHEN** um item do dropdown do sino é focado e Enter é pressionado
- **THEN** ele é marcado como lido, igual ao clique

### Requirement: Overlays dispensáveis e com foco gerenciado
Sino, menu do perfil, sheet "Mais" e sheet de perfil SHALL fechar com Escape e clique fora, mover o foco para dentro ao abrir e devolvê-lo ao gatilho ao fechar. Sheets SHALL travar o scroll do fundo enquanto abertos.

#### Scenario: Escape no sino
- **WHEN** o dropdown do sino está aberto e o usuário pressiona Escape
- **THEN** o dropdown fecha e o foco volta ao botão do sino

#### Scenario: Sheet trava o fundo
- **WHEN** o sheet "Mais" está aberto
- **THEN** `document.body` não rola, e ao fechar o scroll é restaurado

### Requirement: Foco visível do sistema
O sistema SHALL definir uma regra global `:focus-visible` com anel na cor de accent e SHALL NOT remover o outline de inputs de busca.

#### Scenario: Tab pela Sidebar
- **WHEN** o usuário navega por Tab pela Sidebar
- **THEN** cada item mostra anel de 2px na cor de accent, inclusive o campo de busca

### Requirement: Estado de navegação exposto
O item ativo da navegação SHALL ter `aria-current="page"`; o botão de colapsar SHALL ter `aria-expanded`; a barra inferior SHALL ter `aria-label`; o sheet "Mais" SHALL ter `role="dialog"`, `aria-modal="true"` e `aria-label`.

#### Scenario: Leitor de tela na barra inferior
- **WHEN** o usuário está em Plantão e lê a barra inferior
- **THEN** o slot "Plantão" é anunciado como página atual

### Requirement: Paridade de tratamento visual entre hover de mouse e foco de teclado na Sidebar
Cada item de navegação da Sidebar SHALL aplicar o mesmo tratamento visual de ênfase (fundo, cor e efeito no ícone) tanto quando recebe hover de mouse quanto quando recebe foco de teclado, sem depender só do anel `:focus-visible` global. O ícone SHALL crescer de forma sutil (`transform: scale(1.1)`) e aumentar o traço (`stroke-width` de 1.7 para 2) em ~160ms `ease-out`, sem alterar `width`/`height` e sem causar deslocamento de layout nos itens vizinhos. O item ativo da rota atual SHALL manter prioridade visual sobre o estado de ênfase.

#### Scenario: Hover de mouse
- **WHEN** o ponteiro passa sobre um item da Sidebar
- **THEN** o ícone do item cresce e ganha traço mais grosso, e o fundo e a cor do texto assumem o estado de ênfase

#### Scenario: Foco de teclado
- **WHEN** um item da Sidebar recebe foco por Tab
- **THEN** ele mostra o mesmo efeito de ícone, fundo e cor do hover de mouse, além do anel `:focus-visible` de 2px em torno do botão

#### Scenario: Anel e efeito não se sobrepõem
- **WHEN** um item está focado por teclado
- **THEN** o anel `outline` envolve o botão inteiro e o efeito de `transform` afeta só o ícone interno, sem sobreposição espacial entre os dois

#### Scenario: Item ativo
- **WHEN** o item da rota atual recebe hover ou foco
- **THEN** o fundo e a cor de item ativo continuam prevalecendo sobre o estado de ênfase

#### Scenario: Movimento reduzido
- **WHEN** o sistema tem `prefers-reduced-motion: reduce` ativo
- **THEN** a transição do ícone é neutralizada pela regra global de `index.css`, sem regra adicional
