## Context

O fluxo vive inteiro em `backend/server.js`, na rota `POST /api/ixc/su-ticket`
(~linhas 1750-2108). Ver `proposal.md` para a motivação e o diagnóstico completo
(investigação feita em modo explore, com consultas read-only à IXC confirmando a causa
raiz).

Pontos que este design assume como dados (já verificados ao vivo, não hipóteses):
- O cliente placeholder de chamados internos de TI é sempre `id_cliente = 681`
  ("escritório Prestek" / "1 GIGA EVENTOS E FILIAS PRESTEK").
- **Corrigido após a primeira tentativa de implementação**: o cliente 681 NÃO tem um único
  login — tem 40 (`radusuarios.id_cliente = 681` retorna 40 registros, a maioria ativa),
  um por unidade/filial da Prestek que usa esse cliente guarda-chuva (ex.: `igrejanova`,
  `piacabucu`, `canabrava`, `garagem.penedo`). A 1ª versão deste design assumia "exatamente 1
  login ativo para o cliente" — essa suposição nunca foi verificada contra o volume real de
  dados e quebrou a resolução na primeira tentativa de teste ao vivo (`radusuarios` retornou
  10 login ativos na página consultada, de 40 no total). O login usado para chamados internos
  de TI é um específico, identificado pelo nome de usuário `login = 'escritorio.prestek'`
  (id `1` hoje, mas o `id` não é a chave de busca — o nome é). O campo `id_contrato` desse
  registro específico é a fonte de verdade de qual contrato está vinculado — hoje é `8578`,
  não `18426` como estava hardcoded.
- `su_ticket` (o "atendimento"/ticket) não depende de `id_login`/`id_contrato` batendo — só
  `su_oss_chamado` (a OS) valida esse vínculo. É por isso que o ticket sempre abre e só a OS
  falha.
- O protocolo retornado ao frontend hoje vem do próprio ticket (`ticketInfo.protocolo`, via
  `fetchTicket()`), não da OS — só cai no protocolo da OS como fallback se o ticket ainda não
  tiver gerado o dele no momento do poll. Ou seja, a existência de protocolo não é hoje (nem
  precisa passar a ser) uma prova de que existe uma OS válida.
- **Achado durante a implementação**: o assunto usado no ticket (`id_assunto = '1154'`,
  "SOLICITAR ATENDIMENTO AO SETOR DE T.I.") tem, confirmado ao vivo em `su_oss_assunto`,
  `contrato_obrigatorio: "S"` e `login_obrigatorio: "N"`. Isso explica com precisão a
  assimetria já observada: `su_ticket` exige um `id_contrato` válido (não pode ficar vazio),
  mas não exige que esse contrato esteja vinculado a um login específico — por isso o ticket
  nunca falhou por causa do desalinhamento login/contrato, só a OS (que exige o vínculo
  exato). Isso também significa que o fallback ingênuo "manda vazio quando a resolução
  falha" quebraria a criação do próprio ticket, não só da OS — corrigido com um segundo
  fallback, mais leve, só para preencher `id_contrato` do ticket (ver Decisão 1).

## Goals / Non-Goals

**Goals:**
- Eliminar a dependência de `id_login`/`id_contrato` fixos no código para o cliente
  placeholder 681.
- Garantir que a OS do workflow só seja apagada depois de confirmada a criação da
  substituta.
- Dar ao frontend um jeito de distinguir "ticket criado e com OS válida" de "ticket criado,
  mas sem nenhuma OS" — hoje essas duas situações são indistinguíveis na resposta.

**Non-Goals:**
- Não muda a lista fixa de técnicos (`MARCIO`/`EVERTON`) nem busca dinâmica na tabela
  `funcionarios` — non-goal herdado da change original de 2026-07-05.
- Não resolve o `id_login`/`id_contrato` por colaborador/solicitante real — o cliente 681
  continua sendo um placeholder único para todo chamado interno de TI, só o valor do
  contrato dele passa a ser lido em vez de fixo.
- Não adiciona alerta ativo (e-mail/Slack/etc.) quando um ticket fica sem OS — fica só como
  requisito de resposta ao frontend por enquanto; um canal de alerta separado é uma decisão
  de produto maior, fora deste fix pontual.
- Não mexe na segurança/PII do `ixc_debug.log` (pendência já registrada separadamente em
  `MEMORIA.md`).

## Decisions

### Decisão 1: Resolver `id_contrato` por nome de login (`radusuarios.login`), sem cache

