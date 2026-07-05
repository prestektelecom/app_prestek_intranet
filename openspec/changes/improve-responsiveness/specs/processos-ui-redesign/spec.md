## ADDED Requirements

### Requirement: Tabela de processos adaptativa
A tabela de processos SHALL se adaptar a viewports pequenas sem perder acessibilidade aos dados.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a tabela de processos exibe todas as colunas disponíveis

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela mantém colunas prioritárias visíveis e permite scroll horizontal para colunas secundárias

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a tabela é convertida em lista de cards, cada um representando um processo com seus dados principais

#### Scenario: Busca e filtros
- **WHEN** a página de processos possui busca ou filtros
- **THEN** em telas pequenas os filtros são empilhados ou colapsados em um painel de filtros
