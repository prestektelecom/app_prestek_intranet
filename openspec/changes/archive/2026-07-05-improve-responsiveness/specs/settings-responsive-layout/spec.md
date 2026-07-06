## ADDED Requirements

### Requirement: Configurações adaptam-se a telas pequenas
A página de Configurações SHALL exibir seus grupos e formulários de forma fluida em mobile, tablet e desktop.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** as configurações são exibidas em layout de duas ou mais colunas, com menu lateral e conteúdo ao lado

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** o layout pode reduzir para uma coluna maior ou manter duas colunas com espaçamento reduzido

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** as configurações são empilhadas verticalmente, campos de formulário ocupam toda a largura e o menu vira drawer ou accordion

#### Scenario: Campos de formulário
- **WHEN** um formulário de configuração é exibido em qualquer breakpoint
- **THEN** os campos não ultrapassam a largura da tela e mantêm labels legíveis
