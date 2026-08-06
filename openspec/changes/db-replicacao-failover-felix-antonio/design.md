## Context

O backend usa `node-postgres` (`pg` 8.20.0) com um `Pool` criado em `backend/db.js`. O banco de produção da intranet é `prestek_db_postgres` e vive no **Antonio (201.150.48.6)** — confirmado por `.replit` e `backend/.env copy.example`.

### Antonio (201.150.48.6) — nó de produção, levantado por SSH em 2026-08-06

Hostname `ftp`. **Debian 10 (buster)**, OpenSSH 7.9p1. 8 vCPU, 11 GB RAM (218 Mi em uso), 974 Mi de swap, disco de 2,0 T com 334 G livres. Sem Docker.

**PostgreSQL 11.22 bare-metal** (`postgresql-11`, Debian), cluster `11/main` online na porta 5432, data dir `/var/lib/postgresql/11/main` (65 MB no total).

O banco da intranet é **pequeno**: `prestek_db_postgres` ocupa **9,2 MB** em 19 tabelas. Isso muda o enquadramento do problema — não é um desafio de capacidade, é de disponibilidade e de software vencido.

O cluster já está parcialmente preparado para replicar: `wal_level=replica`, `max_wal_senders=10`, `max_replication_slots=10`, `hot_standby=on`. Faltam `wal_keep_segments` (hoje `0`) e `archive_mode` (hoje `off`). Nenhuma réplica ativa (`pg_stat_replication` vazio). `repmgr` ausente. Usuários com login: `postgres` (superuser, com atributo de replicação) e `prestek` (comum).

**Exposição de rede:** `listen_addresses='*'`, escutando em `0.0.0.0:5432`, e o `pg_hba.conf` contém `host all all 0.0.0.0/0 md5` — qualquer endereço da internet pode tentar autenticar em qualquer banco. Combinado com PostgreSQL 11 (fim de vida em novembro de 2023) e Debian 10 (fim do LTS em junho de 2024), o servidor acumula quase três anos sem correções de segurança num serviço aberto ao mundo.

### Felix (65.21.149.72) — levantado por SSH em 2026-08-06

Ubuntu 24.04.3, 4 vCPU, 7,6 GB RAM, 31 GB de disco livre, sem swap. Host **Docker Swarm** (manager, leader) com 13 stacks, incluindo **mailcow em produção há 7 meses**.

O PostgreSQL do Felix é o container `postgres:14.22` (stack `postgres`, volume `postgres_data`, 4,1 GB). Não publica portas — `Endpoint.Ports` é `null`, ele só existe na rede overlay `4jgxtjan2x32dnmh8uqly5r7y`. Serve `evolution`, `n8n_queue`, `typebot` e `metabase`. **Não contém o banco da intranet.**

Memória: 7,3 Gi de 7,6 Gi em uso, 287 Mi disponíveis, swap zero. Oito stacks estão parados; quatro saíram com `Exited (137)` — SIGKILL do OOM killer.

## Goals / Non-Goals

**Goals:**
- Eliminar o ponto único de falha do banco da intranet
- Manter o backend capaz de migrar entre nós sem reinício — **concluído**
- Definir uma topologia de HA compatível com a infraestrutura real

**Non-Goals:**
- Load balancing de leituras entre primário e standby
- Replicação lógica
- Alta disponibilidade do servidor Node.js em si
- Dashboard de monitoramento de replicação
- Resolver a saturação de memória do Felix (problema real, mas de escopo próprio)

## Decisions

### D1 — Failover de host na camada da aplicação (`db.js`) — DECIDIDO E IMPLEMENTADO

**Escolha:** lógica de fallback em JavaScript no próprio `db.js`, percorrendo `[DB_PRIMARY_HOST, DB_REPLICA_HOST]` e adotando o primeiro nó que aceita escrita.

**Rationale:**
- O pacote `pg` instalado (8.20.0) é a implementação **JavaScript pura** — ele **não** usa libpq. Só o pacote opcional `pg-native` faz isso, e ele não está instalado.
- Verificado no `node_modules`: `pg` e `pg-connection-string` não contêm nenhuma referência a `target_session_attrs` (o parâmetro é silenciosamente ignorado) e não fazem split de hosts por vírgula — `host: "a:5432,b:5432"` seria tratado como hostname literal e falharia na resolução DNS.
- Portanto a connection string multi-host do libpq **não funciona** neste projeto sem adicionar `pg-native`, que exige toolchain de compilação nativa em todas as máquinas.

