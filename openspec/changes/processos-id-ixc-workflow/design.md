## Context

`processos` (`backend/migrations/021_processos.sql`) é uma tabela própria do Postgres do intranet, sem nenhuma coluna hoje que aponte para o IXC. O ID exibido (`id`, `VARCHAR(20) PRIMARY KEY`) é gerado em `proximoIdProcesso()` (`backend/server.js`) — sequencial por prefixo de categoria (`TI-`, `AT-`, `OP-`...) — e é referenciado por `PUT`/`DELETE /api/processos/:id`. Nada nele muda nesta change: ele continua existindo, continua sendo a chave primária, e continua sendo o que os 2 modais (edição e consulta) mostram.

O IXC nunca foi consultado por este projeto além de `su_oss_assunto` (usado em `/api/os-chamados` para resolver SLA) e das rotas de ticket/OS (`su_ticket`, `su_oss_chamado`). O motor de workflow do IXC (`wfl_processo`, `wfl_tarefa`, `wfl_interacoes`, `wfl_parametro_oss`) nunca tinha sido consultado — só aparecia em dumps de schema (`docs/querys_ixc_prestek/`) e em scripts de investigação órfãos (`backend/test_wfl.js`) que nunca chegaram a chamar esses recursos de verdade.

Durante a exploração desta change, confirmei ao vivo (só leitura, contra produção, usando `ixcListar`/`services/ixc.js` — mesmo cliente e mesmo padrão de header/auth já usados no projeto) que os 4 recursos respondem com dado real via `POST webservice/v1/<recurso>` (`ixcsoft: listar`):

```
wfl_processo (id=4, descricao="ALTERAR SENHA WIFI (revisado)", ativo="S")
  └─ wfl_tarefa WHERE id_processo=4        [confirmado: qtype=wfl_tarefa.id_processo]
       seq=1 → id=1787 "SOLICITAR ALTERAÇÃO DE SENHA WI-FI"   ← primeira tarefa
       seq=2 → id=14   "ALTERAR SENHA WI-FI"
       seq=3 → id=1788 "AUDITAR ALTERAR SENHA WI-FI"
       ...
       └─ wfl_interacoes WHERE id_tarefa=1787
            id=1993  gatilho=Conclusao  id_wfl_param_os=1071  dispara_proxima=S
            └─ wfl_parametro_oss.id=1071
                 id_assunto=1113
                 └─ su_oss_assunto.id=1113 → assunto="SOLICITAR ALTERAÇÃO DE SENHA WI-FI"
```

Achado relevante durante a validação: a tarefa `id=14` (seq=2 do mesmo processo) tem **2** linhas em `wfl_interacoes` — uma com `id_wfl_param_os=0` (não gera OS) e outra com `id_wfl_param_os=11` (gera). Ou seja, uma tarefa pode ter mais de uma interação, e pegar "a primeira" sem filtrar teria, nesse caso, resolvido para `0` (errado). A resolução precisa filtrar por `id_wfl_param_os != 0`.

## Goals / Non-Goals

**Goals:**
- Vincular explicitamente um Processo nosso a um `wfl_processo` do IXC, por escolha do admin (não inferência automática).
- Resolver, a partir desse vínculo, o `id_assunto` correspondente à primeira tarefa do fluxo que efetivamente abre OS, e persistir esse valor.
- Exibir esse `id_assunto` no lugar do ID interno **apenas na listagem** de processos (tabela desktop + cards mobile), com fallback para o ID interno quando não houver vínculo.
- Permitir reprocessar a resolução manualmente (o fluxo pode mudar de configuração no IXC depois do vínculo).

**Non-Goals:**
- Não altera o ID interno (`processos.id`) como chave primária, nem sua geração (`proximoIdProcesso()`) — continua existindo e sendo usado pelas rotas `PUT`/`DELETE` e pelos 2 modais.
- Não altera os badges de ID dentro do `ProcessoModal` (edição/criação) nem do `ProcessoViewModal` (consulta) — ambos continuam mostrando o ID interno, sem exceção.
- Não altera o comportamento de busca por ID no campo de busca da listagem — continua batendo só com o ID interno.
- Não resolve automaticamente/ao vivo a cada carregamento da tela — resolução é sob demanda (vínculo novo ou clique em "atualizar"), nunca em polling ou a cada `GET /api/processos`.
- Não tenta inferir o vínculo por nome/categoria — sempre escolha explícita do admin.
- Não impõe unicidade de vínculo (dois Processos nossos apontando pro mesmo `wfl_processo` do IXC não é bloqueado nesta change — cenário raro, sem sinal de que precise ser impedido agora).

## Decisions

### D1 — Vínculo por seletor de `wfl_processo`, não campo numérico livre

**Decisão:** o formulário de Processo ganha um `<select>` (ou combobox de busca, seguindo o padrão de `CidadeCombobox.jsx` se a lista crescer) carregado de um novo endpoint `GET /api/processos/ixc/wfl-processos` (admin-only), que lista `wfl_processo WHERE ativo='S'` via `ixcListar`, mostrando `descricao`. O valor salvo é o `id` do `wfl_processo`.

