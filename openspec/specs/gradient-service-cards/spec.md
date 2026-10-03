# gradient-service-cards Specification

## Purpose
Formato visual dos cards do Diretório de Serviços (planos, serviços técnicos e streaming) com `GradientCard`, e preservação do carrossel Rankings do Mês.

## Requirements

### Requirement: Cards no formato GradientCard
O sistema SHALL renderizar os cards de planos, serviços técnicos e pacotes de streaming com `GradientCard` (`src/components/ui/gradient-card.jsx`), com animação de entrada e hover via Framer Motion e variantes de gradiente por tipo de serviço.

#### Scenario: Visualização do diretório
- **WHEN** o usuário acessa o Diretório de Serviços Internos
- **THEN** os três tipos de card SHALL ser exibidos com `GradientCard` (`PlanoBentoCard`, `TechBentoCard`, `StreamingBentoCard`)

### Requirement: Funcionalidades interativas dos cards
Os cards SHALL manter o indicador de vendas do mês com progresso (planos) e as opções de editar e excluir para administradores.

#### Scenario: Ações de administrador
- **WHEN** o usuário é administrador
- **THEN** os cards SHALL exibir os controles de edição e exclusão

### Requirement: Preservação do carrossel Rankings do Mês
O sistema SHALL manter a seção Rankings do Mês no fim do Diretório, alternando entre as abas Top 3 Planos, Top 3 Colaboradoras e Top 3 Ticket Médio.

#### Scenario: Alternância de abas
- **WHEN** o usuário clica numa aba do Rankings do Mês
- **THEN** o carrossel SHALL exibir o pódio da aba escolhida

> Nota: o comparador de planos descrito na versão original desta change foi removido do projeto em 2026-09-19 e não faz parte desta spec.
