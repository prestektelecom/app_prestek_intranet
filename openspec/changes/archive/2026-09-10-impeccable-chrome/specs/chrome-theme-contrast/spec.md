## ADDED Requirements

### Requirement: Contraste mínimo do texto do chrome nos cinco temas
Todo texto do chrome (rótulos de navegação, overlines, cargo, badge do sino, cabeçalhos de grupo, rótulos da barra inferior, "Sair da Conta") SHALL ter contraste ≥ 4,5:1 contra seu fundo em claro, Default Dark, Cyber-Obsidian, Deep-Space Aurora e AMOLED.

#### Scenario: Badge do sino no escuro
- **WHEN** há apenas comunicados importantes não lidos e o tema é AMOLED
- **THEN** o número do badge é legível (texto escuro sobre amarelo), com contraste ≥ 4,5:1

#### Scenario: Rótulo ativo da barra inferior no escuro
- **WHEN** o tema é Deep-Space Aurora e o slot "Plantão" está ativo
- **THEN** o rótulo usa uma cor de texto do tema (não `accentDeep`) com contraste ≥ 4,5:1

#### Scenario: Overlines no claro
- **WHEN** o tema é claro
- **THEN** "MENU", "SISTEMA" e o cargo do usuário usam `ink2`, não `muted`

### Requirement: Overlays opacos
Dropdown do sino, menu do perfil, sheet "Mais" e sheet de perfil SHALL usar um token `popover` opaco em todos os temas.

#### Scenario: Sino no Cyber-Obsidian
- **WHEN** o dropdown do sino abre sobre o dashboard no tema Cyber
- **THEN** nenhum texto do dashboard é visível através do dropdown

### Requirement: Variante Default Dark alcançável
O seletor de tema SHALL oferecer a variante Default Dark (bloco `.dark` sem sufixo) além de Cyber-Obsidian, Deep-Space Aurora e AMOLED, e SHALL usá-la como padrão quando o usuário nunca escolheu variante.

#### Scenario: Primeiro uso do modo escuro
- **GIVEN** `localStorage` sem `dark_theme_variant`
- **WHEN** o usuário liga "Modo Escuro"
- **THEN** o `documentElement` recebe apenas a classe `dark` e o `useBentoTheme` retorna o objeto Default Dark

#### Scenario: Preferência antiga preservada
- **GIVEN** `localStorage.dark_theme_variant === 'cyber'`
- **WHEN** o portal carrega
- **THEN** o tema Cyber-Obsidian continua aplicado

### Requirement: Cores do chrome por token
Componentes do chrome SHALL NOT usar hex literal para cor de texto, fundo, borda ou sombra; swatches do seletor SHALL derivar a cor dos objetos de tema.

#### Scenario: Borda do badge
- **WHEN** o badge do sino é renderizado em qualquer tema
- **THEN** sua borda usa a cor da superfície do botão do sino (`C.surface`), não `#F5F9FF`, e o texto do badge usa `onDanger`/`onWarning`