**Alternativas consideradas:**
- Campo numérico cru (admin digita o ID do IXC de cabeça) — rejeitado: exige que o admin já saiba o ID de cor ou vá procurar em outro sistema; alto risco de erro silencioso (digitar um ID que existe mas é de outro processo).

**Rationale:** `wfl_processo` é uma tabela pequena (dezenas de linhas, não milhares) e já confirmada listável — o custo de buscar a lista é baixo e o ganho de segurança/usabilidade é alto.

### D2 — Resolução da cadeia é uma função server-side síncrona, chamada sob demanda

**Decisão:** nova função (ex. `resolverAssuntoWorkflow(idWflProcesso)`) que executa a cadeia de 3-4 chamadas sequenciais ao IXC (`wfl_tarefa` → `wfl_interacoes` → `wfl_parametro_oss` → `su_oss_assunto`) e retorna `{ idAssunto, nomeAssunto }` ou lança erro descritivo. Chamada em dois momentos: (a) quando o admin salva um Processo com um `wfl_processo` vinculado pela primeira vez ou trocado, e (b) num endpoint dedicado `POST /api/processos/:id/ixc/atualizar` (admin-only) que reprocessa usando o vínculo já salvo, para quando a configuração mudar do lado do IXC.

**Alternativas consideradas:**
- Resolver ao vivo a cada `GET /api/processos` — rejeitado: a tela de Processos ficaria dependente da latência/disponibilidade do IXC (3-4 roundtrips por processo vinculado, multiplicado pela lista inteira) só para mostrar um número que raramente muda. Mesmo raciocínio já aplicado no cache de `/api/eficiencia` e no cache SWR de Cobertura.
- Job/cron periódico de re-resolução — rejeitado por desproporcional: a configuração de workflow no IXC muda raramente, um botão manual já cobre o caso real sem complexidade de agendamento.

**Rationale:** consistente com o padrão já estabelecido no projeto (resolver uma vez, persistir, atualizar sob demanda) e evita acoplar a disponibilidade da tela à do IXC.

### D3 — Critério de desambiguação: interação com `id_wfl_param_os != 0`, `ativo='S'`, menor `id` em caso de empate

**Decisão:** ao resolver a tarefa inicial, buscar todas as linhas de `wfl_interacoes` com `id_tarefa` igual ao da tarefa, filtrar as com `ativo='S'` E `id_wfl_param_os` diferente de `0`/vazio. Se sobrar mais de uma, usar a de menor `id`. Se sobrar zero, a resolução falha com um erro específico ("a tarefa inicial deste processo não abre Ordem de Serviço").

**Alternativas consideradas:**
- Pegar sempre a primeira linha retornada pela API, sem filtro — rejeitado: comprovadamente errado (tarefa `id=14` tem uma interação com `id_wfl_param_os=0` que apareceria antes da válida, dependendo da ordem de retorno).
- Bloquear e exigir intervenção manual sempre que houver mais de uma interação válida — considerado desproporcional para o caso comum (a amostra real teve sempre 0 ou 1 interação válida); a regra de "menor id" é documentada aqui para que, se um caso real de ambiguidade aparecer, o comportamento seja previsível e depurável, não aleatório.

### D3b — Critério de desambiguação: MAIS DE UMA tarefa com a mesma `sequencia` mínima (achado durante `/opsx:apply`, não previsto no design original)

**Decisão:** D3 (acima) resolve empate entre *interações da mesma tarefa*. Mas o Felix achou, testando, um caso real de empate um nível ACIMA: duas `wfl_tarefa` com a MESMA `sequencia` mínima dentro do mesmo `wfl_processo` — confirmado no processo real "CRM VENDAS INTERNAS/EXTERNA (revisado)" (`wfl_processo.id=235`), que tem 2 tarefas com `sequencia=1`. Pior que o caso de D3: as DUAS tarefas resolvem para um `id_assunto` válido e DIFERENTE (1971→assunto 1050 "GERAR TAXA DE CONTRATAÇÃO/REATIVAÇÃO"; 1852→assunto 1013 "CRM VENDAS INTERNAS/EXTERNAS") — sem esse fix, a implementação original escolhia `tarefasAtivas[0]` após um `.sort()` estável, ou seja, a ordem em que a API do IXC devolve os registros decidia silenciosamente qual assunto sai, sem erro nenhum sinalizando a ambiguidade.

Investigado o padrão real: a tarefa 1971 ("GERAR TAXA DE CONTRATAÇÃO/REATIVAÇÃO") tem `id_proxima_tarefa=0` e `wfl_interacoes.dispara_proxima='N'` — não encadeia com o resto do fluxo, é uma tarefa solta/órfã. A tarefa 1852 ("CRM VENDAS INTERNAS/EXTERNAS", nome que bate com o do próprio processo) tem `id_proxima_tarefa=2` (aponta pra sequência 2, onde o fluxo de fato continua) e `dispara_proxima='S'`. O mesmo par duplicado (uma órfã + uma conectada, ambas `sequencia=1`) se repete idêntico no processo gêmeo mais antigo e já inativo (`id=215`) — sinal de que não é acidente isolado, é um padrão de como esse tipo de tarefa solta é cadastrado no IXC.

