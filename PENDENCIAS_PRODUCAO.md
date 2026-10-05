# Prestek Intranet — Pendências consolidadas (go-live)

Levantamento de 2026-10-03: `MEMORIA.md`, `openspec/changes/`, git, migrations e TODOs no código.
**Este é o único lugar para acompanhar o que falta.** Marque `- [x]` ao concluir.
Lacunas de verificação estão marcadas como _(não verificado)_.

---

## 1. Antes de subir (bloqueantes)

### Segurança e credenciais
- [ ] **Rotacionar `IXC_TOKEN_SECRET` do usuário IXC 222** (conta do Felix). Você adiou para "quando for para produção": é agora. O valor real chegou a ser versionado em `backend/.env copy.example` (já sanitizado) e segue no histórico do git. Onde: IXC → configurações de API/token do usuário 222. Atualizar `backend/.env` da produção.
- [ ] **Identificar/revogar o usuário IXC 72**, cujo token estava hardcoded em `backend/debug_clients.js` (removido do código em 2026-09-17, mas ainda no histórico).
- [ ] **Conferir o `.env` de produção:** `JWT_SECRET` forte e próprio; `CORS_ORIGENS` com o domínio real (o padrão é `http://localhost:5000`, que bloquearia o site); `VITE_API_URL` apontando para a API de produção no build. _(Inferido das decisões de 2026-09-11; não verificado no servidor.)_
- [ ] **Decidir sobre limpar o histórico do git** (`git filter-repo` + force-push). Só vale depois de rotacionar os tokens; é higiene, não urgência.

### Deploy / banco
- [ ] **NÃO rodar `migrations/run.js` inteiro em produção.** Ele reexecuta todos os `.sql` e engole erros. Aplicar só o que falta, via `pg`/`psql -f`. Já aplicadas: 022, 023 e 024. Conferir com `SELECT column_name FROM information_schema.columns WHERE table_name='processos' AND column_name LIKE 'ixc_%'` (esperado: 5 colunas).
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
| `caixa-de-sugestoes` | 14/16 | Implementada na branch `feat/suggestion-box` (2026-10-05). Falta: configurar `SMTP_*` no `.env` de produção (sem isso o e-mail não sai; não verifiquei qual servidor de e-mail a empresa usa) e `npm ci` no servidor (dependência `nodemailer`); aplicar **só** `backend/migrations/025_sugestoes.sql` em produção (via `pg`, nunca `run.js`), rodar no banco real as consultas de `/api/sugestoes` depois da migration, conferir a tela no navegador nos 5 temas e abrir o PR (merge é seu). |
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

---

## 7. Roteiro de deploy (`/home/antonio/app_prestek_intranet`)

Escrito em 2026-10-03 a partir do código. Itens com **[confirmar]** dependem de como o servidor está montado, o que o repositório não registra (nginx, gerenciador do processo do backend). O Express **não** serve o `dist/`: quem serve o front estático é outro componente.

**Estado do código:** `main` no GitHub em `b36cafa` ou posterior. As migrations 021, 022, 023 e 024 já estão aplicadas no banco (é o mesmo de desenvolvimento); **não há migration a rodar**. A 013 foi alterada só no arquivo, para a eventualidade de reexecução, e não precisa ser aplicada.

### A. Antes de tocar no servidor
- [ ] Anotar o commit atual do servidor, para poder voltar: `cd /home/antonio/app_prestek_intranet && git rev-parse HEAD (se a pasta ainda não existir, é instalação nova: pule para a seção H)`
- [ ] Backup do banco: `pg_dump` completo do Postgres de produção (o `psql` não existe na máquina de desenvolvimento; rode no servidor). Guardar fora da pasta do projeto.
- [ ] Copiar o `.env` atual do servidor para um local seguro (`backend/.env`).
- [ ] Escolher um horário de pouco uso: o backend reinicia e as sessões continuam válidas (o `JWT_SECRET` não muda).

### B. Atualizar o código
- [ ] `git pull origin main` (se acusar alteração local no servidor, parar e olhar: não sobrescrever).
- [ ] Dependências: `npm install` na raiz **e** `cd backend && npm install` (entraram `@maplibre/maplibre-gl-leaflet` e `leaflet.markercluster`; saiu `redis`).
- [ ] Build do front **com a URL certa da API**: `VITE_API_URL=<url pública da API> npx vite build`. O valor entra no bundle na hora do build; sem ele o front aponta para `localhost:3001`. **[confirmar]** se o nginx faz proxy de `/api` na mesma origem (nesse caso `VITE_API_URL` pode ficar vazio).
- [ ] Publicar o `dist/` onde o servidor web lê **[confirmar]** (nginx/outro).

### C. Conferir o `.env` do backend (nomes obrigatórios)
`IXC_HOST`, `IXC_USER_ID`, `IXC_TOKEN_SECRET`, `DB_HOST` (ou `DB_PRIMARY_HOST`/`DB_REPLICA_HOST`), `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, `JWT_SECRET`, `CORS_ORIGENS`, `IXC_SENHA_PADRAO_COLABORADOR`.
- [ ] `CORS_ORIGENS` com o domínio **real** do site (o padrão `http://localhost:5000` bloquearia todo o front em produção).
- [ ] `JWT_SECRET` longo e próprio. **Trocar derruba todas as sessões**: faça só se estiver fraco e avise o time.
- [ ] Opcionais de cache (`CACHE_TTL_*`, `CACHE_STW_COBERTURA`): sem eles valem os padrões.

