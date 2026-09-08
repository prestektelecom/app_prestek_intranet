## ADDED Requirements

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
