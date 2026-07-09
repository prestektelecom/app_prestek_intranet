## Context

O endpoint `GET /api/eficiencia/:funcionarioId` no `backend/server.js` (linhas ~700–891) calcula a eficiência de um técnico com base nas OS fechadas no IXC. Foram identificados cinco problemas na implementação atual:

1. **Variação distorcida** — compara contagem absoluta de OS do mês atual (incompleto, ex: 9 dias) com o mês anterior (completo, 30 dias), resultando em variações artificialmente negativas como -37%.
2. **Campo de fechamento ambíguo** — usa `data_final` como primário sem documentar por que esse campo e não `data_fechamento`.
3. **Sparkline hardcoded** — os primeiros 7 pontos do gráfico são valores fixos (`[72, 68, 75, 80, 78, 82, 85, ...]`), não refletem dados reais.
4. **Resolução silenciosa do `ixcTecnicoId`** — quando a busca por email falha, o ID local é usado sem aviso, podendo retornar dados de outro técnico ou nenhum dado.
5. **`calcHorasUteis` arredonda por hora cheia** — introduz erro de até 59 minutos por OS, podendo classificar erroneamente como "no prazo" ou "fora do prazo".

## Goals / Non-Goals

**Goals:**
- Variação percentual proporcional ao período decorrido (OS/dia)
- Campo de fechamento canônico: `data_fechamento` como primário (data que o cliente aceitou), `data_final` como fallback técnico
- Retornar histórico semanal real (8 últimas semanas) no payload do endpoint
- Logging explícito e fallback robusto na resolução do `ixcTecnicoId`
- `calcHorasUteis` em minutos (precisão real)

**Non-Goals:**
- Mudar a estrutura da tabela `usuarios_perfil` no banco
- Criar UI nova — apenas corrigir o dado passado ao sparkline existente
- Suporte a múltiplos técnicos por requisição

## Decisions

### D1 — Variação proporcional por OS/dia
**Decisão**: Calcular a taxa diária `osNoPrazo / diasDecorridos` para cada período e comparar as taxas, não as contagens absolutas.

**Alternativa considerada**: Comparar apenas OS do mesmo intervalo de dias (ex: dias 1–9 de junho vs dias 1–9 de julho). Descartado porque perde contexto do mês anterior completo e é mais complexo de comunicar.

**Fórmula**:
```
taxaAtual    = noPrazoMesAtual    / diasDecorridosMesAtual
taxaAnterior = noPrazoMesAnterior / diasMesAnterior (total)
variacao     = round((taxaAtual - taxaAnterior) / taxaAnterior * 100)
```

---

### D2 — Campo de fechamento canônico
**Decisão**: Usar `data_fechamento` como primário (momento em que o cliente ou sistema encerrou a OS) e `data_final` como fallback (conclusão técnica). Ambos passam pelo `isDataValida`.

**Rationale**: No IXC, `data_fechamento` é preenchida pelo workflow de encerramento formal; `data_final` é preenchida pelo técnico na execução. Para SLA do cliente, `data_fechamento` é mais fiel.

---

### D3 — Histórico semanal via agregação no Node
**Decisão**: Após buscar todas as OS fechadas (já feito), agregar em semanas no código Node antes de retornar. Não há chamada adicional ao IXC.

**Semanas**: últimas 8 semanas contadas da semana atual para trás (domingo a sábado). Para cada semana, calcular `eficiência = noPrazo / totalComPrazo * 100` (ou `null` se sem dados).

---

### D4 — `calcHorasUteis` em minutos
**Decisão**: Alterar o loop para incrementar por minuto (`cur.setMinutes(+1)`) dentro do horário útil e dividir por 60. Mantém a mesma assinatura de função.

**Trade-off**: Loop por minuto é mais custoso que por hora. Com SLAs típicos de até 72h úteis, o número máximo de iterações é ~4320 (72h × 60min). Aceitável para requisições pontuais.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| `data_fechamento` nula em OS antigas | Fallback já existente para `data_final`; `isDataValida` filtra valores zerados |
| Histórico semanal vazio nas primeiras semanas | Retornar `null` nos pontos sem dados; frontend trata com `eficiencia?.eficiencia_atual \|\| 0` |
| Loop por minuto lento em SLAs muito longos | Limitar a 30 dias úteis máximo (≈ 13.200 iterações); OS acima disso são fora do prazo por definição |
| Mudança de variação pode surpreender usuários | Variação corrigida tenderá a ser menos negativa — comportamento esperado e correto |

## Migration Plan

1. Deploy do backend com endpoint atualizado — nenhuma migração de dados necessária
2. Deploy do frontend com sparkData consumindo `historico_semanal` da resposta
3. Sem rollback especial — campos antigos (`variacao`, `eficiencia_atual`) mantêm mesma semântica; apenas `variacao` passa a ser calculada diferente
