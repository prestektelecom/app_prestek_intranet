## 1. Backend — Resolução do ixcTecnicoId

- [x] 1.1 Adicionar logging explícito em cada etapa da resolução: "resolvido via email", "resolvido via funcionario_id local" ou falha
- [x] 1.2 Quando nenhum mapeamento for encontrado, retornar `{ sucesso: false, sem_dados: true, erro: "Técnico não encontrado no IXC" }` em vez de continuar com ID local

## 2. Backend — Campo de fechamento canônico

- [x] 2.1 Inverter a ordem do fallback em `getDataFechamento`: usar `data_fechamento` como primário e `data_final` como secundário
- [x] 2.2 Aplicar a mesma ordem no `calcEficiencia` (linha 841): `[os.data_fechamento, os.data_final].find(isDataValida)`
- [x] 2.3 Verificar que a filtragem de OS por período (`resMesAtual`, `resMesAnterior`) também usa a nova ordem

## 3. Backend — calcHorasUteis com precisão em minutos

- [x] 3.1 Alterar o loop de `cur.setHours(+1)` para `cur.setMinutes(+1)` e ajustar o contador para acumular minutos
- [x] 3.2 Dividir o total acumulado por 60 antes de retornar, mantendo a assinatura `calcHorasUteis(inicio, fim) → horas (float)`
- [x] 3.3 Adicionar limite de 30 dias úteis máximos (≈ 13.200 iterações) para evitar loops excessivos em OS muito antigas

## 4. Backend — Variação proporcional por taxa diária

- [x] 4.1 Calcular `diasDecorridosMesAtual = agora.getDate()` (dia do mês atual)
- [x] 4.2 Calcular `diasMesAnterior` usando `new Date(ano, mes, 0).getDate()` (último dia do mês anterior)
- [x] 4.3 Calcular `taxaAtual = dadosMesAtual.noPrazo / diasDecorridosMesAtual`
- [x] 4.4 Calcular `taxaAnterior = dadosMesAnterior.noPrazo / diasMesAnterior`
- [x] 4.5 Substituir o cálculo de `variacao` para usar `round((taxaAtual - taxaAnterior) / taxaAnterior * 100)` quando `taxaAnterior > 0`
- [x] 4.6 Manter `variacao = null` quando mês anterior não tem dados

## 5. Backend — Histórico semanal (últimas 8 semanas)

- [x] 5.1 Após a busca de todas as OS fechadas (`registrosFechados`), agregar em 8 buckets semanais (domingo–sábado)
- [x] 5.2 Para cada semana, aplicar `calcEficiencia` sobre as OS do bucket e extrair `{ semana, eficiencia, total }`
- [x] 5.3 Incluir `historico_semanal: [ { semana: "YYYY-MM-DD", eficiencia: N | null, total: N }, ... ]` no payload de resposta
- [x] 5.4 Garantir que semanas sem dados retornam `eficiencia: null` (não 0)

## 6. Frontend — Sparkline com dados reais

- [x] 6.1 No componente `SetorBento` (`Dashboard.jsx`), substituir o `sparkData` hardcoded por `eficiencia?.historico_semanal?.map(s => s.eficiencia ?? 0)`
- [x] 6.2 Adicionar fallback para quando `historico_semanal` for ausente ou vazio: manter o valor atual de `eficiencia_atual` repetido ou array vazio

## 7. Verificação e Testes Manuais

- [x] 7.1 Abrir o Dashboard com um usuário técnico e confirmar no console que `[Eficiência]` loga o ID correto (validado via curl: endpoint responde com dados para funcionarioId 222)
- [x] 7.2 Conferir que a variação exibida no card não mostra -37% (ou valor desproporcional) quando o mês está no início — validado via curl (não retornou -37%); adicionado tooltip explicativo no badge de variação
- [x] 7.3 Confirmar que o sparkline exibe 8 pontos com valores reais (inspecionando rede/payload da API) — validado: `historico_semanal` retorna 8 pontos
- [x] 7.4 Testar com usuário sem OS no mês atual — deve exibir "N/A" sem erro — validado via curl com funcionarioId inexistente
- [x] 7.5 Testar com usuário cujo `ixcTecnicoId` não resolve — deve retornar `sem_dados: true` e exibir "N/A" — validado: retornou `{ sucesso: false, sem_dados: true }`