**Corrigido após a primeira tentativa de implementação** — a formulação original consultava
`radusuarios` filtrando só por `id_cliente = 681 AND ativo = 'S'` e esperava exatamente 1
resultado. Testado ao vivo, essa consulta devolveu 10+ logins ativos (o cliente 681 tem 40
no total, um por unidade/filial da Prestek) — a resolução falhava sempre, mesmo com os dados
corretos disponíveis, porque a premissa "1 login por cliente" nunca foi verificada contra o
volume real.

Corrigido para filtrar por `radusuarios.login = 'escritorio.prestek'` (o nome de usuário
específico usado para chamados internos de TI) em vez de por `id_cliente`. O nome de login é
estável — é um identificador atribuído manualmente, ao contrário do `id_contrato` vinculado a
ele, que é exatamente o que muda por fora e motivou esta change. A resposta ainda é filtrada
por `id_cliente === '681' && ativo === 'S'` como confirmação, não como critério primário de
busca.

- **Resultado com 1 login correspondente**: usa `id` (→ `id_login`) e `id_contrato` (→
  `id_contrato_kit`) desse registro.
- **Resultado sem nenhum login correspondente** (nome não encontrado, ou encontrado mas
  inativo/de outro cliente): trata como falha de resolução (novo requisito da spec) — loga e
  não prossegue para deletar nenhuma OS existente.
- **Fallback só para o ticket, quando a resolução estrita falha**: como `su_ticket` exige
  `id_contrato` não-vazio para este assunto (ver Contexto), uma segunda consulta mais simples
  (`cliente_contrato` filtrado por `id_cliente = 681`, primeiro resultado) preenche só o
  `id_contrato` usado no payload do ticket. Esse fallback NÃO participa da decisão de
  prosseguir com a OS — `ixcIdsResolvidos` continua `false` nesse caminho, então o fluxo de
  OS (PASSO 1/2) permanece bloqueado mesmo com o ticket saindo normalmente.

**Alternativas consideradas:**
- *Manter o `id_login` fixo (`'1'`) e só buscar `id_contrato` dinamicamente por esse id*:
  mais simples e teria resolvido o incidente original, mas continua vulnerável se o próprio
  login for recriado com outro id. Descartada por não fechar a causa raiz por completo (a
  proposta pede resolução dinâmica, não um novo valor fixo) — mas o nome de login (`login`)
  acabou sendo a chave de busca mais estável mesmo assim, só não é o `id` numérico.
- *Cachear a resolução (ex.: TTL de algumas horas)*: reduziria uma chamada HTTP por
  abertura de chamado, mas o volume observado no log é baixo (poucas aberturas por dia) e
  cache é exatamente o tipo de "verdade desatualizada" que causou o bug original. Descartada
  — sem cache, mais simples, sem essa classe de risco.

### Decisão 2: Só deletar a OS do workflow quando o erro do PASSO 1 confirma que ela é o único obstáculo

