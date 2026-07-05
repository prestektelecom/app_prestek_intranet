## ADDED Requirements

### Requirement: KPI cards com design Bento Blue
A seção de KPIs da Visão Geral do Painel SHALL exibir os três cartões (Usuários Ativos, Comunicados, Ações Admin) com o design system Bento Blue: fundo branco `#FFFFFF`, borda `#E4ECF5`, accent stripe colorida de 4px no topo, valor numérico em `#0B1B2E`, label em `#8896A8` com fonte JetBrains Mono.

#### Scenario: Exibição dos KPIs com cores Bento Blue
- **WHEN** o administrador acessa a aba "Painel de Controle"
- **THEN** cada KPI SHALL exibir uma stripe colorida no topo (azul para Usuários, ciano para Comunicados, verde para Ações Admin) sem nenhum elemento na cor âmbar/laranja

#### Scenario: Estado de carregamento dos KPIs
- **WHEN** os dados ainda estão sendo carregados
- **THEN** o valor SHALL exibir "—" com a mesma estilização Bento Blue, sem quebrar o layout

### Requirement: Card destaque "Gerenciar Usuários" em gradiente azul
O card de atalho "Gerenciar Usuários" SHALL usar gradiente azul `#1F5BA8 → #2D7BD4 → #4A9EF5` em vez do gradiente laranja legado.

#### Scenario: Exibição do card destaque
- **WHEN** o administrador visualiza a seção de atalhos
- **THEN** o card "Gerenciar Usuários" SHALL exibir gradiente azul com ícone e texto em branco, sem nenhuma cor âmbar

#### Scenario: Interação com o card destaque
- **WHEN** o administrador clica no card "Gerenciar Usuários"
- **THEN** a aba SHALL trocar para `abaAtiva === 'usuarios'` (comportamento mantido)

### Requirement: Cards secundários com hover azul
Os cards "Comunicados" e "Logs de Auditoria" SHALL usar `hover:border-[#4A9EF5]/40` em vez de `hover:border-primary/40` âmbar.

#### Scenario: Hover nos cards secundários
- **WHEN** o administrador passa o mouse sobre os cards "Comunicados" ou "Logs de Auditoria"
- **THEN** a borda SHALL destacar em azul `#4A9EF5` (não em âmbar)

### Requirement: Atividades Recentes com link azul
O link "Ver Tudo" na seção de Atividades Recentes SHALL usar a cor `#4A9EF5` em vez de `text-primary` âmbar.

#### Scenario: Link Ver Tudo visível
- **WHEN** o administrador visualiza a seção Atividades Recentes
- **THEN** o botão "Ver Tudo" SHALL aparecer em azul `#4A9EF5`

### Requirement: Ícone de log create_comunicado em azul
O objeto `ICONE_ACAO` SHALL usar `bg-[#EAF4FF] text-[#4A9EF5]` para a ação `create_comunicado`, eliminando a referência a `bg-primary/10 text-primary` âmbar.

#### Scenario: Log de criação de comunicado exibido
- **WHEN** existe um log de auditoria com ação `create_comunicado`
- **THEN** o ícone SHALL exibir fundo azul claro e ícone azul, sem cor âmbar

### Requirement: Fundo do painel em azul-gelo Bento
O elemento `<main>` SHALL usar background `#F5F9FF` (azul-gelo Bento Blue) em vez de `bg-background` warm stone.

#### Scenario: Fundo da página admin
- **WHEN** o administrador acessa qualquer aba do painel admin
- **THEN** o fundo SHALL ser azul-gelo `#F5F9FF`, consistente com as demais páginas redesenhadas