### D. Subir
- [ ] Reiniciar o backend (`node server.js` em `backend/`) pelo gerenciador que o servidor usa **[confirmar: pm2, systemd ou outro]**.
- [ ] Ver o log de inicialização: conexão com o Postgres (`DB_PRIMARY_HOST` primeiro, `DB_REPLICA_HOST` de reserva) e ausência de erro.
- [ ] `GET /api/health` responde OK.

### E. Verificação pós-deploy (5 minutos, com sua conta de admin)
- [ ] Login funciona e o Dashboard carrega; o card de aniversariantes mostra o departamento ("sáb, 04/10 · COMERCIAL").
- [ ] Painel Admin: aba Usuários abre sem erro (a versão antiga da consulta de permissões derrubava toda rota de gestão com 503; **se vir 503, o servidor está com código antigo**).
- [ ] Setores: os totais batem com o filtro de Colaboradores; a equipe do T.I e dos demais setores está como antes (os 5 ajustes manuais seus continuam).
- [ ] Meus chamados e Plantão carregam; abrir um chamado de TI de teste **só com sua autorização** (escreve no IXC).
- [ ] Conferir que o navegador não mostra erro de CORS no console.
- [ ] `git status` limpo no servidor.

### F. Segurança (na mesma janela, nesta ordem)
1. [ ] **Rotacionar o token do usuário IXC 222:** gerar o novo no IXC, atualizar `IXC_TOKEN_SECRET` no `.env` **de produção e de desenvolvimento**, reiniciar o backend, testar uma tela que lê o IXC (Colaboradores). Só então revogar o token antigo. Não colar o valor no chat nem em arquivo versionado.
2. [ ] Decidir sobre o usuário IXC 72 (revogar ou rotacionar) e anotar o resultado.
3. [ ] **PostgreSQL exposto à internet** (`pg_hba.conf` com `0.0.0.0/0`): **primeiro** liberar o IP do servidor da aplicação e dos admins, **depois** remover a regra aberta e recarregar o Postgres, **depois** testar o backend. Fazer nessa ordem evita derrubar o sistema por engano.
4. [ ] Trocar as senhas que passaram por chat (root do Felix e `antonio`) e passar para chave SSH.

### G. Se algo der errado (reverter só o código)
- [ ] `git checkout <commit anotado no passo A>`, repetir B (instalar e build) e reiniciar o backend. Não há migration nova, então **o banco não precisa de reversão**; o backup do passo A só vale se algo mexer em dados.
- [ ] Se o problema for só o token do IXC novo, restaurar o `.env` copiado no passo A e reiniciar.

### H. Primeira instalação em `/home/antonio/app_prestek_intranet` (usuário `antonio`, sem root)

O destino é um servidor Debian de usuário comum. Se a pasta ainda não existe, não é um `git pull`: é uma instalação completa. Conferir antes, **só com comandos de leitura** (rodar no servidor e anotar o resultado):
- [ ] `node -v` e `npm -v`. O Vite 5 e o backend (módulos ES) exigem **Node 18 ou mais novo**. O Debian 10 do Antonio traz Node 10 por padrão: se for o caso, instalar o Node pelo `nvm` na conta `antonio` (não precisa de root).
- [ ] `git --version` e acesso ao repositório (`git clone git@github.com:prestektelecom/app_prestek_intranet.git`; repositório privado exige chave de deploy ou token do GitHub, **nunca** a senha da conta).
- [ ] `ls -la /home/antonio/app_prestek_intranet` (existe? tem `.git`? tem `backend/.env`?).
- [ ] `ps aux | grep -i "node\|pm2"` e `pm2 list` (já há algo rodando? em qual porta?).
- [ ] `ss -ltnp` (quais portas estão em uso; o backend usa a `PORT` do `.env`, 3001 por padrão).
- [ ] `which nginx apache2 caddy` e `ls /etc/nginx/sites-enabled` (quem serve o site). Mexer em nginx/systemd exige `sudo`: confirmar se o usuário `antonio` tem.
- [ ] Postgres: o app roda no mesmo servidor do banco (`201.150.48.6`)? Nesse caso o `DB_HOST` pode ser `127.0.0.1` e a porta 5432 **não precisa** ficar aberta à internet.

Depois, a instalação:
1. [ ] `git clone` na pasta, `npm install` na raiz e em `backend/`.
2. [ ] Criar `backend/.env` a partir de `backend/.env copy.example` (que tem só placeholders), preenchendo as variáveis da seção C. Permissão `chmod 600 backend/.env`.
3. [ ] `npx vite build` com o `VITE_API_URL` correto e publicar o `dist/` onde o servidor web lê.
4. [ ] Manter o backend no ar sem root: `pm2 start server.js --name prestek-backend` dentro de `backend/`, mais `pm2 save` e `pm2 startup` (este último pede um comando com `sudo`; sem sudo, usar `crontab -e` com `@reboot`).
5. [ ] Voltar para as seções D e E (subir e verificar).

