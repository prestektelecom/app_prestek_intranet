## Why

A abertura de chamado de TI (`POST /api/ixc/su-ticket`) para de gerar Ordem de Serviço sem
nenhum aviso sempre que o par `id_login`/`id_contrato` hardcoded em `backend/server.js`
(usado como placeholder do cliente interno "escritório Prestek", id 681) fica desatualizado
na IXC. Isso aconteceu hoje (2026-09-17): o login 1 migrou do contrato `18426` (hardcoded)
para o `8578` em algum momento entre 29/08 e 17/09, e as duas primeiras tentativas de abrir
chamado desde então falharam com "O login não está vinculado ao contrato" — para o Everton
e para qualquer técnico.

O sintoma relatado ("abre mas fecha") é pior do que uma falha comum: o backend **apaga** a
OS que o workflow da IXC já tinha criado com sucesso, tentando substituí-la por uma agendada
com o técnico certo, e a substituta nunca nasce — o chamado (ticket) fica registrado, mas
sem nenhuma OS vinculada. E como o endpoint responde `sucesso: true` mesmo quando isso
acontece, não existe hoje nenhum sinal, nem para o frontend nem para quem abriu o chamado,
de que a OS sumiu.

Esse risco já estava documentado e aceito na change original do fluxo
(`openspec/changes/archive/2026-07-05-fix-ixc-tecnico-atendente/design.md`, seção Risks:
"Ticket fica sem OS se a deleção funcionar mas a criação manual falhar") — ele só nunca
tinha se materializado até agora.

## What Changes

- Resolver `id_login`/`id_contrato` do cliente placeholder (681) a partir do contrato
  vigente na IXC no momento da chamada, em vez de usar os valores hardcoded
  `id_login: '1'` / `id_contrato: '18426'` fixados desde a change de 2026-07-05.
- Inverter a ordem de operações do fallback ("PASSO 2"): hoje o backend deleta a OS criada
  pelo workflow da IXC **antes** de confirmar que a OS manual substituta foi criada; deve
  passar a só deletar a original depois de confirmar sucesso da criação da substituta (ou
  tratar explicitamente o caminho em que a criação falha, sem apagar a OS que já existia
  e funcionava).
- Corrigir a resposta de `POST /api/ixc/su-ticket` para não devolver `sucesso: true` quando
  nenhuma OS sobrevive ao final do fluxo (hoje isso mascara a falha completamente,
  devolvendo o protocolo da OS que já foi apagada).
- Atualizar a spec `ixc-os-tecnico-update`, que hoje descreve uma estratégia diferente
  (PUT direto em `id_tecnico` da OS) da que está realmente implementada (deletar a OS do
  workflow e recriar manualmente agendada) — a spec está dessincronizada da implementação
  desde a change de 2026-07-05 que trocou de estratégia sem atualizar o spec.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `ixc-os-tecnico-update`: reescreve os requisitos para refletir o fluxo real
  (criar/recriar OS manual agendada, não PUT de `id_tecnico`), adiciona requisito de
  resolução dinâmica de `id_login`/`id_contrato` do cliente placeholder, adiciona requisito
  de ordem segura de deleção (não apagar a OS existente antes de confirmar a substituta) e
  adiciona requisito de resposta honesta ao frontend quando nenhuma OS sobrevive.

## Impact

- **Código afetado**: `backend/server.js`, rota `POST /api/ixc/su-ticket` (linhas
  ~1750-2108: resolução de `ixcIds`, `buildOSManualPayload`, `criarOSManual`, PASSO 1,
  PASSO 2, resposta final).
- **Dependências externas**: API da IXC (`cliente_contrato`, `radusuarios`,
  `su_oss_chamado`, `su_ticket`) — usada só para leitura na investigação, chamadas de
  escrita continuam as mesmas rotas já em uso.
- **Frontend**: `TiSupportModal.jsx` consome a resposta deste endpoint; se o contrato de
  resposta mudar (deixar de sempre retornar `sucesso: true`), o consumo no frontend precisa
  refletir o novo caminho de erro — a decidir em design.md.
- **Fora de escopo**: busca dinâmica de técnicos na tabela `funcionarios` (non-goal já
  herdado da change original); segurança/PII do `ixc_debug.log` (pendência separada já
  registrada em `MEMORIA.md`); rotação de credenciais IXC (decisão já tomada e adiada, sem
  relação com este bug).
