## Purpose

Define o contrato de mudança do módulo de conexão com banco de dados: de single-host estático para multi-host com fallback automático.

## MODIFIED Requirements

### Requirement: Conexão com banco de dados

O módulo `db.js` SHALL criar um Pool de conexões PostgreSQL configurado via variáveis de ambiente. O comportamento SHALL ser:

- Se `DB_PRIMARY_HOST` estiver definido: percorrer `[DB_PRIMARY_HOST, DB_REPLICA_HOST]` com timeout de conexão de 10 segundos por host, adotando o primeiro nó que responder `false` para `pg_is_in_recovery()`
- Se apenas `DB_HOST` estiver definido: usar conexão single-host (compatibilidade com ambiente LOCAL e legado Replit via `DATABASE_URL`)
- Em ambos os casos: tentar conectar ao iniciar e logar sucesso ou erro sem interromper a inicialização do servidor

#### Scenario: Inicialização com PRIMARY disponível

- **WHEN** o servidor Node.js é iniciado com `DB_PRIMARY_HOST` definido e Felix acessível
- **THEN** o pool SHALL conectar em Felix e logar `"Conectado ao banco PostgreSQL com sucesso."`

#### Scenario: Inicialização com PRIMARY indisponível e REPLICA disponível

- **WHEN** o servidor é iniciado com `DB_PRIMARY_HOST` definido e Felix inacessível, mas Antonio disponível como PRIMARY
- **THEN** o pool SHALL conectar em Antonio automaticamente e logar sucesso

#### Scenario: Inicialização sem nenhum host disponível

- **WHEN** nenhum dos hosts definidos está acessível
- **THEN** o servidor SHALL iniciar e logar erro de conexão, sem encerrar o processo (comportamento atual mantido)

#### Scenario: Ambiente LOCAL (single-host)

- **WHEN** apenas `DB_HOST=127.0.0.1` está definido
- **THEN** o pool SHALL conectar somente em `127.0.0.1:5432`, sem tentar hosts remotos
