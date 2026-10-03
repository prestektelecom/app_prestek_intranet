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
| `migrar-accent-laranja-marca` | 21/29 | 8 verificações no navegador (4.3–4.10): 5 temas, hero de Serviços, Sidebar/`Logo_P`, Login/NotFound, ThemeSwitcher, `warning` vs laranja, Aurora e Cyber (maior risco), telas densas. |
| `melhorar-card-aniversariantes` | 26/35 | Verificação visual (4.5, 5.1, 5.3); diagnóstico com `/api/debug-funcionario/:id` em 3 colaboradores (6.1–6.4); possível ajuste em `/api/departamentos-empresa` (7.1); remover a rota de debug temporária `server.js:425-488` se sem propósito (8.1). **Rotas de debug (2026-10-03):** removidas `/api/debug/setor/:setorId` e `/api/debug/grupos-membros`; `/api/debug-funcionario/:id` ficou protegida por `adminAuth` até o diagnóstico 6.x. **Remover essa rota (8.1) antes de subir.** |
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

- [ ] Login: testes E2E da Fase 5 do plano; melhorias de 2026-09-29 sem verificação visual no navegador.
- [ ] `C.danger` como texto de erro em `AdminUsuarios.jsx` e no diálogo de admin (trocar por `dangerStrong`).
- [ ] Barra inferior do Painel Admin com rótulos colados a 360px ("Responsáveis"/"Comunicados").
- [ ] `HistoricoPreviewModal` com superfície branca fixa em qualquer tema (P3).
- [ ] Sidebar: `GroupLabel` perde o rótulo para leitor de tela quando colapsada; altura do `NavRow` (~38px) abaixo de 44px.
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

Arquivos versionados no git que não pertencem a um produto em produção:
- [ ] Capturas e lixo: `schedule-*.png` (4), `help.txt`, `read-pdf.js`, `read-pdf.py`, `attached_assets/*.png`, `.gemini/antigravity/brain/dashboard/uploads/*.png`.
- [ ] Na raiz, também: `get_schema.js`, `playwright-login.mjs`, `playwright-test.mjs`, `test-results/`, `GEMINI.md`, `replit.md`, `IDEIA.md`, `SKILL.md`, `wfl_data.json`, `tmp_*` (os `tmp_*` e `wfl_data.json` já estão no `.gitignore`). Confirmar um a um antes de mover ou apagar.
- [ ] `docs/` contém uma ficha de colaborador real (`Ficha Registro de Empregado TESTE .pdf`) e `querys_ixc_prestek.rar`. Conferir se há dado pessoal real e se devem ficar no repositório.
- [ ] Scripts de diagnóstico em `backend/` (`diagnostico_chinare*.js`, `debug_*`, `test_*`): guardados por `CONFIRMAR_ESCRITA_IXC`, mas não deveriam ir para o servidor de produção.
- [ ] Branch remota `origin/configuracao_adm` (não verificado se tem trabalho não mesclado; checar `git rev-list --count main..origin/configuracao_adm` antes de apagar).
- [ ] Obsidian: `MEMORIA.md` tem uma lista de Pendências com dezenas de itens já concluídos (riscados). Depois de transferir o que importa para este arquivo, vale mover o histórico concluído para uma nota separada e deixar lá só um link.
