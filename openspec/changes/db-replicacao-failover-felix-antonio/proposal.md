## Why

O sistema Prestek Intranet depende de um único servidor PostgreSQL — Antonio (201.150.48.6) — para todas as operações de banco. Quando esse servidor fica inacessível, o backend sobe sem conexão e todas as funcionalidades param. É um ponto único de falha, e ele está falhando: na data desta revisão o Antonio está inalcançável (timeout na porta 5432) e o desenvolvimento roda contra um banco local.

O objetivo continua sendo eliminar esse ponto único de falha. O caminho para chegar lá, porém, foi redefinido depois que o levantamento no Felix mostrou que as premissas originais desta proposta estavam erradas.

## Estado verificado da infraestrutura

O levantamento por SSH no Felix (65.21.149.72) em 2026-08-06 apurou:

| Fato | Verificação |
|---|---|
| Felix **não** tem PostgreSQL bare-metal | `dpkg -l \| grep -c postgres` → `0`; nenhuma unit systemd de postgres |
| Felix roda `postgres:14.22` **em container Docker Swarm** | stack `postgres`, volume `postgres_data` (4,1 GB) |
| Esse Postgres **não publica porta** | `Endpoint.Ports` → `null`; só existe na rede overlay interna. É o motivo do `ECONNREFUSED` em `65.21.149.72:5432` |
| O banco `prestek_db_postgres` **não existe no Felix** | bancos presentes: `postgres`, `evolution`, `n8n_queue`, `typebot`, `metabase` — todos de outras aplicações |
| `repmgr` **ausente** da imagem | `which repmgr` → não encontrado; não instalável via apt do host |
| Felix está **saturado de memória** | 7,3 Gi usados de 7,6 Gi, 287 Mi livres, swap `0B`; 8 stacks parados, quatro com `Exited (137)` (OOM killer) |
| Felix hospeda serviço crítico não relacionado | mailcow (servidor de e-mail) em produção, no ar há 7 meses |

O banco de produção da intranet sempre viveu no Antonio — confirmado por `.replit` (`[userenv.shared] DB_HOST = "201.150.48.6"`) e por `backend/.env copy.example`. O Felix nunca hospedou a intranet; seu PostgreSQL é infraestrutura compartilhada de n8n, Typebot, Metabase e Evolution API.

**Consequência:** a proposta original — "Felix vira PRIMARY, Antonio vira STANDBY, ambos com repmgr instalado via apt e repmgrd sob systemd" — não descreve nenhum dos dois servidores. Ela foi redigida sem acesso às máquinas.

## What Changes

### Já implementado e validado

- **Backend (`db.js`)**: percorre uma lista ordenada de hosts e adota o primeiro que aceita escrita, verificando com `pg_is_in_recovery()`. Timeout de 10 s por host. Um handler `pool.on('error')` invalida o pool quando o nó cai, permitindo migrar para o host seguinte sem reiniciar o Node.
- **Variáveis de ambiente (`.env`)**: perfis LOCAL e PRODUÇÃO demarcados e documentados em português, com `DB_PRIMARY_HOST` / `DB_REPLICA_HOST`.

Essa camada é **agnóstica à topologia**: funciona com qualquer par de hosts PostgreSQL, independentemente de serem bare-metal, container ou serviço gerenciado. Ela permanece válida e não precisa mudar conforme a decisão de infraestrutura.

### Pendente de decisão

A estratégia de alta disponibilidade do banco está **em aberto**. Ela depende de dados do Antonio, hoje inacessível, e de uma decisão sobre onde o segundo nó vai morar — já que o Felix, como está, não comporta a carga.

## Capabilities

### New Capabilities

- `db-multi-host-connection`: lógica em `db.js` que percorre os hosts candidatos e adota o primeiro que aceita escrita — **implementado**
- `db-env-profile`: reorganização do `.env` com perfis LOCAL / PRODUÇÃO documentados — **implementado**
- `db-replication-setup`: replicação entre o nó primário e um standby — **bloqueado**, aguarda levantamento do Antonio e decisão de topologia
- `db-failover-auto`: promoção automática do standby quando o primário cai — **bloqueado**, mesma dependência

### Modified Capabilities

- `db-connection`: o módulo `db.js` conectava em um único host estático. Passa a suportar múltiplos hosts com seleção do nó gravável — **implementado**

## Impact

- **`backend/db.js`**: reescrito com seleção de host e failover — concluído
- **`backend/.env`**: reestruturado em perfis — concluído
- **`backend/server.js`**: sem alterações; consome o pool via `db.js`
- **Sem breaking changes para o frontend** — a API não muda
- **Servidores**: nenhuma alteração executada. O levantamento no Felix foi somente leitura.

## Riscos conhecidos fora do escopo desta change

Registrados aqui porque foram descobertos durante o levantamento e afetam a decisão de topologia, mas merecem tratamento próprio:

- **Saturação de memória no Felix**: 287 Mi livres sem swap, com stacks já sendo mortos pelo OOM killer. Colocar um segundo PostgreSQL nesse host agravaria uma falha em curso.
- **PostgreSQL 14** no Felix atinge fim de vida em novembro de 2026.
- **Credencial de root do Felix** foi transmitida por canal de chat e convém ser rotacionada.