Critério adotado: entre as tarefas empatadas na menor `sequencia`, preferir as que têm `id_proxima_tarefa != 0` (efetivamente continuam o fluxo). Se sobrar exatamente uma, é essa. Se a ambiguidade persistir (nenhuma ou mais de uma tarefa conectada), a resolução falha com um NOVO erro curado ("mais de uma tarefa inicial configurada... avise a TI") em vez de adivinhar — dado que o próprio caso real provou que "escolher sem critério entre candidatas válidas" é um jeito de errar silenciosamente, não um jeito seguro de resolver.

**Alternativas consideradas:**
- Manter `tarefasAtivas[0]` (ordem da API) — descartado: é exatamente o bug relatado pelo Felix, comprovado retornando um assunto errado sem erro nenhum.
- Menor `id` entre as empatadas (mesmo critério de D3) — descartado: testado mentalmente contra o caso real, `1852 < 1971`? Não — `1852 < 1971` é verdade, então por acaso funcionaria aqui, mas por coincidência de numeração, não por relação com a estrutura do fluxo; não haveria garantia de que o id mais baixo é sempre a tarefa conectada em outro processo. `id_proxima_tarefa != 0` é um sinal estrutural do fluxo, não um acidente de numeração.
- Erro curado imediato sempre que houver empate de sequência, sem tentar o filtro de `id_proxima_tarefa` — descartado: teria transformado um caso resolvível de forma inequívoca (a maioria dos empates reais observados) num erro desnecessário toda vez.

**Rationale:** privilegia um sinal estrutural do próprio fluxo (a tarefa continua ou não continua a cadeia) sobre um sinal arbitrário (ordem de retorno da API, ou numeração de id); e, quando mesmo assim a ambiguidade não resolve, falha de forma visível e curada em vez de repetir o comportamento que causou o bug original.

**Rationale:** resolve o caso real observado sem introduzir um fluxo de decisão manual para o admin em cada vínculo.

### D4 — Escopo visual restrito à listagem, modais inalterados

**Decisão:** o badge de ID troca de fonte de dado (`processo.ixc_assunto_id ?? processo.id`) somente nos dois pontos de renderização da listagem (`<td>` da tabela desktop, card da lista mobile). Os badges dentro de `ProcessoModal` (linha do cabeçalho quando `isEdicao`) e `ProcessoViewModal` continuam usando `processo.id` sem condicional nenhuma.

**Alternativas consideradas:**
- Trocar em todos os 4 pontos, por consistência visual — descartado: decisão explícita do Felix durante a exploração desta change, para manter o ID interno visível como referência estável nos contextos de edição/consulta detalhada.

**Rationale:** escolha explícita do dono do produto; a listagem é o contexto operacional (onde o número do IXC é útil pra quem vai abrir/consultar uma OS), os modais são o contexto de gestão do registro interno.

### D5 — Fallback para processo sem vínculo

**Decisão:** quando `ixc_assunto_id` for `null` (processo nunca vinculado, ou vínculo removido), a listagem mostra o `processo.id` interno normalmente — sem badge vazio, sem quebra de layout, sem texto "não vinculado" na listagem (isso fica só dentro do formulário de edição, onde há espaço pra explicar).

**Alternativas consideradas:**
- Mostrar um marcador tipo "—" ou "Não vinculado" na listagem — descartado: a maioria dos processos hoje não terá vínculo assim que a feature for ao ar, e a listagem ficaria com metade das linhas mostrando um texto de aviso repetido, mais ruído que sinal.

**Rationale:** o ID interno já é um identificador válido e funcional; a ausência de vínculo não deveria degradar a experiência de quem só está navegando a lista.

## Risks / Trade-offs

- **Admin vincula o `wfl_processo` errado** (nome parecido, processo duplicado/legado no IXC — o projeto já viu casos de duplicidade real do lado do IXC, ex. "RECURSOS HUMANOS" duplicado em Setores). Mitigação: ao selecionar e salvar, a tela mostra o assunto resolvido (número + nome) antes de confirmar, para conferência visual do admin.
- **Configuração muda no IXC depois do vínculo**, deixando o `id_assunto` cacheado desatualizado. Mitigação: botão "atualizar vínculo" manual; timestamp da última resolução exibido para dar visibilidade de quão recente é o dado.
- **Resolução falha (tarefa sem interação válida, processo sem tarefas, IXC fora do ar no momento do vínculo)**: não deve impedir salvar o Processo em si — o Processo é salvo normalmente, só o vínculo/resolução fica pendente, com erro genérico exibido (nunca `e.message` cru, seguindo o padrão já fixado no projeto) e detalhe real só no `console.error` do servidor.
- **Ambiguidade de interação (D3)** é resolvida por uma regra determinística (menor id) que nunca foi testada contra um caso real de 2+ interações válidas simultâneas — se aparecer na prática, o comportamento é previsível mas pode não ser o "certo" semanticamente; fica documentado aqui para depuração futura, não é um caso bloqueado.
