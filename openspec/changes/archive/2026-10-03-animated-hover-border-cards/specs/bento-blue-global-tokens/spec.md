## ADDED Requirements

### Requirement: Tokens de hover border por variante de tema
O arquivo `src/index.css` SHALL definir três CSS custom properties adicionais em cada bloco de variante de tema para suportar o efeito de borda animada no hover dos cards.

#### Scenario: Tokens no tema Light (`:root`)
- **WHEN** nenhuma classe de tema dark está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#4A9EF5`, `--hover-border-to` SHALL ser `#2D7BD4`, e `--hover-border-glow` SHALL ser `rgba(74,158,245,0.40)`

#### Scenario: Tokens no tema Dark padrão (`.dark`)
- **WHEN** a classe `.dark` está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#00F2FE`, `--hover-border-to` SHALL ser `#4A9EF5`, e `--hover-border-glow` SHALL ser `rgba(0,242,254,0.45)`

#### Scenario: Tokens no tema Cyber (`.dark-cyber`)
- **WHEN** a classe `.dark-cyber` está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#00F2FE`, `--hover-border-to` SHALL ser `#4A9EF5`, e `--hover-border-glow` SHALL ser `rgba(0,242,254,0.45)`

#### Scenario: Tokens no tema Aurora (`.dark-aurora`)
- **WHEN** a classe `.dark-aurora` está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#8A2BE2`, `--hover-border-to` SHALL ser `#A04DF0`, e `--hover-border-glow` SHALL ser `rgba(138,43,226,0.50)`

#### Scenario: Tokens no tema AMOLED (`.dark-amoled`)
- **WHEN** a classe `.dark-amoled` está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#4A9EF5`, `--hover-border-to` SHALL ser `#7AB8F8`, e `--hover-border-glow` SHALL ser `rgba(74,158,245,0.50)`