**Mecanismo:** para cada host, cria um `Pool` com `connectionTimeoutMillis: 10000` e executa `SELECT pg_is_in_recovery()`. Resultado `false` → é primário, o pool é adotado. Resultado `true` (standby somente-leitura) ou falha de conexão → o pool é encerrado e o próximo host é tentado. Replica a semântica de `target_session_attrs=read-write`.

**Reconexão pós-failover:** um handler `pool.on('error')` zera o pool ativo quando o nó cai. Sem ele o `pg` emitiria um erro não-tratado que derrubaria o processo Node inteiro; com ele, a próxima query dispara nova seleção de host.

**Por que sobrevive à mudança de topologia:** esta decisão é agnóstica a como o PostgreSQL é hospedado. Vale para bare-metal, container ou serviço gerenciado.

**Alternativas descartadas:** `pg-native` + connection string libpq (adiciona compilação nativa em todas as máquinas); HAProxy na frente dos bancos (ponto de falha adicional para 2 nós).

---

### D2 — repmgr sob Docker Swarm — DESCARTADO

A proposta original previa `repmgr` + `repmgrd` instalados via apt e gerenciados por systemd. Isso não é aplicável ao Felix, e provavelmente nem ao Antonio, por três motivos independentes:

1. **Não há PostgreSQL bare-metal no Felix.** Nada para o apt configurar; `repmgr` está ausente da imagem `postgres:14` e exigiria construir e manter uma imagem custom.
2. **Conflito de responsabilidade.** O modelo do repmgr pressupõe que ele controla o ciclo de vida do PostgreSQL (`systemctl stop/start`, promote, follow) e tem SSH entre os nós. Sob Docker Swarm quem reagenda o container é o orquestrador. Os dois disputariam o mesmo papel — isso não é ajuste de configuração, é incompatibilidade arquitetural.
3. **`repmgr standby clone` e `standby switchover` exigem SSH nó-a-nó**, o que sob containers efêmeros com IPs de overlay é frágil.

---

### D3 — Topologia de alta disponibilidade — EM ABERTO, com recomendação

Com os dois nós levantados, o quadro é este:

| | Antonio (`ftp`) | Felix (`Server`) |
|---|---|---|
| SO | Debian 10 — EOL jun/2024 | Ubuntu 24.04.3 |
| PostgreSQL | **11.22** bare-metal — EOL nov/2023 | **14.22** em container Swarm |
| Hospeda a intranet | **Sim** (9,2 MB, 19 tabelas) | Não |
| RAM livre | 11 Gi de 11 Gi | **287 Mi de 7,6 Gi** |
| vCPU | 8 | 4 |
| Disco livre | 334 G | 31 G |
| Alcançável de fora | Sim (exposto a `0.0.0.0/0`) | Não (sem porta publicada) |

**Restrição dura descoberta:** streaming replication exige versão *major* idêntica nos dois nós. Antonio é 11, Felix é 14 — **os servidores atuais não podem replicar um para o outro como estão**. Qualquer topologia passa por unificar a versão.

**O que o tamanho do banco muda:** 9,2 MB em 19 tabelas. Um `pg_dump`/`restore` completo leva segundos, e a cópia inicial de uma réplica é trivial. Isso remove capacidade e janela de migração da lista de preocupações, e desloca o problema real para: **software vencido e exposto**.

**Recomendação:** tratar a modernização como pré-requisito da HA, não como tarefa posterior. Um cluster de alta disponibilidade construído sobre PostgreSQL 11 e Debian 10 replica também a superfície de ataque. Com 9,2 MB de dados, o custo de subir um par de nós já em versão suportada é baixo — bem menor que o de migrar um cluster replicado depois.

