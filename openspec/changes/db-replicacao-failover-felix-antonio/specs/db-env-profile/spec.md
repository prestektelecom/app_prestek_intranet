## Purpose

Define a estrutura de variáveis de ambiente do backend para suportar múltiplos perfis de banco de dados (LOCAL para desenvolvimento, PRODUÇÃO com PRIMARY/REPLICA), tornando a troca de ambiente trivial e documentada.

## ADDED Requirements

### Requirement: Perfil LOCAL isolado de produção

O arquivo `.env` SHALL conter um bloco `LOCAL` claramente demarcado, ativado quando o desenvolvedor trabalha offline. O perfil LOCAL SHALL apontar apenas para `127.0.0.1` e nunca interferir com os servidores de produção.

#### Scenario: Desenvolvedor rodando localmente

- **WHEN** `DB_HOST=127.0.0.1` está ativo e `DB_PRIMARY_HOST` está comentado
- **THEN** o backend SHALL conectar somente no banco local, sem tentar Felix ou Antonio

### Requirement: Perfil PRODUÇÃO com PRIMARY e REPLICA

O arquivo `.env` SHALL conter variáveis `DB_PRIMARY_HOST`, `DB_REPLICA_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` para o ambiente de produção, usadas quando `DB_HOST` não está definido.

#### Scenario: Ambiente de produção ativo

- **WHEN** `DB_PRIMARY_HOST=65.21.149.72` e `DB_REPLICA_HOST=201.150.48.6` estão ativos
- **THEN** `db.js` SHALL montar a lista de hosts candidatos `[65.21.149.72, 201.150.48.6]` e adotar o primeiro que aceitar escrita

### Requirement: Comentários explicativos no .env

O `.env` SHALL conter comentários em português explicando como alternar entre perfis, quais variáveis ativar/comentar e onde estão as credenciais de cada ambiente.

#### Scenario: Desenvolvedor novo no projeto

- **WHEN** um desenvolvedor abre o `.env` pela primeira vez
- **THEN** SHALL conseguir entender como trocar entre LOCAL e PRODUÇÃO apenas lendo os comentários, sem consultar documentação externa
