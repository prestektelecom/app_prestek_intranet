# bento-blue-global-tokens Specification

## Purpose
Variáveis CSS semânticas globais e container raiz do design system Bento. Nota: descreve a paleta "Bento Blue" (azul), já substituída pela marca laranja; vale como registro histórico, não como o estado atual do tema. Os tokens vigentes estão em `index.css` e no `DESIGN.md`.

## Requirements

### Requirement: Variáveis semânticas globais usam paleta Bento Blue
O arquivo `src/index.css` SHALL redefinir as variáveis semânticas para a paleta Bento Blue, de forma que classes Tailwind como `bg-background`, `text-foreground`, `border-border`, `bg-primary` e `text-primary` renderizem cores Bento.

#### Scenario: Background primário
- **WHEN** um elemento usa `bg-background`
- **THEN** o background SHALL ser `#F5F9FF`

#### Scenario: Texto primário
- **WHEN** um elemento usa `text-foreground`
- **THEN** a cor do texto SHALL ser `#0B1B2E`

#### Scenario: Cor primária
- **WHEN** um elemento usa `bg-primary` ou `text-primary`
- **THEN** a cor SHALL ser `#4A9EF5`

#### Scenario: Bordas
- **WHEN** um elemento usa `border-border`
- **THEN** a cor da borda SHALL ser `#E4ECF5`

#### Scenario: Superfícies
- **WHEN** um elemento usa `bg-card` ou `bg-surface`
- **THEN** o background SHALL ser `#FFFFFF`

#### Scenario: Superfície elevada
- **WHEN** um elemento usa `bg-surface-raised`
- **THEN** o background SHALL ser `#F7FAFD`

#### Scenario: Texto secundário
- **WHEN** um elemento usa `text-muted`
- **THEN** a cor do texto SHALL ser `#8896A8`

### Requirement: Container raiz herda identidade Bento Blue
O componente raiz em `src/App.jsx` SHALL usar o fundo, texto e fonte Bento Blue, aproveitando as variáveis semânticas atualizadas.

#### Scenario: Fundo e texto do container raiz
- **WHEN** o aplicativo é renderizado
- **THEN** o container principal SHALL ter fundo `#F5F9FF` e texto `#0B1B2E`

#### Scenario: Fonte do container raiz
- **WHEN** o aplicativo é renderizado
- **THEN** a fonte padrão do container SHALL ser `"Plus Jakarta Sans"`
