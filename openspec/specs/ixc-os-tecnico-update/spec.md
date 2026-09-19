# ixc-os-tecnico-update Specification

## Purpose
Define o comportamento de criação/atualização da Ordem de Serviço (OS) vinculada a um ticket
de suporte de TI criado pela intranet no IXC Soft: como o backend garante uma OS agendada com
o técnico correto, como resolve o contrato do cliente placeholder usado para chamados
internos, e como a resposta ao frontend reflete honestamente o resultado.

## Requirements

### Requirement: Criação de OS manual agendada com técnico correto
Após a criação do ticket de suporte de TI, o backend SHALL garantir que exista uma Ordem de
Serviço (OS) no IXC vinculada ao ticket, agendada (`status: "AG"`) e atribuída ao técnico
correto (`id_tecnico`). Como a OS gerada automaticamente pelo workflow da IXC nasce com
`id_tecnico = 0` e a API não permite alterar `id_tecnico`/`status` de uma OS criada por
workflow, o backend SHALL: (1) tentar criar uma OS manual agendada imediatamente após o
ticket; (2) se bloqueado, localizar a OS gerada pelo workflow e usá-la como base para a
substituição segura (ver requisito de ordem de substituição). O resultado de cada tentativa
SHALL ser logado em `ixc_debug.log`.

#### Scenario: OS manual criada de primeira, sem OS de workflow no caminho
- **WHEN** o ticket é criado e a tentativa imediata de criar a OS manual agendada é aceita
  pela IXC
- **THEN** o sistema SHALL considerar essa OS como a OS final do ticket, sem precisar
  localizar ou apagar nenhuma OS de workflow

#### Scenario: OS manual bloqueada pela OS do workflow
- **WHEN** a tentativa imediata de criar a OS manual falha porque já existe uma OS gerada
  pelo workflow para o ticket
- **THEN** o sistema SHALL localizar essa OS via poll (até 6 tentativas) e seguir o
  requisito de ordem segura de substituição antes de tentar novamente

### Requirement: Resolução dinâmica do contrato do cliente placeholder por nome de login
O backend SHALL resolver `id_contrato`/`id_contrato_kit` do cliente placeholder usado para
chamados internos de TI (cliente 681, "escritório Prestek") consultando a IXC no momento da
chamada, em vez de usar um valor fixo no código-fonte. O cliente placeholder SHALL ter mais
de um login cadastrado (um por unidade/filial que usa o mesmo registro de cliente) — a
resolução NÃO SHALL assumir que existe apenas um login para o cliente. A identificação do
login correto SHALL ser feita pelo nome de usuário (`radusuarios.login`), um identificador
administrativo estável, e não pela contagem de logins do cliente.

#### Scenario: Contrato do placeholder muda na IXC (renovação, migração)
- **WHEN** a IXC associa o login (identificado pelo nome de usuário) do cliente placeholder
  a um novo contrato (por renovação, migração ou qualquer motivo administrativo)
- **THEN** a próxima abertura de chamado SHALL usar o contrato vigente resolvido na hora,
  sem precisar de deploy ou alteração de código
- **THEN** a IXC SHALL só rejeitar o payload de criação da OS manual se o login realmente
  não estiver vinculado a nenhum contrato válido, não por desatualização de um valor fixo
  no código

#### Scenario: Cliente placeholder tem múltiplos logins de outras unidades
- **WHEN** o cliente placeholder tem outros logins ativos além do usado para chamados
  internos de TI (ex.: logins de outras unidades/filiais da empresa que usam o mesmo
  registro de cliente na IXC)
- **THEN** a resolução SHALL identificar o login correto pelo nome de usuário específico,
  não pela quantidade de logins ativos do cliente
- **THEN** a presença de outros logins do mesmo cliente NÃO SHALL fazer a resolução falhar

#### Scenario: Falha ao resolver o contrato do placeholder
- **WHEN** a consulta à IXC pelo nome de login do placeholder falha, ou não encontra nenhum
  login ativo com esse nome vinculado ao cliente placeholder
- **THEN** o sistema SHALL logar o erro em `ixc_debug.log`
- **THEN** o sistema NÃO SHALL prosseguir para deletar nenhuma OS existente usando um
  payload que já se sabe incompleto

