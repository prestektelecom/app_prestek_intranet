## 1. Migration

- [x] 1.1 Criar `backend/migrations/022_processos_ixc_vinculo.sql`: colunas nullable em `processos` — `ixc_wfl_processo_id` (INTEGER), `ixc_wfl_processo_nome` (VARCHAR, cache do `descricao` do `wfl_processo`, para exibir no formulário sem nova chamada), `ixc_assunto_id` (INTEGER), `ixc_assunto_nome` (VARCHAR), `ixc_resolvido_em` (TIMESTAMP)
- [x] 1.2 Rodar a migration local e confirmar via `\d processos` (ou equivalente) que as colunas existem e são nullable — confirmado via `information_schema.columns` contra o banco real (projeto não tem staging), as 5 colunas existem, todas `is_nullable = YES`

## 2. Backend — cliente IXC e resolução da cadeia de workflow

- [x] 2.1 Função `listarWflProcessosAtivos()` (`backend/services/ixc.js` ou módulo novo) — `ixcListar('wfl_processo', { qtype: 'wfl_processo.ativo', query: 'S', oper: '=' })`, retorna `[{ id, descricao }]` ordenado por `descricao`
- [x] 2.2 Função `resolverAssuntoWorkflow(idWflProcesso)` — implementa a cadeia decidida em D2/D3 do design.md:
  - busca `wfl_tarefa` por `id_processo`, filtra `ativo='S'`, pega a de menor `sequencia`; erro descritivo se não houver nenhuma
  - busca `wfl_interacoes` por `id_tarefa`, filtra `ativo='S'` E `id_wfl_param_os` != 0/vazio, pega a de menor `id` em caso de empate; erro descritivo se não sobrar nenhuma
  - busca `wfl_parametro_oss` pelo `id` (= `id_wfl_param_os`), extrai `id_assunto`
  - busca `su_oss_assunto` pelo `id_assunto`, extrai `assunto` (nome) — falha aqui é não-fatal, resolução segue sem nome se o assunto não for encontrado
  - retorna `{ idAssunto, nomeAssunto }`
- [x] 2.3 Erros da função nunca vazam `e.message` cru pro chamador HTTP — as 4 mensagens lançadas por `resolverAssuntoWorkflow` são texto curado nosso (seguras de repassar ao cliente); erros inesperados (rede/IXC fora do ar) ficam a cargo do chamador (rota) trocar por mensagem genérica + `console.error` com o detalhe real
- [x] 2.4 **(achado real, fora do design original — corrigido durante verificação com o Felix)** Empate de `sequencia` entre DUAS tarefas do mesmo processo, não só entre interações da mesma tarefa (D3 cobria só o 2º caso). Confirmado ao vivo no processo real "CRM VENDAS INTERNAS/EXTERNA (revisado)" (`wfl_processo.id=235`): 2 tarefas com `sequencia=1`, as duas resolvendo pra um `id_assunto` válido e DIFERENTE — a implementação original escolhia a 1ª da ordem que a API devolvia, errando silenciosamente sem erro nenhum. Corrigido (`escolherPrimeiraTarefa()`, `services/ixc.js`, ver design.md D3b): entre as tarefas empatadas na menor sequência, prefere a(s) com `id_proxima_tarefa != 0` (conecta com o resto do fluxo); se a ambiguidade persistir, erro curado novo em vez de adivinhar. Verificado ao vivo: processo 4 continua resolvendo 1113 sem regressão; processo 235 agora resolve deterministicamente pra 1013 ("CRM VENDAS INTERNAS/EXTERNAS", a tarefa conectada), não mais pela tarefa órfã (1971, assunto 1050).

## 3. Backend — rotas

- [x] 3.1 `GET /api/processos/ixc/wfl-processos` (admin-only, `adminAuth`) — chama `listarWflProcessosAtivos()`, retorna a lista pro seletor do formulário
- [x] 3.2 `shapeProcesso(row)` passa a incluir `ixcWflProcessoId`, `ixcWflProcessoNome`, `ixcAssuntoId`, `ixcAssuntoNome`, `ixcResolvidoEm` na resposta
- [x] 3.3 `POST /api/processos` e `PUT /api/processos/:id` — quando o body incluir `ixcWflProcessoId` (novo ou alterado em relação ao valor salvo), chamar `resolverAssuntoWorkflow()` antes de gravar e persistir `ixc_assunto_id`/`ixc_assunto_nome`/`ixc_resolvido_em` junto com o resto do registro; se a resolução falhar, o Processo é salvo mesmo assim (campos de vínculo ficam como estavam antes, ou nulos se é a 1ª tentativa) e a resposta sinaliza o erro de vínculo separado do sucesso do salvamento do Processo (não usar `sucesso: true` genérico mascarando a falha parcial — mesmo cuidado já registrado na correção do bug de OS do su-ticket). PUT só reprocessa quando `ixcWflProcessoId` muda em relação ao valor já salvo, evitando 3-4 chamadas ao IXC em toda edição
- [x] 3.4 `POST /api/processos/:id/ixc/atualizar` (admin-only) — reprocessa `resolverAssuntoWorkflow()` usando o `ixc_wfl_processo_id` já salvo no registro, atualiza os campos resolvidos e `ixc_resolvido_em`; erro 400 com mensagem genérica se o processo não tiver vínculo

## 4. Frontend — formulário de Processo

