## ADDED Requirements

### Requirement: Título descritivo da página
A interface SHALL exibir o título "Visão Geral da Escala" como cabeçalho principal da página de plantão.

#### Scenario: Título visível ao carregar a página
- **WHEN** o usuário acessa a rota da escala de plantão
- **THEN** o sistema SHALL exibir "Visão Geral da Escala" como título principal (h1)

### Requirement: Remoção de breadcrumb
A interface SHALL omitir a navegação de breadcrumb da página de escala.

#### Scenario: Sem breadcrumb na página
- **WHEN** o usuário acessa a página de escala
- **THEN** o sistema SHALL NOT renderizar nenhum elemento de navegação breadcrumb

### Requirement: Calendário com dias da semana alinhados
O mini-calendário SHALL exibir os dias do mês alinhados corretamente com os dias da semana correspondentes.

#### Scenario: Dia 1 do mês alinhado ao dia da semana correto
- **WHEN** o calendário renderiza um mês
- **THEN** o dia 1 SHALL aparecer na coluna correspondente ao seu dia da semana (DOM, SEG, TER, etc.)

#### Scenario: Navegação entre meses preserva alinhamento
- **WHEN** o usuário navega para o mês anterior ou próximo
- **THEN** o calendário SHALL recalcular e exibir o alinhamento correto para o novo mês
