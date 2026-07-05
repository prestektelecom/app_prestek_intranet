## Requirements

### Requirement: Header reage ao tema escuro
O componente `src/components/Header.jsx` SHALL adaptar cores, bordas e superfícies quando a classe `.dark` está presente.

#### Scenario: Header no modo escuro
- **WHEN** o tema é dark
- **THEN** o header SHALL ter fundo escuro, texto claro e bordas Bento dark

### Requirement: Sidebar reage ao tema escuro
O componente `src/components/Sidebar.jsx` SHALL adaptar cores, bordas e estados de hover/active quando a classe `.dark` está presente.

#### Scenario: Sidebar no modo escuro
- **WHEN** o tema é dark
- **THEN** a sidebar SHALL ter fundo escuro, texto claro e itens ativos/hover com tons Bento dark

### Requirement: Dashboard reage ao tema escuro
O componente `src/components/Dashboard.jsx` SHALL adaptar cards, hero banner, KPIs e presença de equipe quando a classe `.dark` está presente.

#### Scenario: Dashboard no modo escuro
- **WHEN** o tema é dark
- **THEN** os cards SHALL ter fundo escuro, texto claro e acentos Bento

### Requirement: Configuracoes reage ao tema escuro
O componente `src/components/Configuracoes.jsx` SHALL adaptar hero banner, cards, inputs e botões quando a classe `.dark` está presente.

#### Scenario: Configuracoes no modo escuro
- **WHEN** o tema é dark
- **THEN** a página SHALL ter fundo escuro, cards escuros, inputs escuros e texto claro

### Requirement: AdminDashboard reage ao tema escuro
O componente `src/components/AdminDashboard.jsx` SHALL adaptar KPIs, abas, cards e auditoria quando a classe `.dark` está presente.

#### Scenario: AdminDashboard no modo escuro
- **WHEN** o tema é dark
- **THEN** o painel admin SHALL ter fundo escuro, cards escuros e texto claro
