## 1. Banco

- [x] 1.1 Criar `backend/migrations/024_setores_membros_manuais.sql`: `CREATE TABLE IF NOT EXISTS setores_membros_manuais` (`id_setor VARCHAR(50)`, `id_funcionario VARCHAR(50)`, `acao VARCHAR(10) NOT NULL CHECK (acao IN ('incluir','excluir'))`, `nome VARCHAR(255)`, `atualizado_por VARCHAR(255)`, `atualizado_em TIMESTAMPTZ DEFAULT NOW()`, PK `(id_setor, id_funcionario)`), sem seed
- [x] 1.2 Conferir por leitura que a migration é idempotente (só `IF NOT EXISTS`, nenhum `INSERT`)
- [x] 1.3 Aplicar a 024 em produção só com o arquivo 024 (nunca `run.js` inteiro) e com autorização do Felix; conferir as colunas no banco

## 2. Regra de equipe efetiva

- [x] 2.1 Criar `backend/services/equipeSetor.js` com `aplicarAjustes(membrosBase, ajustesDoSetor, funcionariosAtivosPorId)`: remove os excluídos, acrescenta os incluídos que são funcionários ativos conhecidos e ainda não são membros, devolve cada membro com `origem` (`ixc` ou `intranet`) e os contadores `incluidos`/`excluidos` realmente em vigor; ignora ajuste de id desconhecido ou inativo
- [x] 2.2 Criar `src/utils/setoresDaPessoa.js`: dado `id_departamento` e `ajustes_setores` da pessoa, devolve os ids de setor efetivos (setor do IXC primeiro), com a canonização `DEPTOS_MESCLADOS` (15 e 68 → 13) e exclusão do setor 13 removendo também quem entra por 15 ou 68
- [x] 2.3 Criar `scripts/testar-equipe-setor.mjs`: mesmos casos nas duas implementações (incluir, excluir, excluir de ATENDIMENTO por 15 e por 68, incluir em dois setores, ajuste para id inativo ou desconhecido, par sem ajuste) e falha se divergirem; rodar e anexar o resultado

## 3. Backend: Setores

- [x] 3.1 `/api/setores` (`backend/server.js`): ler `setores_membros_manuais` no `Promise.all` com `.catch(() => ({ rows: [] }))`; depois de calcular `membros` pela regra atual (intocada), aplicar `aplicarAjustes` por setor
- [x] 3.2 Derivar `totalMembros`, `grupos` e o responsável automático da equipe efetiva; manter `idsUnicos` como `Set`; acrescentar `ajustado`, `incluidos` e `excluidos` ao setor
- [x] 3.3 Trocar a chave de cache para `setores:lista:v3`
- [x] 3.4 `node --check backend/server.js` e `node --check backend/services/equipeSetor.js` limpos

## 4. Backend: Colaboradores e escrita

- [x] 4.1 `/api/colaboradores`: ler os ajustes junto com os outros enriquecimentos e acrescentar `ajustes_setores: [{ id_setor, acao }]` a cada pessoa (lista vazia se não houver; sem `atualizado_por`); tabela ausente não derruba a rota
- [x] 4.2 Criar `POST /api/admin/setores-membros-manuais` com `gate('usuarios')`: corpo `{ id_setor, id_funcionario, nome, acao }`, `acao ∈ incluir | excluir | desfazer`; validar `^\d+$` nos dois ids e a ação, recusar `id_setor` 15 e 68 (ajustar pelo ATENDIMENTO), 400 com mensagem fixa; upsert ou `DELETE`; `atualizado_por` vem do JWT, nunca do corpo
- [x] 4.3 Na mesma rota: `cacheInvalidate('setores:lista:v3')`, devolver a lista completa de ajustes e registrar `setor_membro_incluir`, `setor_membro_excluir` ou `setor_membro_desfazer` em Auditoria, com setor e pessoa na descrição; erros sem `e.message`

## 5. Frontend: Colaboradores

- [x] 5.1 `Directory.jsx`: o filtro por setor, as contagens por chip, o KPI de departamentos e o filtro de situação passam a usar `setoresDaPessoa`; quem está em dois setores entra no filtro e na contagem dos dois, mas conta uma vez no total de pessoas
- [x] 5.2 Cartão de colaborador: manter o setor do IXC como principal e acrescentar, em texto, "também em: X" para os setores definidos na intranet; sem cor como único sinal
- [x] 5.3 Conferir por `grep` que `useScheduleData.js` e o Organograma continuam sem tocar nos ajustes

## 6. Frontend: edição de equipe

- [x] 6.1 Criar `src/components/admin/EquipeSetor.jsx`: lista da equipe efetiva com a origem em texto ("IXC" ou "definido na intranet"), ação "remover da equipe" por pessoa (exclui se vem do IXC, desfaz se foi incluída à mão), lista de excluídos com "desfazer", e busca por nome sem acento para incluir (só ativos, no máximo ~30 resultados)
- [x] 6.2 Confirmação inline nominal ("Incluir Fulano na equipe de Comercial?") antes de qualquer gravação, `role="alert"` para falha, estado anterior preservado, alvos de 44px, sem `alert()` nem `window.confirm()`
- [x] 6.3 `ResponsaveisManual.jsx`: o painel de cada setor (exceto 15 e 68, onde a visão Equipe é substituída por uma nota apontando o ATENDIMENTO) ganha duas visões, "Responsável" (a atual, intacta) e "Equipe" (o componente novo); reaproveitar os dados do `/api/colaboradores?all=true` que a aba já carrega e atualizar o estado local com a lista devolvida pelo `POST`

