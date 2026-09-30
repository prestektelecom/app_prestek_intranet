## ADDED Requirements

### Requirement: Estado do usuário inclui as permissões por capacidade
O estado do usuário autenticado no front-end SHALL incluir a lista `permissoes` retornada por `POST /api/login`, além de `is_admin`, e SHALL tratá-la como lista vazia quando ausente.

#### Scenario: Login de usuário com permissões
- **WHEN** um usuário não administrador com a capacidade `comunicados` faz login com sucesso
- **THEN** o estado do usuário no front-end tem `permissoes` contendo `comunicados`
- **AND** `is_admin` continua `false`

#### Scenario: Login sem permissões
- **WHEN** um usuário sem nenhuma capacidade faz login com sucesso
- **THEN** o estado do usuário no front-end tem `permissoes` como lista vazia

#### Scenario: Sessão antiga sem o campo
- **WHEN** o front-end restaura uma sessão salva antes desta mudança, sem `permissoes`
- **THEN** o estado SHALL tratar `permissoes` como lista vazia, sem erro
