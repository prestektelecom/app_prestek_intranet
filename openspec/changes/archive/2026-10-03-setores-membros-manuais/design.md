## Context

A equipe de um setor sai de `funcionarios.id_departamento` do IXC e é lida em três lugares, cada um com a própria regra:

- **`/api/setores`** (`backend/server.js`, cache `setores:lista:v2`, 5 min): para cada setor de `empresa_setor`, filtra os funcionários ativos com `id_departamento == setor.id`; ATENDIMENTO (setor cujo nome contém "ATENDIMENTO") também absorve os departamentos 15 e 68. Daí saem `totalMembros`, `grupos` e o responsável (manual > primeiro membro de grupo de supervisão).
- **Colaboradores** (`Directory.jsx`): `id_departamento` de cada pessoa, com o agrupamento hardcoded `DEPTOS_MESCLADOS` (13 aceita 15 e 68). Filtro, chips, KPI e rótulo do cartão usam isso.
- **Plantão** (`useScheduleData.js`): também `id_departamento`.

`responsaveis_manuais` (migration 007) é o precedente: tabela local, rota `POST` com `gate('usuarios')`, tela em `ResponsaveisManual.jsx`. O IXC é a fonte de verdade e não pode ser alterado nem falsificado pelo portal (PRODUCT.md). Motivação e escopo: ver `proposal.md`; requisitos: `specs/`.

## Goals / Non-Goals

**Goals:**
- Ajustar a equipe de qualquer setor só na intranet, de forma reversível e auditada.
- Setores e Colaboradores nunca discordarem sobre quem é de um setor.
- Falhar para o comportamento de hoje: sem ajustes, ou sem a tabela, tudo se comporta como antes.

**Non-Goals:**
- Plantão e Organograma não mudam; a regra de ATENDIMENTO não vira configurável.
- Nenhuma escrita no IXC; nenhuma mudança de permissão (reaproveita `usuarios`).
- Não substitui o `id_departamento` de ninguém: o setor do IXC continua sendo o principal.

## Decisions

### 1. Um ajuste por par (setor, pessoa), com ação `incluir` ou `excluir`
Tabela `setores_membros_manuais(id_setor, id_funcionario, acao, nome, atualizado_por, atualizado_em)`, PK `(id_setor, id_funcionario)`, `CHECK (acao IN ('incluir','excluir'))`. Um par tem no máximo um ajuste, então incluir e excluir a mesma pessoa no mesmo setor se anulam por construção; `desfazer` apaga a linha. `nome` é só para a Auditoria e para mostrar um ajuste órfão.
- *Descartado: lista de membros materializada por setor.* Congelaria uma cópia do IXC e deixaria de acompanhar quem entra e sai do setor lá.
- *Descartado: sobrescrever o `id_departamento` da pessoa.* Só permite um setor por pessoa e mistura "onde o IXC diz" com "onde a intranet diz".

### 2. Regra de equipe efetiva em uma função pura, repetida num util do front, com um teste que as compara
Regra: `efetiva(setor) = base_IXC(setor) ∪ incluídos(setor) − excluídos(setor)`, onde a base mantém ATENDIMENTO como hoje e só considera funcionários ativos; ajuste para id desconhecido ou inativo é ignorado.
- Backend: `backend/services/equipeSetor.js` exporta `aplicarAjustes(membrosBase, ajustesDoSetor, funcionariosAtivosPorId)`, que devolve membros marcados com `origem: 'ixc' | 'intranet'` e `ajustado`. É usada por `/api/setores`.
- Frontend: `src/utils/setoresDaPessoa.js` aplica a mesma regra do ponto de vista da pessoa: dado o `id_departamento` e os ajustes dela, devolve os ids de setor efetivos (setor principal primeiro). Usa a canonização `DEPTOS_MESCLADOS` (15 e 68 → 13); uma exclusão do setor 13 remove também quem entra por 15 ou 68.
- **Um script de teste** (`scripts/testar-equipe-setor.mjs`) roda os mesmos casos nas duas implementações e falha se divergirem. Não há `vitest.config` no projeto e a decisão de 2026-09-20 foi não montar testes automatizados agora, então é um script avulso, rodado à mão.
- *Descartado: o backend entregar `setores_efetivos` pronto em `/api/colaboradores`.* Exigiria carregar `empresa_setor` ali só para repetir a regra de ATENDIMENTO por nome, que hoje o front resolve com `DEPTOS_MESCLADOS`.

