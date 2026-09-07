## Requirements

### Requirement: Agrupamento por tipo no dropdown
O dropdown de notificações SHALL agrupar os itens por tipo, exibindo primeiro as notificações do tipo "Urgente" e depois as do tipo "Importante". Cada grupo SHALL ter um cabeçalho de seção estilizado. Se um grupo não tiver itens, ele SHALL ser omitido completamente.

#### Scenario: Exibição de ambos os grupos
- **WHEN** há notificações de ambos os tipos (Urgente e Importante)
- **THEN** o dropdown exibe primeiro a seção "Urgente" com seus itens, depois a seção "Importante" com seus itens

#### Scenario: Omissão de grupo vazio
- **WHEN** há notificações apenas do tipo "Urgente" (sem "Importante")
- **THEN** somente a seção "Urgente" é exibida, sem cabeçalho de "Importante"

#### Scenario: Ordenação interna por data
- **WHEN** um grupo possui múltiplos itens
- **THEN** eles são ordenados do mais recente ao mais antigo dentro do grupo

### Requirement: Cabeçalho de seção por tipo
Cada grupo SHALL ter um cabeçalho visual com: ícone do tipo, nome do tipo ("Urgente" / "Importante"), e contagem de itens no grupo. O cabeçalho SHALL usar as cores temáticas do tipo correspondente.

#### Scenario: Cabeçalho Urgente
- **WHEN** a seção Urgente é exibida
- **THEN** o cabeçalho usa cor vermelha (`C.danger`) com ícone `priority_high` e texto "Urgente (N)"

#### Scenario: Cabeçalho Importante
- **WHEN** a seção Importante é exibida
- **THEN** o cabeçalho usa cor âmbar (`C.warning`) com ícone `notification_important` e texto "Importante (N)"
