# sessao-permissao-admin Specification

## Purpose

Garantir que o status de administrador (`is_admin`) de um usuário autenticado seja propagado de forma confiável do backend até o estado da aplicação no front-end, e que os elementos de interface restritos a admin reflitam corretamente esse status.

## Requirements

### Requirement: Propagação correta do status admin após o login

O estado do usuário autenticado no front-end SHALL refletir exatamente o campo `is_admin` retornado por `POST /api/login`.

#### Scenario: Login de usuário com is_admin = true no banco
- **WHEN** um usuário cujo registro em `usuarios_perfil` tem `is_admin = true` faz login com sucesso
- **THEN** o estado do usuário no front-end tem `is_admin: true`
- **AND** elementos de UI restritos a admin (ex: item de menu "TI" no Sidebar, botão "Gerenciar Categorias" em Processos Operacionais) são exibidos

#### Scenario: Login de usuário com is_admin = false (ou sem registro) no banco
- **WHEN** um usuário cujo registro em `usuarios_perfil` tem `is_admin = false`, ou que ainda não possui registro sincronizado, faz login com sucesso
- **THEN** o estado do usuário no front-end tem `is_admin: false`
- **AND** elementos de UI restritos a admin não são exibidos

#### Scenario: Novo login após mudança de status admin no banco
- **WHEN** o status `is_admin` de um usuário é alterado no banco (ex: promovido a admin) e esse usuário faz logout completo seguido de novo login
- **THEN** o estado do usuário no front-end reflete o novo valor de `is_admin`, sem depender de dados de sessão anteriores em cache

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
