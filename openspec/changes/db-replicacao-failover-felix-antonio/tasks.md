## 1. Backend — Suporte a Multi-Host (CONCLUÍDO)

- [x] 1.1 Alterar `backend/db.js` para detectar `DB_PRIMARY_HOST` e selecionar o primeiro host que aceita escrita (timeout de 10s por host, checagem via `pg_is_in_recovery()`)
- [x] 1.2 Manter compatibilidade com `DB_HOST` (single-host) para ambiente LOCAL e legado `DATABASE_URL` (Replit)
- [x] 1.3 Reorganizar `backend/.env` com perfis LOCAL e PRODUÇÃO claramente demarcados, incluindo variáveis `DB_PRIMARY_HOST`, `DB_REPLICA_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [x] 1.4 Adicionar comentários em português no `.env` explicando como alternar entre perfis
- [x] 1.5 Testar que o backend sobe normalmente no perfil LOCAL (127.0.0.1) sem erros
- [x] 1.6 Testar que o log mostra "Conectado ao banco PostgreSQL com sucesso." ao usar perfil LOCAL
- [x] 1.7 Testar o caminho de fallback: com um PRIMARY inalcançável, o pool descarta o host após o timeout e adota o REPLICA

## 2. Levantamento de infraestrutura

- [x] 2.1 Levantar a configuração real do Felix (65.21.149.72): versão do PostgreSQL, forma de instalação, portas publicadas, bancos existentes, disco, RAM
- [x] 2.2 Levantar a configuração real do Antonio (201.150.48.6): versão do PostgreSQL, forma de instalação (bare-metal ou container), disco livre, RAM, `postgresql.conf` e `pg_hba.conf` atuais
- [x] 2.3 Confirmar o tamanho atual de `prestek_db_postgres` para dimensionar o disco necessário no standby

**Resultado de 2.1** — o Felix não é o que a proposta original assumia:

| Achado | Evidência |
|---|---|
| Sem PostgreSQL bare-metal | `dpkg -l \| grep -c postgres` → `0`; nenhuma unit systemd |
| PostgreSQL é container Swarm | `postgres:14.22`, stack `postgres`, volume `postgres_data` (4,1 GB) |
| Sem porta publicada | `Endpoint.Ports` → `null`; só na rede overlay interna |
| Não hospeda o banco da intranet | bancos: `postgres`, `evolution`, `n8n_queue`, `typebot`, `metabase` |
| `repmgr` ausente | `which repmgr` → não encontrado |
| Memória saturada | 7,3 Gi/7,6 Gi usados, 287 Mi livres, swap `0B`, 4 stacks com `Exited (137)` (OOM) |
| Hospeda serviço crítico | mailcow em produção há 7 meses |

**Resultado de 2.2 e 2.3** — Antonio (hostname `ftp`), levantado por SSH em 2026-08-06:

| Achado | Evidência |
|---|---|
| PostgreSQL **11.22 bare-metal** | `postgresql-11 11.22-0+deb10u2`; cluster `11/main` online na 5432, data dir `/var/lib/postgresql/11/main` |
| **Debian 10 (buster)** | `PRETTY_NAME="Debian GNU/Linux 10 (buster)"`, OpenSSH 7.9p1 |
| Sem Docker | `docker: comando não encontrado` |
| Banco da intranet é **pequeno** | `prestek_db_postgres` = **9245 kB**, 19 tabelas; data dir inteiro = 65 MB |
| Recursos folgados | 11 Gi RAM (218 Mi em uso), 8 vCPU, 974 Mi de swap |
| Disco | 2,0 T total, 334 G livres (83% usado) |
| Já preparado para replicar | `wal_level=replica`, `max_wal_senders=10`, `max_replication_slots=10`, `hot_standby=on` |
| Faltam ajustes | `wal_keep_segments=0`, `archive_mode=off` |
| Nenhuma réplica ativa | `select count(*) from pg_stat_replication` → `0` |
| `repmgr` ausente | `which repmgr` → AUSENTE |
| Usuários | `postgres` (superuser, replication), `prestek` (comum, sem replication) |
| **Exposto à internet** | `listen_addresses='*'`, escutando `0.0.0.0:5432`, e `pg_hba.conf` com `host all all 0.0.0.0/0 md5` |

**Consequência para a topologia:** Antonio roda PostgreSQL **11**, Felix roda **14**. Streaming replication exige versão *major* idêntica nos dois nós — os servidores atuais são incompatíveis entre si como estão.

## 3. Decisão de topologia

- [ ] 3.1 **BLOQUEADO por 2.2.** Decidir onde fica o nó STANDBY — o Felix não comporta um segundo PostgreSQL no estado atual
- [ ] 3.2 **BLOQUEADO por 3.1.** Decidir o mecanismo de replicação compatível com a forma de hospedagem dos dois nós
- [ ] 3.3 **BLOQUEADO por 3.1.** Decidir entre failover automático e promoção manual documentada (2 nós não fornecem quórum para promoção automática segura)
- [ ] 3.4 **BLOQUEADO por 3.1–3.3.** Fechar D3 no `design.md` e reescrever as specs `db-replication-setup` e `db-failover-auto` com a topologia definida

## 4. Implementação da replicação

- [ ] 4.1 **BLOQUEADO por 3.4.** As tarefas de execução em servidor só podem ser escritas depois que a topologia estiver decidida. Escrevê-las agora repetiria o erro da versão anterior desta change, que prescrevia `apt install repmgr` e `systemctl enable repmgrd` para servidores onde nada disso se aplica.

## 5. Ativação em produção

- [ ] 5.1 **BLOQUEADO por 4.1.** Preencher `DB_PRIMARY_HOST` e `DB_REPLICA_HOST` no perfil PRODUÇÃO do `.env` com os endereços definitivos
- [ ] 5.2 **BLOQUEADO por 5.1.** Comentar o perfil LOCAL e reiniciar o backend
- [ ] 5.3 **BLOQUEADO por 5.2.** Confirmar no log a conexão com o nó primário
- [ ] 5.4 **BLOQUEADO por 5.3.** Testar failover de ponta a ponta: derrubar o primário e confirmar que o backend migra para o standby promovido sem reinício

## 6. Itens de segurança e higiene (fora do escopo, registrados aqui)

- [ ] 6.1 **Fechar a exposição do PostgreSQL do Antonio à internet** — `pg_hba.conf` tem `host all all 0.0.0.0/0 md5` e a 5432 está aberta ao mundo, numa versão EOL há quase 3 anos. Restringir aos IPs que realmente precisam
- [ ] 6.2 Rotacionar as senhas que trafegaram por canal de chat: root do Felix e `antonio` do Antonio
- [ ] 6.3 Substituir autenticação por senha por chave SSH nos dois servidores
- [ ] 6.4 Planejar upgrade do Antonio: PostgreSQL 11 (EOL nov/2023) e Debian 10 (EOL jun/2024) — pré-requisito recomendado da HA, ver D3
- [ ] 6.5 Tratar a saturação de memória do Felix (swap ausente, OOM killer ativo derrubando stacks) — merece change própria
- [ ] 6.6 Avaliar o upgrade do PostgreSQL 14 do Felix, que atinge EOL em novembro de 2026
