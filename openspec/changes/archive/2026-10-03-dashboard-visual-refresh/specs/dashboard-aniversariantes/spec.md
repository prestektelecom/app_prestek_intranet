## ADDED Requirements

### Requirement: Card de aniversariantes na dashboard
A dashboard SHALL exibir um card "Aniversariantes" mostrando colaboradores ativos cujo aniversário cai hoje ou nos próximos 7 dias, ordenados por data mais próxima.

#### Scenario: Aniversariantes exibidos em ordem cronológica
- **WHEN** há colaboradores com `data_nascimento` nos próximos 7 dias
- **THEN** o card lista cada colaborador com: avatar (inicial do nome), nome completo, departamento e rótulo de data ("Hoje", "Amanhã" ou "DD/MM")

#### Scenario: Estado vazio sem aniversariantes
- **WHEN** nenhum colaborador tem aniversário nos próximos 7 dias
- **THEN** o card exibe mensagem "Nenhum aniversariante nos próximos 7 dias"

#### Scenario: Estado de carregamento
- **WHEN** a requisição à API ainda está em andamento
- **THEN** o card exibe skeleton placeholders no lugar dos itens

#### Scenario: Colaboradores sem data_nascimento são ignorados
- **WHEN** um colaborador tem `data_nascimento: null`
- **THEN** esse colaborador não aparece na lista de aniversariantes (sem erro)

### Requirement: Backend expõe data_nascimento no endpoint de colaboradores
O endpoint `GET /api/colaboradores` SHALL incluir o campo `data_nascimento` (string ISO ou `null`) no objeto de cada colaborador retornado.

#### Scenario: Campo data_nascimento presente no response
- **WHEN** `GET /api/colaboradores` é chamado
- **THEN** cada objeto no array `colaboradores` contém a chave `data_nascimento` com o valor vindo do IXC ou `null`
