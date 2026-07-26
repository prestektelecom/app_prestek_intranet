## ADDED Requirements

### Requirement: Layout de Cards com Gradientes e Animações Framer Motion
O sistema DEVE renderizar os cards de planos, serviços técnicos e pacotes de streaming no formato `GradientCard`, utilizando Framer Motion para animações de entrada e hover (`scale` e `y`), e variantes de gradiente adequadas para cada tipo de serviço.

#### Scenario: Visualização dos Cards de Planos e Serviços
- **WHEN** o usuário acessa o Diretório de Serviços Internos
- **THEN** os cards de planos de internet, serviços técnicos e streaming são exibidos com badges translúcidos, ilustrações decorativas flutuantes e fundo com gradientes coloridos responsivos

### Requirement: Integração das Funcionalidades Interativas dos Cards
O sistema DEVE manter as funcionalidades interativas de cada tipo de card, incluindo a caixa de seleção de comparação (máximo 3 planos), indicador de vendas do mês com progresso e opções de edição/exclusão para administradores.

#### Scenario: Seleção de Plano para Comparação
- **WHEN** o usuário marca a opção "Comparar" em até 3 cards de planos
- **THEN** o plano é selecionado e a barra/modal de comparação exibe os dados para análise detalhada

### Requirement: Preservação do Carrossel Rankings do Mês
O sistema DEVE manter a seção Rankings do Mês na parte inferior do Diretório de Serviços, permitindo a alternância entre as abas Top 3 Planos, Top 3 Colaboradoras e Top 3 Ticket Médio.

#### Scenario: Alternância entre Abas de Ranking
- **WHEN** o usuário clica nas abas do Rankings do Mês
- **THEN** o carrossel transiciona suavemente exibindo o pódio da aba selecionada
