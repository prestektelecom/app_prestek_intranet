## ADDED Requirements

### Requirement: KPIs consistentes com uma única fonte de verdade
O KPI "Ativos" SHALL contar a partir de `_situacao.rotulo === 'Ativo'` — a mesma fonte de dados que o chip de situação da toolbar usa — e não a partir da flag crua `ativo` do IXC, que diverge do prefixo no nome em casos reais da base.

Os três KPIs do painel (`Colaboradores`, `Ativos`/`Com ramal`, `Departamentos`) SHALL escopar por `colaboradoresPorBusca` (o resultado já filtrado pela busca ativa), não pelo total bruto — os três precisam reagir à busca da mesma forma, ou nenhum deles.

#### Scenario: KPI "Ativos" bate com o chip "Ativo"
- **WHEN** os colaboradores são carregados, sem nenhum filtro de busca ativo
- **THEN** o valor do KPI "Ativos" é exatamente igual à contagem do chip de situação "Ativo"

#### Scenario: Busca sem resultado zera os três KPIs igualmente
- **WHEN** o usuário digita um termo de busca sem nenhuma correspondência
- **THEN** "Colaboradores", "Ativos"/"Com ramal" e "Departamentos" mostram 0 ao mesmo tempo, nenhum deles congelado no total bruto
