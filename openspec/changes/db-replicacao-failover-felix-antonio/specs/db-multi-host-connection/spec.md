## Purpose

Define como o backend Node.js se conecta ao banco de dados com suporte a múltiplos hosts, de modo que a aplicação continue funcionando automaticamente quando o PRIMARY muda por failover.

## ADDED Requirements

### Requirement: Seleção de host entre múltiplos candidatos

O módulo `db.js` SHALL manter uma lista ordenada de hosts candidatos — Felix primeiro (PRIMARY), Antonio como fallback — e conectar no primeiro que estiver aceitando escrita.

#### Scenario: Conexão bem-sucedida ao PRIMARY

- **WHEN** Felix está online e aceitando conexões
- **THEN** o pool de conexões SHALL conectar em Felix (65.21.149.72:5432)

#### Scenario: Fallback automático para Antonio

- **WHEN** Felix está inacessível e Antonio está operando como PRIMARY
- **THEN** o pool SHALL conectar automaticamente em Antonio (201.150.48.6:5432) sem reinicialização do servidor Node.js

#### Scenario: Somente host de leitura-escrita é usado

- **WHEN** um host candidato responde `true` para `SELECT pg_is_in_recovery()` (ou seja, é um STANDBY somente-leitura)
- **THEN** `db.js` SHALL descartar esse host e tentar o próximo da lista, nunca adotando um STANDBY como pool ativo

### Requirement: Timeout de conexão configurável

O pool SHALL usar um timeout de conexão de no máximo 10 segundos por host antes de tentar o próximo host da lista.

#### Scenario: Host primário lento mas disponível

- **WHEN** Felix demora mais de 10 segundos para responder
- **THEN** o pool SHALL considerar Felix indisponível e tentar Antonio

#### Scenario: Ambos os hosts indisponíveis

- **WHEN** nem Felix nem Antonio estão acessíveis
- **THEN** o servidor Node.js SHALL iniciar sem conexão com banco e logar erro claro, sem travar (comportamento já existente mantido)

### Requirement: Variáveis de ambiente para múltiplos hosts

O `.env` SHALL fornecer as variáveis `DB_PRIMARY_HOST` e `DB_REPLICA_HOST` separadamente, permitindo configuração independente de cada nó. O ambiente `LOCAL` SHALL usar apenas `DB_HOST=127.0.0.1` sem fallback.

#### Scenario: Ambiente de produção

- **WHEN** `DB_PRIMARY_HOST` e `DB_REPLICA_HOST` estão definidos
- **THEN** `db.js` SHALL montar a lista de hosts candidatos automaticamente, nessa ordem

#### Scenario: Ambiente de desenvolvimento local

- **WHEN** apenas `DB_HOST` está definido (sem `DB_PRIMARY_HOST`)
- **THEN** `db.js` SHALL usar conexão single-host com `DB_HOST`
