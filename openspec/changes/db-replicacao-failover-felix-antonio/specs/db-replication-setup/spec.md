## Purpose

Define a replicação do banco `prestek_db_postgres` entre o nó primário de produção e um nó standby, de modo que exista uma cópia atualizada dos dados fora do servidor principal.

## Status

**BLOQUEADO.** Os requisitos abaixo estão em termos de papéis (`PRIMÁRIO`, `STANDBY`) e não de servidores nomeados, porque a topologia ainda não foi decidida — ver D3 em `design.md`.

A versão anterior desta spec atribuía o papel de PRIMÁRIO ao Felix (65.21.149.72). O levantamento por SSH mostrou que o Felix não hospeda `prestek_db_postgres`: seu PostgreSQL é um container Docker Swarm sem porta publicada, servindo n8n, Typebot, Metabase e Evolution API. O banco da intranet vive no Antonio (201.150.48.6), hoje inacessível.

Os requisitos só podem ser finalizados depois de:
1. Levantar a configuração real do Antonio
2. Decidir onde fica o nó standby

## ADDED Requirements

### Requirement: Um único nó aceita escrita

Exatamente um nó SHALL aceitar operações de escrita em produção em um dado momento. O nó STANDBY SHALL operar em modo somente-leitura enquanto mantiver esse papel.

#### Scenario: Operação normal

- **WHEN** o cluster está saudável
- **THEN** o nó PRIMÁRIO SHALL aceitar leituras e escritas, e o nó STANDBY SHALL recusar escritas

#### Scenario: Backend nunca escreve em standby

- **WHEN** o backend avalia um nó candidato
- **THEN** SHALL descartar qualquer nó que responda `true` para `SELECT pg_is_in_recovery()` — garantido pela capability `db-multi-host-connection`, já implementada

### Requirement: Cópia inicial do banco no standby

O nó STANDBY SHALL ser inicializado a partir de uma cópia física consistente do PRIMÁRIO, preservando os slots de replicação e a configuração necessária para o streaming.

#### Scenario: Bootstrap da réplica

- **WHEN** o STANDBY é provisionado pela primeira vez
- **THEN** SHALL receber os dados via `pg_basebackup` a partir do PRIMÁRIO, e não via restauração de dump SQL

### Requirement: Streaming replication ativa

Após o bootstrap, o STANDBY SHALL acompanhar o PRIMÁRIO continuamente via streaming de WAL.

#### Scenario: Escrita propagada

- **WHEN** uma transação é confirmada no PRIMÁRIO
- **THEN** SHALL ser propagada ao STANDBY sem intervenção manual

#### Scenario: Standby indisponível temporariamente

- **WHEN** o STANDBY fica fora do ar e retorna
- **THEN** SHALL retomar o streaming a partir do ponto em que parou, sem exigir novo `pg_basebackup`, desde que o WAL retido no PRIMÁRIO cubra o intervalo

### Requirement: Usuário dedicado de replicação

A replicação SHALL usar um usuário PostgreSQL dedicado, com atributo `REPLICATION`, distinto do usuário da aplicação, autenticado com `scram-sha-256`.

#### Scenario: Credencial separada da aplicação

- **WHEN** o STANDBY se conecta ao PRIMÁRIO para replicar
- **THEN** SHALL usar o usuário de replicação, nunca o usuário `prestek` da aplicação

## Open Questions

- Qual a versão e a forma de instalação do PostgreSQL no Antonio?
- Onde fica o nó STANDBY? O Felix não comporta um segundo PostgreSQL no estado atual (287 Mi de RAM livre, sem swap, OOM killer ativo).
- Como o `pg_hba.conf` e o `postgresql.conf` serão gerenciados se algum dos nós for um container — via imagem custom, config do Swarm ou bind mount?
