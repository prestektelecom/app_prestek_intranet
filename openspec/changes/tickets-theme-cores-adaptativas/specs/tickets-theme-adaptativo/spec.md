## ADDED Requirements

### Requirement: Cores da página de tickets adaptam-se ao tema ativo
O componente `TicketsList` SHALL usar exclusivamente tokens do `useBentoTheme` para todas as cores exibidas, incluindo container, estados de loading/erro/vazio e células da tabela. Nenhuma cor hexadecimal fixa ou classe Tailwind de cor hardcoded SHALL ser usada nas seções afetadas.

#### Scenario: Tema light ativo — visual sem regressão
- **WHEN** o tema ativo é `light`
- **THEN** a página de tickets exibe fundo branco (`C.surface`), bordas cinza-claro (`C.line`), textos em azul-escuro (`C.ink`) e azul médio (`C.ink2`), spinner em azul (`C.accent`), e o layout permanece idêntico ao anterior

#### Scenario: Tema dark-cyber ativo — cores dark aplicadas
- **WHEN** o tema ativo é `dark-cyber`
- **THEN** o container principal exibe fundo escuro (`C.surface = rgba(17,28,44,0.85)`), textos em claro (`C.ink = #F5F9FF`), spinner em ciano (`C.accent = #00F2FE`), e botão de erro com gradiente nas cores do tema

#### Scenario: Tema dark-aurora ativo — cores aurora aplicadas
- **WHEN** o tema ativo é `dark-aurora`
- **THEN** o container principal exibe fundo roxo-escuro (`C.surface = #161233`), textos em claro, acento em roxo (`C.accent = #8A2BE2`), sem nenhuma cor do tema light vazando

#### Scenario: Tema dark-amoled ativo — cores AMOLED aplicadas
- **WHEN** o tema ativo é `dark-amoled`
- **THEN** o container principal exibe fundo preto puro (`C.surface = #0A0A0A`), textos em branco (`C.ink = #FFFFFF`) e acento em azul claro (`C.accent = #4A9EF5`)

#### Scenario: Estado de loading respeita o tema
- **WHEN** os tickets estão sendo carregados e qualquer tema dark está ativo
- **THEN** o spinner e o texto "Buscando chamados no IXC..." usam cores do tema (não cores hardcoded do light)

#### Scenario: Estado de erro respeita o tema
- **WHEN** ocorre um erro ao carregar os tickets e qualquer tema dark está ativo
- **THEN** o ícone de erro usa `C.danger`, os textos usam `C.ink` e `C.ink2`, e o botão "Tentar Novamente" usa gradiente com `C.accentDeep` e `C.accent`

#### Scenario: Estado vazio respeita o tema
- **WHEN** nenhum ticket é retornado e qualquer tema dark está ativo
- **THEN** o ícone usa `C.muted`, o título usa `C.ink`, e o texto descritivo usa `C.ink2`

#### Scenario: Células da tabela respeitam o tema
- **WHEN** tickets são exibidos na tabela e qualquer tema dark está ativo
- **THEN** a coluna `#ID` usa `C.accent`, a coluna `Mensagem` usa `C.ink2`, e a coluna `Data` usa `C.ink2`