### 3. `/api/setores`: aplicar os ajustes e invalidar o cache
Depois de calcular `membros` pela regra atual (intocada), cada setor passa pelo `aplicarAjustes`. `totalMembros`, `grupos` e o responsável automático saem da equipe efetiva; o cartão ganha `ajustado` (boolean) e contagens `incluidos`/`excluidos`. `idsUnicos` continua sendo um `Set`, então uma pessoa em dois setores conta uma vez em `totalColaboradores`. Chave do cache vira `setores:lista:v3` (o formato cresceu) e o `POST` chama `cacheInvalidate` nela. A leitura da tabela usa `.catch(() => ({ rows: [] }))`, como já é feito com `responsaveis_manuais`, para uma tabela ausente não derrubar a tela.

### 4. `/api/colaboradores`: devolver os ajustes de cada pessoa, sem cache novo
A rota não tem cache. Ela lê `setores_membros_manuais` junto com os outros enriquecimentos (`Promise.all`) e acrescenta `ajustes_setores: [{ id_setor, acao }]` a cada pessoa (lista vazia na maioria). Não expõe `atualizado_por`. O front aplica a regra do util do Decisão 2.

### 5. Rota de escrita, no padrão de `responsaveis-manuais`
`POST /api/admin/setores-membros-manuais`, `gate('usuarios')`, corpo `{ id_setor, id_funcionario, nome, acao }` com `acao ∈ incluir | excluir | desfazer`. Valida `id_setor`/`id_funcionario` com `^\d+$` e a ação; recusa o resto com 400 e mensagem fixa. Upsert para incluir/excluir, `DELETE` para desfazer. Devolve a lista completa de ajustes, que a tela usa para atualizar o estado, e invalida o cache de setores. Cada operação chama `registrarAuditoria` com `setor_membro_incluir`, `setor_membro_excluir` ou `setor_membro_desfazer`, com setor e pessoa na descrição. Recusa também ajustes nos setores **15 (Suporte) e 68 (Relacionamento)**: eles têm cartão próprio em Setores, mas Colaboradores não tem chip deles (só o chip ATENDIMENTO, que os agrega); aceitar ajuste ali faria as duas telas discordarem. A equipe dessas áreas se ajusta pelo ATENDIMENTO, e a tela esconde a visão Equipe nesses dois setores com essa explicação. Não valida contra o IXC se o setor/pessoa existem: o cálculo já ignora o que não existe, e a tela só oferece pessoas carregadas do IXC.

### 6. Tela: equipe dentro do painel de cada setor, na aba Responsáveis
`ResponsaveisManual.jsx` já abre um painel por setor (`setorAberto`). Esse painel ganha duas visões, "Responsável" (a atual) e "Equipe", num componente novo `EquipeSetor.jsx` para não crescer um arquivo que já tem 466 linhas. A visão Equipe lista a equipe efetiva com a origem escrita ("IXC" / "definido na intranet"), uma ação por pessoa (remover da equipe: exclui se vem do IXC, desfaz se foi incluída à mão), a lista de excluídos com "desfazer", e uma busca para incluir (nome sem acento, só ativos). Os dados vêm do `/api/colaboradores?all=true` que a aba já carrega; não há `GET` novo. Confirmação inline nominal antes de cada gravação (padrão já adotado: lista curta = confirmação na linha), erro com `role="alert"` e estado anterior preservado. Detalhes visuais ficam para o `/impeccable`.