**Ainda em aberto — onde fica o segundo nó.** O Felix, como está, não é bom candidato: 287 Mi livres, sem swap, OOM killer já matando stacks, e hospedando mailcow em produção. O banco em si caberia folgadamente, mas o host não tem margem. As opções seguem sendo host novo, saneamento do Felix antes de usá-lo, ou serviço gerenciado — e essa é decisão de infraestrutura e orçamento, não de código.

Sobre o mecanismo de failover, uma vez unificada a versão:

| Opção | A favor | Contra |
|---|---|---|
| Streaming replication nativa, promoção manual | Simples, sem dependências; com 9,2 MB o RTO manual é curto | Exige intervenção humana |
| repmgr | Maduro para 2 nós | Descartado enquanto um nó for container Swarm — ver D2 |
| Patroni + etcd | Feito para ambientes orquestrados | Exige quórum: 2 nós não bastam, precisa de um terceiro |
| PostgreSQL gerenciado | HA vira responsabilidade do provedor; resolve EOL junto | Custo recorrente; dados saem da infra própria |

**Nota:** o `db.js` já entregue funciona com qualquer uma destas — a escolha não retroage sobre o código do backend.

---

### D4 — Replicação inicial via pg_basebackup — MANTIDO EM PRINCÍPIO

Continua sendo o método correto para bootstrap de uma réplica, independentemente da topologia escolhida. Os detalhes de execução dependem de D3.

## Risks / Trade-offs

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Antonio segue inacessível | Nem o levantamento nem a replicação avançam; produção continua com ponto único de falha | Tratar a recuperação do Antonio como prioridade anterior a esta change |
| Colocar o segundo nó no Felix | Agrava o OOM já em curso; risco ao mailcow em produção | Não usar o Felix sem antes resolver memória e swap |
| Split-brain em qualquer topologia com promoção automática | Escritas divergentes entre nós | A checagem `pg_is_in_recovery()` no `db.js` (D1) impede o backend de escrever num standby; promoção automática só entra depois de D3 |
| PostgreSQL 14 no Felix chega ao EOL em nov/2026 | Sem correções de segurança | Considerar upgrade se o Felix entrar na topologia final |
| Credencial de root do Felix trafegou por chat | Exposição de acesso privilegiado a host com e-mail em produção | Rotacionar a senha; preferir chave SSH |

## Migration Plan

### Fase 1 — Backend — CONCLUÍDA

1. `backend/db.js` reescrito com seleção de host e failover
2. `backend/.env` reorganizado em perfis LOCAL / PRODUÇÃO
3. Validado no perfil LOCAL e no caminho de fallback (primário inalcançável → adota o segundo host)

### Fase 2 — Levantamento do Antonio — BLOQUEADA

Aguarda o servidor voltar. Objetivo: apurar versão do PostgreSQL, forma de instalação, disco, RAM e configuração atual — os mesmos dados já levantados no Felix.

### Fase 3 — Decisão de topologia — BLOQUEADA POR FASE 2

Fechar D3 com os dados dos dois nós em mãos.

### Fase 4 — Implementação da replicação — BLOQUEADA POR FASE 3

Só então faz sentido escrever tarefas de execução em servidor.

### Rollback

- Fase 1: reverter `db.js` e `.env` ao estado anterior (single-host). Nenhuma alteração foi feita em servidor, então não há o que reverter em infraestrutura.

## Open Questions

Respondidas no levantamento de 2026-08-06: o Antonio voltou; roda PostgreSQL 11.22 bare-metal sobre Debian 10; o banco da intranet tem 9,2 MB.

Em aberto:

- **A modernização (PostgreSQL e SO) entra antes da HA?** É a recomendação em D3 — construir HA sobre software vencido replica a superfície de ataque junto com os dados.
- **Onde vai morar o segundo nó?** O Felix, como está, não comporta. Há orçamento para uma máquina nova, ou a opção é um serviço gerenciado?
- **Failover automático é mesmo requisito?** Com 9,2 MB e dois nós sem quórum, promoção manual documentada pode entregar RTO aceitável sem o risco de falso positivo.
- **A exposição do PostgreSQL do Antonio à internet será fechada?** `host all all 0.0.0.0/0 md5` numa versão EOL é risco corrente, independente desta change.
- **A saturação de memória do Felix será tratada?** Ela derruba serviços hoje, independentemente desta change.