**Atualizado durante a implementação** — a formulação original desta decisão ("criar a
manual antes de deletar a antiga") se provou fisicamente inviável: a IXC recusa criar a OS
manual precisamente PORQUE a OS do workflow já existe para o ticket ("Esse ticket já possui
uma O.S. vinculada [ID: ...], para criar mais que uma OS por atendimento, utilize
PROCESSO!" — mensagem estável, confirmada em 80+ ocorrências no log histórico). Não existe
uma forma de "confirmar sucesso antes de deletar" quando o próprio ato de deletar é o que
desbloqueia a tentativa seguinte — não há uma chamada de validação/dry-run separada da
criação de fato na API da IXC para este recurso.

A proteção real, portanto, não é de ordem (create-then-delete), e sim de **classificação do
erro antes de decidir deletar**: o PASSO 1 tenta criar a OS manual imediatamente; se falhar,
o backend verifica se a mensagem de erro é especificamente a de "OS já vinculada". Só nesse
caso — e só depois que a Decisão 1 já confirmou que login/contrato estão corretos — o
backend prossegue para apagar mensagens + OS do workflow e tentar criar de novo. Se o erro do
PASSO 1 for qualquer outro (ex.: um problema de dados que a Decisão 1 não pegou), o backend
NÃO deleta nada — apagar a OS do workflow não resolveria um erro que não é sobre ela existir.

Isso ainda fecha o buraco original: no incidente de hoje, o erro do PASSO 1 foi
especificamente o de vínculo login/contrato (não o de "OS já vinculada"), então com essa
classificação em vigor o fluxo teria abortado sem apagar nada, mesmo sem a Decisão 1. As duas
decisões juntas (validar antes + classificar o erro antes de deletar) cobrem, na prática, a
mesma superfície que "confirmar antes de deletar" cobriria se fosse tecnicamente possível.

**Risco residual, sem mitigação de "preservar"**: se a IXC aceitar o diagnóstico "bloqueado
pela OS do workflow", o backend deleta a OS do workflow para tentar recriar — e, num caso raro
(instabilidade momentânea, erro de rede no meio da segunda tentativa), essa recriação pode
falhar mesmo assim. Não há como restaurar a OS já deletada nesse ponto. A Decisão 3 (resposta
honesta) é a rede de segurança para esse caso residual, não uma prevenção.

**Alternativa considerada**: recriar a OS do workflow (ou uma OS genérica) se a criação da
manual falhar depois da deleção, como uma "rede de segurança" pós-falha. Descartada por ser
mais complexa (precisa recompor um payload equivalente ao da OS original, que pode ter sido
criada com campos que o backend não controla) e por o risco residual já ser pequeno com as
duas validações em vigor.

### Decisão 3: Contrato de resposta ganha um campo de status da OS, sem quebrar o campo `sucesso`

`sucesso: true` continua significando "o ticket foi criado na IXC" (verdade hoje, continua
verdade). Adiciona um campo novo, `os_criada: boolean`, e um `aviso: string | null` quando
`os_criada` for `false`, explicando que o chamado foi registrado mas nenhuma OS
agendada/válida ficou vinculada. O frontend (`TiSupportModal.jsx`) usa isso para mostrar a
tela de sucesso normal quando `os_criada: true`, e uma variante com aviso quando `false` (em
vez de tratar como erro — o ticket existe, TI só precisa ser avisado a agir por fora do
fluxo automático).

**Alternativa considerada**: usar `sucesso: false` quando a OS falha, tratando como erro
geral. Descartada porque o ticket de fato foi criado com sucesso na IXC — reportar como erro
completo faria o solicitante achar que precisa tentar de novo (potencialmente duplicando
tickets), quando o problema real é operacional (TI precisa saber que aquele chamado
específico não tem OS).

## Risks / Trade-offs

- **[Risco]** A resolução dinâmica via `radusuarios` adiciona uma chamada HTTP síncrona à
  IXC no caminho crítico de abertura de chamado, antes de qualquer tentativa de criar OS.
  → Mitigação: o fluxo já faz várias chamadas sequenciais à IXC (ticket, poll, criação de
  OS); uma chamada a mais é marginal, e sem ela o bug volta a ser possível.
- **[Risco]** Se o login `escritorio.prestek` for renomeado, desativado ou removido na IXC
  (evento administrativo raro, mas nesse cliente com 40 logins não impossível), a resolução
  volta a falhar até alguém corrigir o nome de referência no código — o mesmo tipo de
  dependência de um valor "fixo", só que agora um nome em vez de um id. → Mitigação: um nome
  de login é uma decisão administrativa deliberada e rara (diferente de "qual contrato está
  vinculado agora", que muda por renovação/migração normal do negócio); e o efeito da falha é
  visível (resposta honesta da Decisão 3), não silencioso como o bug original.
- **[Risco]** O novo campo `os_criada`/`aviso` no contrato de resposta exige uma mudança
  correspondente no frontend (`TiSupportModal.jsx`) para não passar despercebido — se o
  frontend não for atualizado, o aviso simplesmente não aparece (mas o `sucesso: true`
  continua correto, não quebra o fluxo existente). → Mitigação: incluído explicitamente nas
  tasks desta change, não como trabalho futuro separado.
- **[Risco herdado, não resolvido por este fix]** A origem da OS manual continua sendo "M"
  (manual) em vez de "P" (processo/workflow) — já documentado como risco aceito na change
  original; pode afetar filtros/relatórios na IXC. Fora de escopo aqui.

## Migration Plan

1. Implementar a resolução dinâmica de `id_login`/`id_contrato` (Decisão 1) e substituir o
   `ixcIds` hardcoded.
2. Reordenar o PASSO 2 (Decisão 2): abortar antes de deletar se a resolução (passo 1) já
   tiver falhado; só deletar a OS do workflow após confirmar sucesso da criação manual.
3. Adicionar `os_criada`/`aviso` à resposta (Decisão 3) e logar o novo campo em
   `ixc_debug.log` junto com o resumo final já existente.
4. Atualizar `TiSupportModal.jsx` para exibir a variante de aviso quando `os_criada: false`.
5. Testar manualmente abrindo um chamado de teste para cada técnico (MARCIO e EVERTON, como
   na validação original de 2026-06-29), confirmando no IXC Soft que a OS final está
   agendada com o técnico correto — e adicionalmente, simular o caminho de falha (ex.:
   apontar temporariamente para um `id_cliente` sem login ativo) para confirmar que a OS do
   workflow NÃO é apagada nesse caso.
6. Sem rollback especial necessário — é uma mudança only-additive no contrato de resposta
   (`sucesso` continua com o mesmo significado) e a lógica de backend é isolada nesta rota.