### 6b. Remover todos e Restaurar: uma rota de lote, uma transação
Remover 49 pessoas com 49 chamadas deixaria o setor pela metade se uma falhasse e encheria a Auditoria. Rota nova `POST /api/admin/setores-membros-manuais/lote`, `gate('usuarios')`, corpo `{ id_setor, ajustes: [{ id_funcionario, nome, acao }] }` com 1 a 500 itens, `acao ∈ incluir | excluir | desfazer`, as mesmas validações da rota unitária e a mesma recusa dos setores 15 e 68. Tudo numa transação (tudo ou nada). Auditoria com **uma linha por tipo de ação** do lote, com a contagem e até 5 nomes ("Excluiu 49 colaboradores da equipe do setor 32: Ana, Bia…"). Devolve a lista completa de ajustes e invalida o cache de setores, como a rota unitária.
- "Remover todos" é montado no cliente a partir da equipe que a tela já tem: quem vem do IXC vira `excluir`, quem foi incluído à mão vira `desfazer`. "Restaurar equipe do IXC" vira `desfazer` para todos os ajustes do setor (excluídos e incluídos).
- *Descartado: acao `remover_todos` decidida no servidor.* O servidor teria de consultar o IXC para saber quem é do setor, e a tela já tem essa lista.
- A confirmação é uma só e informa a quantidade ("Remover as 49 pessoas…"); "Remover todos" não age sobre uma lista filtrada pela busca, só sobre a equipe inteira.

### 7. Marcas nas telas públicas
- **Setores:** o cartão do setor mostra um texto discreto "equipe ajustada na intranet" quando `ajustado` é verdadeiro.
- **Colaboradores:** o cartão mantém o setor do IXC como principal e acrescenta, em texto, "também em: X" para setores definidos na intranet; quem foi excluído de um setor apenas deixa de aparecer no filtro dele.
- Marca é sempre texto, nunca só cor.

### 8. O que o Plantão e o Organograma continuam fazendo
Nenhuma linha de `useScheduleData.js` ou do Organograma muda. Isso é um requisito (ver spec) e uma verificação, porque o Plantão decide quem pode ser escalado e mexer nisso é outra decisão.

## Risks / Trade-offs

- **Duas implementações da mesma regra (backend e front)** → o script de teste as compara com os mesmos casos, e a verificação final confere, com dado real, que `totalMembros` de cada setor é igual à contagem do filtro em Colaboradores.
- **Exclusão de quem entra por ATENDIMENTO (15/68)** → coberta por caso de teste explícito nas duas implementações, porque é o ponto onde a canonização e o ajuste se encontram.
- **Uma pessoa em dois setores muda os totais por chip** → intencional; o total de pessoas únicas continua sem duplicar. Documentado na spec.
- **`/api/colaboradores?all=true` inclui inativos** → a tela de equipe e o cálculo de Setores só consideram ativos; ajustes de pessoas inativas ficam sem efeito e não geram erro.
- **Responsável manual que foi excluído da equipe** → permitido: o responsável manual é independente, como já é hoje. Se incomodar, é uma decisão futura.
- **Banco único e sem staging** → migration idempotente, sem seed, aplicada só com o arquivo 024 e com autorização; testar escrita só numa conta e setor de teste, restaurando ao fim.
- **Leitura pública dos ajustes** (via `/api/colaboradores`) → só `id_setor` e `acao`, sem autor nem data; coerente com a marca "definido na intranet" ser pública por desenho.

## Migration Plan

1. Aplicar `024_setores_membros_manuais.sql` com o driver `pg`/`psql -f`, só o arquivo 024 (nunca `run.js`), com autorização; conferir as colunas.
2. Publicar o backend. Com a tabela vazia, `/api/setores` e `/api/colaboradores` devolvem o mesmo que hoje (campos novos vazios).
3. Publicar o frontend.
4. Rollback: reverter o deploy; a tabela, vazia ou preenchida, é inofensiva. `DROP TABLE` só se a change for abandonada.

## Open Questions

- Nenhuma que mude specs ou tarefas. As escolhas de escopo (incluir e excluir, ATENDIMENTO intocado, Plantão fora, mais de um setor, marca visível) vieram da conversa e estão nas decisões acima.