---

## 8. Senhas expostas no histórico do git (achado em 2026-10-03)

> **Decisão do Felix (2026-10-04): não trocar as senhas agora; risco aceito.** Os itens abaixo ficam como recomendação, **não** bloqueiam o deploy. Consequência assumida: quem tiver acesso de leitura ao repositório do GitHub (e ao histórico) consegue as senhas do `antonio` em `201.150.48.6` e do `root` em `65.21.149.72`. Reavaliar se o repositório deixar de ser privado, se mais pessoas ganharem acesso a ele ou quando o sistema for exposto fora da rede interna.

O arquivo `.claude/settings.local.json` (regras de permissão do Claude Code) estava versionado e continha senhas em texto puro; foi enviado ao GitHub no commit `c451c61` e em outros. Desde o commit `38f278a` o arquivo está no `.gitignore` e fora do git, **mas as senhas continuam no histórico**. Não repetir os valores aqui.
- [ ] **Trocar a senha do usuário `antonio`** no servidor `201.150.48.6` (também foi digitada no chat).
- [ ] **Trocar a senha do `root` do servidor `65.21.149.72`** (a do Felix; aparece em 3 regras do arquivo, linhas ~56, 57 e 63).
- [ ] **Passar os dois servidores para chave SSH** e desligar login por senha (`PasswordAuthentication no`), depois de testar a chave.
- [ ] Apagar do seu arquivo local `.claude/settings.local.json` as regras que carregam senha (linhas ~56, 57, 63 e as de `export ..._PW=`), agora que ele não vai mais ao git.
- [ ] Opcional: limpar o histórico (`git filter-repo` + force-push + reclonar onde houver cópia). Só depois de trocar as senhas; é higiene, não urgência.
- Regra daqui em diante: nunca colar senha no chat nem em arquivo do projeto; o Claude Code não deve gravar credenciais em regras de permissão.

---

## 9. Estado da implantação (2026-10-05) e o que falta

**Já feito:** a intranet está em `https://intranet.prestek.com.br/` (Apache da porta 443 por nome, ao lado do `insight`; certificado Let's Encrypt emitido pelo root, vence em 2027-01-03). Servidor sincronizado com a `main` por chave de deploy; dependências instaladas com `npm ci`; build com `VITE_API_URL=https://intranet.prestek.com.br`; backend sob `pm2` (`prestek-backend`) com `HOST=127.0.0.1`. O servidor **não** usa nginx: é Apache, e o roteiro da seção 7 vale com essa troca. `GET /api/health` respondeu `ok` com o banco conectado.

**Falta (do Felix, no servidor, como `antonio`):**
- [ ] `backend/.env` do servidor: `CORS_ORIGENS=https://intranet.prestek.com.br`, `HOST=127.0.0.1` (sem isso, depois de um reboot o backend volta a escutar em todas as interfaces e a porta 3001 reabre) e `IXC_SENHA_PADRAO_COLABORADOR` (copiar do `.env` de desenvolvimento). Depois `pm2 restart prestek-backend --update-env`.
- [ ] Fazer o backend voltar sozinho após reboot: `pm2 save` e uma linha `@reboot` no `crontab` do `antonio` (`pm2 resurrect`, com o `PATH` do Node). Testar com um reboot real.
- [ ] Conferir a renovação do certificado (`/root/.acme.sh/acme.sh --list` e o `--reloadcmd`).
- [ ] Decidir se o `intranet.conf` continua aberto (`Require all granted`, a proteção é o login) ou se restringe à rede da empresa (`Require ip ...`).
- [ ] Apagar a cópia `/home/antonio/app_prestek_intranet/.claude/settings.local.json` do servidor, que carrega as mesmas senhas da seção 8.

**Falta (root):**
- [ ] Desligar os virtual hosts temporários: `a2dissite intranet-ip intranet-porta`, apagar `Listen 8081` e `Listen 24781` de `/etc/apache2/ports.conf`, `apache2ctl configtest` e `systemctl reload apache2`. Os arquivos `intranet-ip.conf` e `intranet-porta.conf` ficam em `/home/antonio/` para consulta.
- [ ] **Postgres (`5432`) aberto à internet.** Não fechar de vez: o `.env` de desenvolvimento usa `DB_HOST=201.150.48.6`. Restringir por IP no `pg_hba.conf` (`127.0.0.1` e `201.150.48.0/22`), tirar a regra `0.0.0.0/0`, recarregar, e testar o backend do servidor e o de desenvolvimento. Se a equipe trabalha fora da rede da empresa, usar túnel SSH.

**Sem root no servidor:** `git` e `pm2` estão em `~/local` (ver `MEMORIA.md`, seção Ambiente). Para atualizar: `git pull origin main`, `npm ci` se o lock mudou, `VITE_API_URL=https://intranet.prestek.com.br npx vite build` e `pm2 restart prestek-backend --update-env`.
