## ADDED Requirements

### Requirement: Variação de eficiência proporcional ao período
O sistema SHALL calcular a variação percentual de eficiência usando a taxa diária (OS no prazo por dia) de cada período, e não a contagem absoluta de OS, para que a comparação entre um mês incompleto e um mês completo seja justa.

#### Scenario: Mês atual com menos dias que o mês anterior
- **WHEN** o mês atual tem N dias decorridos (N < total de dias do mês anterior)
- **THEN** a variação SHALL ser calculada como `((taxaAtual - taxaAnterior) / taxaAnterior) * 100`, onde `taxaAtual = noPrazoAtual / N` e `taxaAnterior = noPrazoAnterior / diasMesAnterior`

#### Scenario: Mês anterior sem dados
- **WHEN** não há OS fechadas no mês anterior
- **THEN** `variacao` SHALL ser `null` e nenhum badge de tendência SHALL ser exibido

---

### Requirement: Campo de fechamento canônico
O sistema SHALL usar `data_fechamento` como campo primário para determinar quando uma OS foi encerrada, com `data_final` como fallback, em toda lógica de filtragem e cálculo de SLA.

#### Scenario: OS com data_fechamento válida
- **WHEN** uma OS possui `data_fechamento` preenchida e válida (não zero, não vazia)
- **THEN** o sistema SHALL usar `data_fechamento` como a data de encerramento para cálculo de SLA e filtragem por período

#### Scenario: OS sem data_fechamento mas com data_final
- **WHEN** `data_fechamento` é inválida ou ausente mas `data_final` está preenchida e válida
- **THEN** o sistema SHALL usar `data_final` como fallback para a data de encerramento

#### Scenario: OS sem nenhum campo válido
- **WHEN** tanto `data_fechamento` quanto `data_final` são inválidas ou ausentes
- **THEN** a OS SHALL ser excluída do cálculo de eficiência

---

### Requirement: Histórico semanal de eficiência retornado pelo endpoint
O endpoint `GET /api/eficiencia/:funcionarioId` SHALL retornar um campo `historico_semanal` contendo a eficiência calculada para cada uma das últimas 8 semanas (semanas completas, de domingo a sábado).

#### Scenario: Semanas com OS suficientes para cálculo
- **WHEN** uma semana possui ao menos uma OS com SLA definido
- **THEN** o item do `historico_semanal` para essa semana SHALL conter `eficiencia` (0–100) e `total` (quantidade de OS com prazo)

#### Scenario: Semanas sem OS ou sem SLA
- **WHEN** uma semana não possui OS fechadas com SLA definido
- **THEN** o item do `historico_semanal` SHALL ter `eficiencia: null` para indicar ausência de dados

#### Scenario: Uso no frontend
- **WHEN** o componente `SetorBento` recebe `historico_semanal` preenchido
- **THEN** o sparkline SHALL exibir os valores reais de eficiência das últimas 8 semanas em vez de dados fixos hardcoded

---

### Requirement: Resolução robusta do ixcTecnicoId com logging explícito
O sistema SHALL registrar em log o resultado de cada etapa da resolução do `ixcTecnicoId` e SHALL falhar de forma explícita quando nenhum mapeamento for encontrado, em vez de usar o `funcionarioId` local silenciosamente.

#### Scenario: Resolução via email bem-sucedida
- **WHEN** o email do usuário é encontrado no IXC e retorna um `funcionario` válido
- **THEN** `ixcTecnicoId` SHALL ser o valor de `usuarios.funcionario` e o log SHALL indicar `"resolvido via email → <id>"`

#### Scenario: Resolução via funcionario_id da tabela local
- **WHEN** a busca por email falha mas `usuarios_perfil.funcionario_id` está preenchido
- **THEN** `ixcTecnicoId` SHALL ser o `funcionario_id` da tabela local e o log SHALL indicar `"resolvido via funcionario_id local → <id>"`

#### Scenario: Nenhum mapeamento encontrado
- **WHEN** nem o email nem o `funcionario_id` local resolvem para um ID de técnico no IXC
- **THEN** o endpoint SHALL retornar `{ sucesso: false, sem_dados: true, erro: "Técnico não encontrado no IXC" }` em vez de continuar com o ID interno

---

### Requirement: Cálculo de horas úteis com precisão em minutos
O sistema SHALL calcular a duração de atendimento em horas úteis com precisão de minutos, e não por hora cheia, para evitar erros de classificação de SLA de até 59 minutos.

#### Scenario: OS atendida dentro do SLA com margem inferior a 1 hora
- **WHEN** uma OS tem duração útil de, por exemplo, 7h45min e o SLA é de 8 horas
- **THEN** o sistema SHALL classificá-la como "no prazo" (7.75h ≤ 8h)

#### Scenario: OS atendida fora do SLA por margem inferior a 1 hora
- **WHEN** uma OS tem duração útil de 8h20min e o SLA é de 8 horas
- **THEN** o sistema SHALL classificá-la como "fora do prazo" (8.33h > 8h)