- [x] 4.1 `ProcessoModal`: novo campo "Processo do IXC" — seletor carregado de `GET /api/processos/ixc/wfl-processos`, valor inicial = `processo.ixcWflProcessoId` quando em edição, opção "Nenhum" para desvincular
- [x] 4.2 Ao salvar com um vínculo novo/alterado, mostrar o assunto resolvido (número + nome) retornado pela API — implementado como um banner transitório (`role="status"`/`role="alert"`, 6s) na página, exibido depois de fechar o modal (a resolução acontece no mesmo POST/PUT de salvar, no servidor; não há preview antes de confirmar)
- [x] 4.3 Quando o processo já tiver vínculo, mostrar o assunto atual (`ixcAssuntoId` + `ixcAssuntoNome`) e o timestamp da última resolução (`ixcResolvidoEm`), com botão "Atualizar vínculo agora" chamando `POST /api/processos/:id/ixc/atualizar` — modal aberto é atualizado com o dado fresco via `setModal`, sem precisar fechar/reabrir
- [x] 4.4 Erro de resolução exibido — mesmo banner transitório do 4.2 (`erroVinculo`/erro do `atualizar`), mensagem genérica (nunca `e.message` cru do IXC), nunca bloqueia o Processo de ter sido salvo

## 5. Frontend — badge de ID na listagem

- [x] 5.1 `<td>` da tabela desktop: trocar `{p.id}` por `{p.ixcAssuntoId ?? p.id}`, mantendo a mesma classe/estilo atual
- [x] 5.2 Card da lista mobile: mesma troca `{p.ixcAssuntoId ?? p.id}`
- [x] 5.3 Adicionar `title`/tooltip no badge quando vinculado (ex. `Assunto do IXC: 1113 — SOLICITAR ALTERAÇÃO DE SENHA WI-FI`), pro contexto não ficar implícito
- [x] 5.4 Confirmar que os badges de `ProcessoModal` e `ProcessoViewModal` **não foram tocados** — confirmado via grep, ambos continuam `{processo.id}` puro

## 6. Verificação

- [x] 6.1 `node --check backend/server.js` e demais arquivos tocados — `server.js` e `services/ixc.js` limpos
- [x] 6.2 `npx vite build` limpo — build em 18,86s, sem erro (o único aviso é o chunk grande de `baseLayer` do MapLibre, pré-existente, não relacionado a esta change)
- [x] 6.3 Testado via API (escolha do Felix, sem tocar dado real de produção pela UI — instância isolada na porta 3002, mesmo banco/IXC de produção, sem interferir na sessão dele na 3001): criado um Processo de teste descartável já vinculado ao `wfl_processo` id=4 ("ALTERAR SENHA WIFI (revisado)") — `POST /api/processos` resolveu `ixcAssuntoId: 1113`, `ixcAssuntoNome: "SOLICITAR ALTERAÇÃO DE SENHA WI-FI"` (bate exato com o exemplo original do Felix); `GET /api/processos` confirmado refletindo esse valor (é exatamente o que a listagem consome pro badge). Tooltip/renderização visual não testados no navegador — o contrato de dado que alimenta os dois (badge + `title`) foi confirmado via API; verificação visual fica pro Felix quando for usar a tela.
- [x] 6.4 `POST /api/processos/:id/ixc/atualizar` testado no processo de teste — reresolveu `1113` de novo, `ixcResolvidoEm` mudou. Caso de erro testado com um `wfl_processo` inexistente (id inventado) — resposta `200` (Processo continua salvo), `erroVinculo: "Este processo do IXC não tem nenhuma tarefa configurada."` (mensagem curada, sem termo técnico do IXC/driver vazando — verificado por regex no teste), e o assunto anterior (1113) foi preservado em vez de apagado pela tentativa falha.
- [x] 6.5 Testado desvinculando o mesmo Processo (`ixcWflProcessoId: null`) — `ixcAssuntoId` voltou a `null`, confirmando que a listagem cairia no fallback do ID interno (`p.ixcAssuntoId ?? p.id`). Processo de teste apagado ao final (`DELETE`), nenhum resíduo em produção.
- [x] 6.6 `/impeccable audit` rodado em `src/components/Processos.jsx`, focado nos pontos tocados. Detector (`impeccable detect`): **0 anti-patterns** antes e depois dos ajustes. 16 notas advisory de tipografia (fonte fora da rampa) — 15 pré-existentes, 1 minha (label do bloco de vínculo, `text-[10px]`) mas é exatamente o mesmo padrão já usado em TODO outro label deste formulário (`labelCls`, usado por Categoria/Status/Versão/etc.) — não é uma inconsistência nova, então não virou fix isolado (mesma lição já registrada no `MEMORIA.md`: corrigir só a cópia nova criaria uma DIVERGÊNCIA, não uma correção). 2 achados reais, corrigidos nesta sessão antes de fechar: botão "Atualizar vínculo agora" com `h-9` (36px, abaixo do mínimo de 44px de toque) → `h-11`, igual aos outros botões do mesmo modal; label duplicando a string de classes do `labelCls` compartilhado em vez de reusá-lo → trocado para `className={labelCls}`. Zero P0/P1 restantes. `npx vite build` limpo após os ajustes.

## 7. Registro

- [x] 7.1 Atualizar `MEMORIA.md` (Pendências/Decisões) com o resultado, achados reais da verificação ao vivo, e o resultado do audit Impeccable
- [ ] 7.2 Ao concluir, seguir `/opsx:archive` para sincronizar a spec `processos-vinculo-ixc-workflow` em `openspec/specs/`