## 7. Frontend: Setores e Auditoria

- [x] 7.1 Cartão de setor em Setores: texto discreto "equipe ajustada na intranet" quando `ajustado` for verdadeiro, e nenhuma marca quando não houver ajuste
- [x] 7.2 `iconeAcao.js` e o filtro de ações de `AdminAuditoria.jsx`: ícones e rótulos para `setor_membro_incluir`, `setor_membro_excluir` e `setor_membro_desfazer`, legíveis nos 5 temas

## 8. Verificação

- [x] 8.1 Escolher com o Felix o setor e a pessoa de teste e obter autorização para criar e desfazer ajustes em produção; usar uma instância isolada (porta 3002) com JWT assinado localmente, como em `permissoes-por-capacidade`
- [x] 8.2 Leitura sem escrita: com a tabela vazia, `/api/setores` e `/api/colaboradores` devolvem o mesmo que antes (totais por setor e contagem de chips idênticos aos de hoje)
- [x] 8.3 Ciclo de escrita: incluir uma pessoa num setor, excluir outra do setor dela, incluir uma terceira em dois setores; conferir `totalMembros`, `grupos`, `ajustado`, o filtro em Colaboradores e o total de colaboradores únicos; para cada setor, `totalMembros` igual à contagem do filtro (só ativos)
- [ ] 8.4 (coberto só pelo script de regra, casos 15 e 68; o teste ao vivo exige alterar a equipe de uma pessoa real de Suporte ou Relacionamento, que não foi autorizado) Conferir ATENDIMENTO: excluir do setor 13 uma pessoa que entra pelo departamento 15 ou 68 e confirmar que sai das duas telas
- [x] 8.5 Conferir sem permissão (403), valor inválido (400), `desfazer` voltando ao IXC, e Plantão inalterado (a mesma lista de pessoas de antes)
- [x] 8.6 Restaurar a conta e o setor de teste ao estado original, encerrar a instância e conferir `git status` sem sobra
- [x] 8.7 (verificado em AMOLED a 1280px e 360px; tema claro, Cyber, Aurora e Default Dark não foram vistos no navegador) Na tela, em claro e AMOLED, a 1280px e 360px: abrir a equipe de um setor, incluir, excluir, desfazer e forçar um erro de rede; conferir foco, Escape, marca "definido na intranet" e os cartões de Setores e Colaboradores

## 9. Impeccable e fechamento

- [x] 9.1 Rodar `/impeccable audit` em `EquipeSetor.jsx`, `ResponsaveisManual.jsx`, `Directory.jsx` e no cartão de Setores (contraste nos 5 temas, alvos de 44px, tipografia, responsivo); corrigir P0/P1 e registrar a nota e os achados
- [x] 9.2 `npx vite build` limpo
- [x] 9.3 Registrar a decisão e o resultado no `MEMORIA.md` (relendo o arquivo antes de escrever)
- [x] 9.4 `openspec validate --strict` antes de `/opsx:archive`

## 10. Remover todos e Restaurar equipe do IXC

- [x] 10.1 `POST /api/admin/setores-membros-manuais/lote` (`gate('usuarios')`): corpo `{ id_setor, ajustes: [{ id_funcionario, nome, acao }] }`, 1 a 500 itens, mesmas validações da rota unitária e recusa dos setores 15 e 68, transação única, `atualizado_por` do JWT, invalida `setores:lista:v3`, devolve a lista completa de ajustes
- [x] 10.2 Auditoria do lote: uma linha por tipo de ação, com a contagem e até 5 nomes; erros sem `e.message`
- [x] 10.3 `EquipeSetor.jsx`: botões "Remover todos" (monta `excluir` para quem vem do IXC e `desfazer` para quem foi incluído à mão) e "Restaurar equipe do IXC" (`desfazer` em todos os ajustes do setor); indisponíveis quando não fazem sentido; uma confirmação nominal com a quantidade, foco em "Cancelar", falha anunciada com o estado anterior preservado, alvos de 44px
- [x] 10.4 Verificação sem escrita: lote vazio, com mais de 500, com ação inválida, com id não numérico e para os setores 15 e 68 devolvem 400; conta comum recebe 403
- [x] 10.5 Verificação com escrita (precisa de autorização e de setor de teste): "Remover todos" deixa a equipe vazia e o total em 0, a Auditoria ganha uma linha por tipo, "Restaurar equipe do IXC" devolve o total e a lista ao baseline, e uma falha no meio do lote não grava nada
- [x] 10.6 (AMOLED a 1280px e 360px; outros temas não vistos) Ver o painel no navegador (AMOLED, 1280px e 360px) com os dois botões e as duas confirmações; `/impeccable audit` dos arquivos tocados; `npx vite build` limpo

