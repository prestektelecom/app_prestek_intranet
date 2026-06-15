## ADDED Requirements

### Requirement: Páginas Bento restantes reagem ao tema escuro
As páginas `ServicesDirectory`, `Directory`, `Coverage`, `Schedule`, `Processos`, `Comunicados`, `TicketsList`, `Offices`, `Sectors` e `ResponsaveisManual` SHALL adaptar seus fundos, cards, tabelas, modais e controles quando a classe `.dark` está presente.

#### Scenario: Fundo e cards no modo escuro
- **WHEN** o tema é dark
- **THEN** cada página SHALL ter fundo escuro, cards/superfícies escuras e texto claro

#### Scenario: Tabelas e listas no modo escuro
- **WHEN** o tema é dark
- **THEN** tabelas e listas SHALL ter linhas escuras, bordas Bento dark e texto legível

#### Scenario: Modais e inputs no modo escuro
- **WHEN** o tema é dark
- **THEN** modais e inputs SHALL ter fundo escuro, bordas Bento dark e texto claro

### Requirement: Subcomponentes reagem ao tema escuro
Os subcomponentes em `src/components/services/*`, `src/components/schedule/*`, `src/components/admin/*` e `src/components/common/*` SHALL adaptar suas cores quando a classe `.dark` está presente.

#### Scenario: Cards de serviço no modo escuro
- **WHEN** o tema é dark
- **THEN** `PlanoBentoCard`, `TechBentoCard` e `StreamingBentoCard` SHALL ter fundo escuro e bordas Bento dark

#### Scenario: Componentes de escala no modo escuro
- **WHEN** o tema é dark
- **THEN** os componentes da pasta `schedule/` SHALL renderizar com fundo escuro, texto claro e estados hover adequados