#### Scenario: Ticket continua exigindo um contrato válido mesmo quando a resolução falha
- **WHEN** a resolução estrita de `id_login`/`id_contrato` falha, mas o assunto usado no
  ticket marca o campo contrato como obrigatório (ex.: `su_oss_assunto.contrato_obrigatorio`
  = "S")
- **THEN** o sistema SHALL preencher `id_contrato` do ticket com qualquer contrato ativo do
  cliente placeholder (sem exigir o vínculo exato com um login), para não quebrar a criação
  do ticket em si
- **THEN** essa resolução alternativa NÃO SHALL ser suficiente para liberar a criação da OS
  — o fluxo de OS continua bloqueado como no cenário anterior

### Requirement: Deleção da OS do workflow só quando o erro confirma que ela é o único obstáculo
A IXC recusa criar uma OS manual para um ticket que já tem uma OS gerada pelo workflow — não
existe uma chamada de validação separada da tentativa de criação em si. Por isso o backend
NÃO SHALL deletar a OS gerada pelo workflow com base apenas em "a criação da OS manual
falhou"; SHALL primeiro classificar a mensagem de erro retornada pela IXC e só prosseguir com
a deleção quando o erro identifica especificamente que o bloqueio é a existência dessa OS
(não qualquer outro motivo, como um problema de dados).

#### Scenario: Falha identificada como bloqueio pela OS do workflow
- **WHEN** a tentativa de criar a OS manual falha e a mensagem de erro da IXC indica que o
  ticket já possui uma OS vinculada
- **THEN** o sistema SHALL localizar essa OS, deletar suas mensagens e o registro, e tentar
  criar a OS manual substituta novamente
- **THEN** o sistema SHALL registrar em log o ID da OS antiga (deletada) e, se a nova
  criação for bem-sucedida, o ID da OS final

#### Scenario: Falha por qualquer outro motivo não deleta nada
- **WHEN** a tentativa de criar a OS manual falha e a mensagem de erro da IXC NÃO indica
  bloqueio por uma OS de workflow existente (ex.: um erro de dados inesperado que a
  resolução dinâmica de login/contrato não cobriu)
- **THEN** o sistema NÃO SHALL buscar nem deletar nenhuma OS do workflow para esse ticket
- **THEN** o sistema SHALL logar a falha e seguir para a resposta de "nenhuma OS
  sobrevivente" sem apagar nada que já existia

#### Scenario: Recriação falha mesmo após a deleção necessária
- **WHEN** o sistema já deletou a OS do workflow (por ter confirmado o bloqueio, no primeiro
  cenário) e a tentativa seguinte de criar a OS manual substituta falha mesmo assim
- **THEN** o sistema SHALL logar essa falha como crítica, incluindo o ID da OS que foi
  deletada
- **THEN** o sistema NÃO SHALL tentar reverter ou recriar a OS deletada — a resposta ao
  frontend SHALL sinalizar a ausência de OS (ver requisito de resposta honesta)

### Requirement: Resposta honesta quando nenhuma OS sobrevive
A resposta de `POST /api/ixc/su-ticket` SHALL refletir corretamente se existe ou não uma OS
válida vinculada ao ticket ao final do processamento. O sistema NÃO SHALL retornar
`sucesso: true` com um protocolo de uma OS que foi deletada e não foi substituída.

#### Scenario: Nenhuma OS sobrevive ao processamento
- **WHEN** o fluxo termina sem nenhuma OS válida vinculada ao ticket (nem a do workflow, por
  ter sido substituída ou perdida, nem uma manual)
- **THEN** a resposta SHALL sinalizar essa condição de forma distinguível de um sucesso
  completo (ex.: campo dedicado indicando ausência de OS, ou `sucesso: false` com o motivo)
- **THEN** o ticket em si (já criado com sucesso na IXC) SHALL continuar sendo reportado
  como criado, para não sugerir que nada aconteceu

#### Scenario: Ticket criado e OS válida vinculada (workflow ou manual)
- **WHEN** o fluxo termina com uma OS válida vinculada ao ticket, seja a do workflow
  (preservada) ou a manual (criada com sucesso)
- **THEN** a resposta SHALL retornar `sucesso: true` com o protocolo correspondente à OS
  efetivamente existente na IXC
