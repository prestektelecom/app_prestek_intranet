# Prestek Intranet — Pendências consolidadas (go-live)

Levantamento de 2026-10-03: `MEMORIA.md`, `openspec/changes/`, git, migrations e TODOs no código.
**Este é o único lugar para acompanhar o que falta.** Marque `- [x]` ao concluir.
Lacunas de verificação estão marcadas como _(não verificado)_.

---

## 1. Antes de subir (bloqueantes)

### Segurança e credenciais
- [ ] **Rotacionar `IXC_TOKEN_SECRET` do usuário IXC 222** (conta do Felix). Você adiou para "quando for para produção": é agora. O valor real chegou a ser versionado em `backend/.env copy.example` (já sanitizado) e segue no histórico do git. Onde: IXC → configurações de API/token do usuário 222. Atualizar `backend/.env` da produção.
- [ ] **Identificar/revogar o usuário IXC 72**, cujo token estava hardcoded em `backend/debug_clients.js` (removido do código em 2026-09-17, mas ainda no histórico).
- [ ] **PostgreSQL do Antonio exposto à internet:** `pg_hba.conf` com `host all all 0.0.0.0/0 md5` e porta 5432 aberta ao mundo, versão EOL (change `db-replicacao-failover-felix-antonio`, tarefa 6.1). Restringir aos IPs necessários.
- [ ] **Rotacionar senhas que passaram por chat** (root do Felix e `antonio` do Antonio) e trocar senha por chave SSH nos dois servidores (6.2, 6.3).
- [ ] **Conferir o `.env` de produção:** `JWT_SECRET` forte e próprio; `CORS_ORIGENS` com o domínio real (o padrão é `http://localhost:5000`, que bloquearia o site); `VITE_API_URL` apontando para a API de produção no build. _(Inferido das decisões de 2026-09-11; não verificado no servidor.)_
- [ ] **Decidir sobre limpar o histórico do git** (`git filter-repo` + force-push). Só vale depois de rotacionar os tokens; é higiene, não urgência.

### Deploy / banco
- [ ] **NÃO rodar `migrations/run.js` inteiro em produção.** Ele reexecuta todos os `.sql` e engole erros. Aplicar só o que falta, via `pg`/`psql -f`. Já aplicadas: 022, 023 e 024. Conferir com `SELECT column_name FROM information_schema.columns WHERE table_name='processos' AND column_name LIKE 'ixc_%'` (esperado: 5 colunas).
- [ ] **Passos no servidor** (`/root/prestek_intranet`): `git pull`, `npm install` (entrou `@maplibre/maplibre-gl-leaflet`), `npx vite build`, reiniciar o backend. Confirmar que o backend na `3001` roda com a correção do `GROUP BY` de `backend/middleware/permissoes.js` (a versão antiga derrubava toda rota de gestão com 503).
- [ ] **Checar duplicatas em `cobertura_cidades`:** `SELECT cidade, bairro, COUNT(*) FROM cobertura_cidades GROUP BY 1,2 HAVING COUNT(*)>1`. Limpar só com sua aprovação.
- [x] ~~Ler `013` e `020`~~ — 2026-10-03: a 020 já era idempotente; a 013 só falhava no `ADD CONSTRAINT` (erro falso, sem dano) e ganhou guarda `DO $$ ... IF NOT EXISTS`. Ainda não rodada no banco (alteração só no arquivo). Com isso o runner novo deixa de ser obrigatório, fica opcional.
- [ ] **Runner de migrations com tabela de controle** (`schema_migrations`, nunca reexecuta, falha alto). Change própria, decisão sua.

### Limpeza de dados de teste em produção
- [ ] **Fechar/cancelar o chamado de teste no IXC:** ticket 808643 / OS 1914184 (criado em 2026-09-19 para testar a segurança do `su-ticket`; deixado aberto de propósito).
- [ ] Linhas de teste em Auditoria (4 de permissões em 2026-09-30, 5 de setores em 2026-10-01): decidir se ficam como histórico.
- [ ] Os 5 ajustes reais em `setores_membros_manuais` (4 exclusões no setor 29, 1 inclusão no 66) são seus, não tocar.

---

## 2. Changes do OpenSpec em aberto

