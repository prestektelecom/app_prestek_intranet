## Purpose

Permitir que um administrador conceda a outros usuários acesso a partes específicas da gestão da intranet (comunicados, plantões, usuários, auditoria, TI) sem torná-los administradores plenos, e garantir que a API respeite essas permissões independentemente do que a interface mostra.

## ADDED Requirements

### Requirement: Catálogo fixo de capacidades
O sistema SHALL reconhecer exatamente estas capacidades de gestão: `comunicados`, `plantao`, `usuarios`, `auditoria` e `ti`. Qualquer outro valor SHALL ser rejeitado ao atribuir permissões.

#### Scenario: Capacidade desconhecida é rejeitada
- **WHEN** um administrador tenta atribuir a um usuário uma capacidade fora do catálogo
- **THEN** o sistema SHALL recusar a requisição com erro de validação
- **THEN** nenhuma permissão do usuário SHALL ser alterada

### Requirement: Administrador tem todas as capacidades
Um usuário com `is_admin = true` SHALL ser tratado como detentor de todas as capacidades, sem precisar de nenhuma linha de permissão.

#### Scenario: Admin acessa qualquer rota de gestão
- **WHEN** um administrador sem nenhuma permissão atribuída chama uma rota protegida por capacidade
- **THEN** o sistema SHALL autorizar a chamada

### Requirement: Permissão libera só a capacidade concedida
Um usuário que não é administrador SHALL poder usar somente as rotas de gestão das capacidades que lhe foram atribuídas.

#### Scenario: Usuário com a capacidade acessa a rota correspondente
- **WHEN** um usuário não administrador com a capacidade `comunicados` cria um comunicado
- **THEN** o sistema SHALL autorizar a criação

#### Scenario: Usuário sem a capacidade é recusado
- **WHEN** um usuário não administrador com apenas a capacidade `comunicados` chama uma rota que exige `usuarios`
- **THEN** o sistema SHALL responder com acesso negado (403)
- **THEN** a resposta SHALL NOT expor detalhes internos

#### Scenario: Usuário sem nenhuma permissão é recusado
- **WHEN** um usuário não administrador e sem permissões chama qualquer rota de gestão
- **THEN** o sistema SHALL responder com acesso negado (403)

### Requirement: Rotas de administração pura continuam exclusivas do administrador
Rotas que não pertencem a nenhuma capacidade do catálogo (conceder ou revogar privilégio de administrador, conceder ou revogar permissões, configurações globais, cobertura, processos e categorias de processos) SHALL continuar acessíveis somente a administradores, mesmo para quem tem capacidades.

#### Scenario: Detentor de capacidade não concede privilégios
- **WHEN** um usuário não administrador com a capacidade `usuarios` tenta conceder admin ou atribuir permissões a alguém
- **THEN** o sistema SHALL responder com acesso negado (403)

### Requirement: Revogação tem efeito imediato
A autorização SHALL ser decidida a partir do estado atual do banco a cada requisição, sem depender do que o usuário carregou no login.

#### Scenario: Permissão revogada bloqueia a chamada seguinte
- **WHEN** um administrador revoga uma capacidade de um usuário que já está logado
- **THEN** a próxima chamada desse usuário à rota correspondente SHALL ser recusada com 403, sem que ele precise fazer novo login

### Requirement: Permissões chegam ao cliente no login e podem ser revalidadas
A resposta do login SHALL incluir a lista de capacidades do usuário. O sistema SHALL oferecer uma consulta autenticada que devolve as capacidades atuais do próprio usuário, ignorando qualquer identificador enviado pelo cliente.

#### Scenario: Login devolve as permissões
- **WHEN** um usuário com as capacidades `plantao` e `auditoria` faz login
- **THEN** a resposta SHALL listar `plantao` e `auditoria`

#### Scenario: Revalidação reflete o estado atual
- **WHEN** um administrador altera as permissões de um usuário e esse usuário consulta as próprias permissões
- **THEN** a resposta SHALL refletir o estado atual, não o do login

#### Scenario: Consulta sempre trata do usuário autenticado
- **WHEN** um usuário consulta as próprias permissões enviando o identificador de outro usuário
- **THEN** a resposta SHALL conter apenas as permissões do usuário autenticado

### Requirement: Somente o administrador atribui permissões, com registro
Conceder ou revogar permissões SHALL ser permitido apenas a administradores e SHALL gerar um registro de auditoria por capacidade alterada, identificando quem alterou, quem foi afetado e qual capacidade.

#### Scenario: Concessão é auditada
- **WHEN** um administrador concede a capacidade `ti` a um usuário
- **THEN** a Auditoria SHALL registrar a concessão com o administrador, o usuário afetado e a capacidade

#### Scenario: Revogação é auditada
- **WHEN** um administrador revoga a capacidade `ti` de um usuário
- **THEN** a Auditoria SHALL registrar a revogação com o administrador, o usuário afetado e a capacidade

#### Scenario: Atribuir o mesmo conjunto não gera ruído
- **WHEN** um administrador salva permissões idênticas às atuais do usuário
- **THEN** nenhum registro de auditoria SHALL ser criado

### Requirement: Usuário sem perfil sincronizado não tem permissões
Um usuário que ainda não tem registro em `usuarios_perfil` SHALL ser tratado como sem capacidades e sem privilégio de administrador.

#### Scenario: Perfil inexistente
- **WHEN** um usuário autenticado sem registro de perfil chama uma rota de gestão
- **THEN** o sistema SHALL responder com acesso negado (403)
