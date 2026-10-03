# dark-mode-bento-foundation Specification

## Purpose
Fundação do modo escuro: variáveis do bloco `.dark` e ThemeSwitcher. Nota: descreve a paleta "Bento Blue" (azul), já substituída pela marca laranja; vale como registro histórico, não como o estado atual do tema. Os cinco temas atuais estão em `index.css`.

## Requirements

### Requirement: Variáveis CSS dark usam paleta Bento Blue
O arquivo `src/index.css` SHALL redefinir as variáveis semânticas e tokens Bento dentro do bloco `.dark` para uma paleta azul-escura consistente.

#### Scenario: Fundo dark
- **WHEN** a classe `.dark` está presente no `<html>`
- **THEN** `bg-background` SHALL renderizar `#0B1B2E`

#### Scenario: Superfícies dark
- **WHEN** a classe `.dark` está presente
- **THEN** `bg-card` SHALL renderizar `#0F1724` e `bg-surface-raised` SHALL renderizar `#1C2C3D`

#### Scenario: Texto dark
- **WHEN** a classe `.dark` está presente
- **THEN** `text-foreground` SHALL renderizar `#F5F9FF` e `text-muted` SHALL renderizar `#8896A8`

#### Scenario: Primária dark
- **WHEN** a classe `.dark` está presente
- **THEN** `bg-primary` / `text-primary` SHALL renderizar `#4A9EF5` e `hover:bg-primary` SHALL renderizar `#7AB8F8`

#### Scenario: Bordas dark
- **WHEN** a classe `.dark` está presente
- **THEN** `border-border` SHALL renderizar `#1E3A5F`

### Requirement: ThemeSwitcher reflete paleta Bento dark
O componente `src/components/ThemeSwitcher.tsx` SHALL usar a paleta Bento dark nas previews e estados do tema escuro.

#### Scenario: Preview do tema escuro
- **WHEN** a opção "Escuro" é exibida
- **THEN** o preview SHALL usar `#0B1B2E`, `#0F1724` e `#162231`

#### Scenario: Estados de seleção
- **WHEN** uma opção está selecionada
- **THEN** a borda e o ring SHALL usar `#4A9EF5`