| Change | Situação | O que falta |
|---|---|---|
| ~~`setores-membros-manuais`~~ | 38/38 | **Arquivada em 2026-10-03** (`archive/2026-10-03-setores-membros-manuais`; 1 spec nova e 1 requisito somado a cada uma de `department-chip-filter` e `setores-diretorio`). Pendente só o visual nos temas claro, Cyber, Aurora e Default Dark. |
| `migrar-accent-laranja-marca` | 25/29 | Verificada no navegador em 2026-10-03 (API simulada): 4.3, 4.4, 4.5, 4.9. Faltam: 4.6 (só o NotFound), 4.7 (ThemeSwitcher: amostras contra o que cada tema mostra), 4.8 (`warning` amarelo contra laranja em Cobertura/badges, precisa de dados reais) e 4.10 (telas densas com dados reais: Plantão, Cobertura, Processos, Escritórios, Rankings). |
| `melhorar-card-aniversariantes` | 29/35 | 7.1 feita em 2026-10-03 (hook `useDeptoMap`; diagnóstico fechado por evidência em `design.md`, sem consulta ao IXC). Verificação visual feita em 2026-10-03 (4.5 e 5.3); falta só a 5.1 (comparar lado a lado com o `TeamBento`, a olho) e 6.1–6.4 (não serão executadas ao vivo) e 8.1 feita (rota de debug removida). |
| `db-replicacao-failover-felix-antonio` | 10/25 | Bloqueada: onde fica o nó standby, mecanismo de replicação, failover automático ou manual, execução em servidor, teste de failover (3.x–5.x). Tarefas 6.x (segurança) estão na seção 1; 6.4–6.6 tratam EOL do Postgres 11/Debian 10 do Antonio, Postgres 14 do Felix (EOL nov/2026) e a saturação de memória do Felix (sem swap, OOM killer ativo; merece change própria). |
| ~~8 changes de Dashboard/Serviços/Chamados + `teste-cli-openspec` + `instalar-impeccable`~~ | **Resolvido em 2026-10-03** | Arquivadas em `archive/2026-10-03-*` (3 obsoletas/parciais sem spec nova); 2 pastas inúteis apagadas; 4 specs novas escritas com o estado real (laranja, sem comparador): `hover-border-effect`, `atalhos-rapidos-button-layout`, `gradient-service-cards`, `ticket-message-parser`. |

Obs.: o `openspec archive` costuma dar EPERM no rename da pasta neste ambiente. O procedimento usual é sincronizar as specs à mão e mover a pasta por cópia+remoção.

---

## 3. Features e changes ainda a propor

- [ ] **`gestao-no-shell`:** tirar o Painel Admin do overlay e levá-lo para o shell (view "Gestão" com abas por permissão e URL por aba; corta "Visão Geral"). Hoje um não-admin com permissões só alcança a API, não a tela. A barra inferior mobile do Painel Admin está com 6 abas (limite de boa prática: 5).
- [ ] **`visibilidade-por-departamento`:** decisões já tomadas (só esconde menu, "Sem restrição" ou "Restrito" por departamento, piso Início e Configurações). Leva o Painel Admin a 7 abas no mobile.
- [ ] **Canal de denúncia anônimo (standby):** exige verificar o log de acesso do nginx e o servidor de e-mail em produção, cifrar no navegador com chave pública do RH e conversar com RH/jurídico. Detalhes em `MEMORIA.md` → Pendências.
- [ ] **Z-index:** retomar a tag `archive/z-index-migration` (`git checkout -b z-index archive/z-index-migration`). Conflita em `Comunicados.jsx`, `Configuracoes.jsx` e `OrgChartEditor.jsx`; exige `/impeccable audit`.
- [ ] **Chamados:** linhas da tabela sem detalhe por chamado (feature nova).
- [ ] **Backend:** `/api/comunicados` sem paginação nem cache.
- Já decididos como **não fazer agora** (reabrir só se quiser): Redis de verdade, testes automatizados, refatorar os 3 "god files" de 1200+ linhas, atualização de preferências obsoletas em Configurações.

---

## 4. Qualidade de interface (Impeccable) ainda aberta

Regra do projeto: mudança de UI passa por `/impeccable audit` antes de fechar.

