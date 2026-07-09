## Why

O card de **Eficiência** no Dashboard exibe métricas calculadas com lógica incorreta: a variação percentual compara um mês incompleto com um mês completo (distorcendo o delta); o campo de fechamento pode capturar a data errada; o sparkline usa dados fixos hardcoded; e a resolução do `ixcTecnicoId` falha silenciosamente em alguns fluxos, zerando os dados do usuário.

## What Changes

- **Corrigir variação proporcional**: calcular a variação entre meses usando OS/dia (proporcional ao período decorrido), não contagem absoluta
- **Corrigir campo de fechamento**: definir claramente qual campo usar (`data_final` como padrão, com fallback explícito e documentado para `data_fechamento`)
- **Substituir sparkline hardcoded**: retornar histórico semanal real (últimas 8 semanas) no endpoint `/api/eficiencia/:id`
- **Melhorar resolução do `ixcTecnicoId`**: adicionar logging mais claro e fallback robusto para garantir que o ID correto seja sempre encontrado
- **Corrigir `calcHorasUteis`**: calcular em minutos em vez de horas inteiras para evitar arredondamento grosseiro

## Capabilities

### New Capabilities
- `eficiencia-calculation`: Cálculo correto da eficiência por técnico — variação proporcional por período, campo de fechamento canônico, histórico semanal real, e resolução robusta do ID de técnico no IXC

### Modified Capabilities
- *(nenhuma — esta mudança não altera requirements de capabilities existentes já especificadas)*

## Impact

- **Backend**: `backend/server.js` — endpoint `GET /api/eficiencia/:funcionarioId` (linhas ~700–891)
- **Frontend**: `src/components/Dashboard.jsx` — componente `SetorBento` e `KpiCard` (sparkData)
- **Sem breaking changes** na API — os campos da resposta JSON permanecem os mesmos; apenas `variacao` e campos novos (`historico_semanal`) são adicionados
- Nenhuma dependência externa nova
