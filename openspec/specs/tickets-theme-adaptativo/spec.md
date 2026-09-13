# tickets-theme-adaptativo Specification

## Purpose

A página "Meus Chamados" (`TicketsList.jsx`) precisa se manter legível e consistente nos cinco temas do produto — não pode ter cores fixas de um único tema "vazando" para os outros.

## Requirements

### Requirement: Cores da página de tickets adaptam-se ao tema ativo
O componente `TicketsList` SHALL usar exclusivamente tokens do `useBentoTheme` para todas as cores exibidas, incluindo container, estados de loading/erro/vazio e células da tabela. Nenhuma cor hexadecimal fixa ou classe Tailwind de cor hardcoded SHALL ser usada nas seções afetadas (exceto decoração intencionalmente neutra, como o ponto branco do hero, que já é branco em todos os temas por sentar sobre o gradiente de marca).

#### Scenario: Container principal reflete o tema ativo
- **WHEN** qualquer tema (claro ou escuro) está ativo
- **THEN** o container principal usa `C.surface` como fundo e `C.line` como borda, sem nenhum valor hexadecimal fixo

#### Scenario: Estado de loading respeita o tema
- **WHEN** os tickets estão sendo carregados
- **THEN** o spinner usa `C.accentSoft`/`C.accent` e o texto "Buscando chamados no IXC..." usa `C.ink2`

#### Scenario: Estado de erro respeita o tema
- **WHEN** ocorre um erro ao carregar os tickets
- **THEN** o ícone de erro usa `C.danger`, os textos usam `C.ink` e `C.ink2`, e o botão "Tentar Novamente" usa gradiente com `C.accentDeep` e `C.accent`

#### Scenario: Estado vazio respeita o tema
- **WHEN** nenhum ticket é retornado
- **THEN** o ícone usa `C.muted`, o título usa `C.ink`, e o texto descritivo usa `C.ink2`

#### Scenario: Células da tabela respeitam o tema
- **WHEN** tickets são exibidos na tabela
- **THEN** a coluna `#ID` usa `C.accent`, a coluna `Assunto` usa `C.ink2`, e a coluna `Data` usa `C.ink2`