- [ ] Login: testes E2E da Fase 5 do plano. (Em 2026-10-03 o Login foi visto no navegador em Aurora e carrega nos 5 temas; as melhorias de 09-29 seguem sem checagem detalhada.)
- [x] ~~`C.danger` como texto de erro~~ — 2026-10-03: 8 textos trocados por `dangerStrong` em `AdminUsuarios`, `AdminAuditoria` e `AdminComunicados` (claro: 3,45:1 → 6,00:1). Build limpo, detector sem aviso novo. Visto no navegador em 2026-10-03 (API simulada, 5 temas): texto de erro 6,0 a 8,7:1 e banners de AdminUsuarios e AdminComunicados agora com `role="alert"`.
- [ ] Barra inferior do Painel Admin com rótulos colados a 360px ("Responsáveis"/"Comunicados").
- [ ] `HistoricoPreviewModal` com superfície branca fixa em qualquer tema (P3).
- [x] ~~Sidebar: rótulo do grupo e altura do `NavRow`~~ — 2026-10-03: `GroupLabel` colapsado mantém o nome em `sr-only`; `NavRow` com `minHeight: 44`. Build limpo, detector 0. **Visto no navegador em 2026-10-03** (5 temas): 13 itens de 44px, grupos anunciados quando colapsada, texto da Sidebar >= 4,88:1. A barra rola se faltar altura; conferir em notebook de tela baixa.
- [ ] `index.css`: raios e tamanhos de fonte soltos; detector aponta ~190 avisos de deriva do `DESIGN.md` (boa parte é o padrão compartilhado 10px/17px do `HeroShell`).
- [ ] Specs `dark-mode-bento-foundation`, `bento-blue-global-tokens` e outras 4 `bento-blue-*`/`dark-mode-bento-*` ainda descrevem a paleta "Bento Blue" abandonada. Em 2026-10-03 todas ganharam `## Purpose` (a validação estrita passou de 65 para 83 de 83) com uma nota de que são registro histórico; reescrever o conteúdo continua pendente (baixa prioridade, não afeta o deploy).
- [ ] Verificar no navegador com sessão **não-admin** o `ProcessoViewModal` (só validado por leitura de código).
- [ ] Conferir em Configurações o tema que você usa (o teste de 2026-09-20 mexeu e restaurou só "dark/padrão").

---

## 5. Decisões que dependem de você (fora do código)

- [ ] **Desativar no IXC o setor duplicado "RECURSOS HUMANOS" (id 35, 0 membros).** O id 67 é o ativo.
- [ ] **Confirmar que a operação foi avisada** do salto da Central de Cobertura (2.075 → 21.538 contratos; 198 → 319 regiões). A nota está marcada como feita, mas o texto diz "falta só o aviso".
- [x] ~~Autorizar o teste 8.4 de `setores-membros-manuais`~~ — feito em 2026-10-03.

---

## 6. Faxina do repositório

Feita em 2026-10-03 (commit `896db9c`): removidos capturas, `help.txt`, `read-pdf.*`, `get_schema.js`, `playwright-test.mjs`, `replit.md`, `IDEIA.md`, `attached_assets/`, `test-results/` e o `.rar` duplicado; 34 scripts de diagnóstico movidos para `backend/_diagnostico/`.
- [ ] Ainda versionados por serem ferramentas ou citados: `playwright-login.mjs`, `.gemini/` e `.agent/` (skills do Impeccable), `GEMINI.md`, `SKILL.md`. Confirmar se algum deve sair do servidor de produção.
- [ ] `docs/Ficha Registro de Empregado TESTE .pdf`: conferir se há dado pessoal real.
- [ ] Branch remota `origin/configuracao_adm`: **0 commits à frente da `main`** (verificado em 2026-10-03), pode ser apagada com `git push origin --delete configuracao_adm`; aguarda seu OK.
- [x] ~~`git push` da `main`~~ — feito em 2026-10-03 (`c475adb..7a84a48`, 9 commits, avanço simples).
- [x] ~~Enxugar o `MEMORIA.md`~~ — feito em 2026-10-03: 208 KB (~53 mil tokens por sessão) para 11 KB; o resto foi movido sem alteração para `MEMORIA-historico.md`, que o `CLAUDE.md` não importa.
