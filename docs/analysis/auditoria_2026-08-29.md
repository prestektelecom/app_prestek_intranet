# Auditoria Técnica — Prestek Intranet

**Data:** 29/08/2026 · **Escopo:** análise estática do código em `F:\Projetos em Dev\prestek_intranet`
**Foco pedido:** arquitetura, performance/queries, qualidade de código e segurança

> **Resumo:** 4.484 linhas em `server.js`, 91 rotas HTTP, ~8.300 linhas de componentes.
> A infraestrutura (pool com failover, cache SWR, documentação) está acima da média.
> O que falta é a camada que decide quem pode fazer o quê: **hoje qualquer pessoa que
> alcance a porta 3001 tem os mesmos poderes que o administrador da intranet, sem senha.**

**Contagem:** 5 críticos · 4 altos · 8 estruturais · 5 pontos fortes

---

## ⛔ Fazer hoje

1. **Rotacionar `IXC_TOKEN_SECRET`** no painel do IXC — o valor atual deve ser considerado vazado.
2. **Apagar `backend/.env copy.example` e `lovable_keys.txt`** do repositório e do histórico do Git; conferir se o repositório tem remoto (GitHub/GitLab/Replit).
3. **Bloquear a porta 3001 no firewall** para tudo que não seja o próprio host — paliativo até a Fase 1.

---

## Segurança

### S-01 · CRÍTICO — 75 das 91 rotas não verificam nada
Só 15 rotas usam `adminAuth`. Não há `app.use` de autenticação: a proteção é opt-in rota a rota, e o padrão é **aberto**.

Rotas de escrita desprotegidas incluem:
`POST /api/ixc/su-ticket` (abre chamado no IXC de produção), `DELETE /api/plantoes`,
`PUT`/`DELETE /api/comunicados/:id`, `PUT /api/funcionario/:usuarioId`, e quatro rotas sob
`/api/admin/` que apesar do nome não têm `adminAuth`: `grupos-nomes`, `grupos-supervisores`,
`responsaveis-manuais`, `setores-descricoes`.

**Confirmar:** `curl http://IP-DO-SERVIDOR:3001/api/colaboradores` — se voltar a lista sem login, está confirmado.

### S-02 · CRÍTICO — Ser admin é digitar o e-mail de um admin
`adminAuth` (server.js:3943) lê o header `x-admin-email` e libera se aquele e-mail for admin.
Não há segredo: o header é escolhido por quem chama.
`curl -H "x-admin-email: <email de qualquer admin>"` passa pelas 15 rotas protegidas — inclusive
`PUT /api/admin/usuarios/:id/privilegios`, que promove qualquer usuário a admin.

Pior efeito colateral: `registrarAuditoria()` grava esse mesmo header como autor da ação.
**O log de auditoria registra quem o atacante disse que era** — é inutilizável como prova.

### S-03 · CRÍTICO — A sessão é um JSON editável no navegador
`localStorage['@Stitch:user']` guarda o usuário em JSON puro, com `is_admin` dentro.
DevTools → trocar `false` por `true` → aba **TI** (cadastro no ERP) e painel admin aparecem.
Como o backend também não valida, as ações funcionam de verdade.
Com "lembrar", esse JSON fica 7 dias no disco, com o `acesso_token` do IXC dentro.

### S-04 · CRÍTICO — Credenciais reais versionadas
`backend/.gitignore` ignora `.env`, mas **`backend/.env copy.example` não casa com esse padrão**
e está no repositório com `IXC_TOKEN_SECRET` de aparência real, `IXC_USER_ID`, IP do banco e
usuário do PostgreSQL. Na raiz, `lovable_keys.txt` guarda URL + chave anônima de um Supabase.

Apagar agora não basta: continuam recuperáveis no histórico. Por isso a rotação vem antes da limpeza.

**Regra:** no `.gitignore` use `.env*` com exceção `!.env.example`, e no arquivo de exemplo
mantenha só placeholders — nunca um valor que já funcionou.

### S-05 · CRÍTICO — CORS aceita qualquer origem
`app.use(cors({ origin: true }))` devolve como permitida a origem de quem perguntou.
Combinado com a ausência de autenticação, qualquer página aberta pelo navegador de um
funcionário na rede pode ler e escrever na API.

### S-06 · ALTO — Login sem limite de tentativas
`POST /api/login` não tem rate limit. A senha é comparada como SHA-256 sem salt (herança do IXC),
o que torna senhas fracas quebráveis por lista pré-calculada. Sem limite, o ataque roda direto.
Note também que o backend puxa o registro completo do usuário do IXC **com o hash da senha dentro**
para comparar em Node — se algum log imprimir esse objeto, o hash vaza junto.

### S-07 · ALTO — Erros internos devolvidos ao cliente
36 pontos respondem `{ erro: e.message }`. Numa falha de SQL isso entrega nome de tabela,
nome de coluna e host do banco. O próprio `adminAuth` já faz certo (loga o real, devolve genérico) —
é o padrão a replicar nos outros 36.

### S-08 · ALTO — Rotas de diagnóstico expostas
`/api/debug-funcionario/:id`, `/api/debug/setor/:setorId`, `/api/debug/grupos-membros`, `/api/test-ixc`.

### S-09 · ALTO — Dados reais de cliente em arquivos versionados
`ixc_debug.log` (468 KB) está no `.gitignore`, mas `client_681.json`, `funcionario-detailed.json`,
`audit_results.json` (85 KB), `os_data.json`, `ticket_data.json` e `nomes.txt` não estão.

---

## Arquitetura

> Três dos pontos abaixo já estavam em `docs/analysis/`. O diagnóstico envelheceu: o documento
> fala em 2.700 linhas de `server.js`, e o arquivo está com **4.484** — cresceu 66% depois de a
> análise apontar o problema. Documentar sem executar vira dívida com juros.

### A-01 · server.js concentra 91 rotas e toda a regra de negócio
Sintoma objetivo: o header Basic Auth do IXC é remontado à mão **23 vezes**, mesmo já existindo
`ixcHeaders()` em `services/ixc.js`, importado no topo do arquivo. Trocar a forma de autenticar
no IXC hoje é editar 23 lugares. Os arquivos já extraídos (`services/ixc.js`, `ixcColaborador.js`,
`ixcTaxonomias.js`, `fichaParser.js`) mostram que o caminho já foi aberto — só não foi percorrido de volta.

### A-02 · Mais de 120 scripts avulsos na raiz do backend
`test_*`, `check_*`, `find-*`, `verify-*`, `diagnostico_chinare` de 1 a 6. O custo não é estética:
`db.js`, `cache.js` e `server.js` ficam invisíveis no meio deles.

### A-03 · Não existe camada de API no frontend
`fetch()` direto em 11 componentes — 10 vezes só no `Dashboard.jsx` — cada um com seu tratamento
de erro. Quando a Fase 1 introduzir token de sessão, seria uma linha com `src/services/api.js`
e são 40 edições sem ele. **Pré-requisito da Fase 1.**

### A-04 · Componentes-monolito
`Dashboard.jsx` 1.324 linhas / 33 `useState`; `Comunicados.jsx` 1.219; `Processos.jsx` 1.043.
Contraste útil: `components/ti/cadastro/` e `components/schedule/` estão quebrados em arquivos de
1–7 KB, com `campos.js`, `validadores.js`, `normalizadores.js` separados. O padrão bom já existe
no repositório — as três telas grandes são anteriores a ele.

### A-05 · Sem `AuthContext` — `user` desce por props
Passado manualmente para os 13 destinos do `App.jsx`. Um contexto daria lugar único para a
validação de sessão da Fase 1.

### A-06 · Navegação por `currentView`, sem rotas
Já documentado em `docs/analysis/frontend_navigation.md` e ainda válido: sem botão "voltar",
sem link compartilhável da escala de plantão. Detalhe extra: a proteção de tela hoje é
`currentView === 'ti' && user?.is_admin` repetido em pares de linha; com rotas vira um `<RotaAdmin>`.

### A-07 · ALTO — `localhost:3001` fixo no frontend
`usePresence.js` chama `http://localhost:3001/api/presenca/...` literalmente. Para quem acessa de
outra máquina, esse `localhost` é o PC **dele** — falha em silêncio (`catch` só faz `console.error`).
Ou seja: o "quem está online" provavelmente só funciona para quem abre no próprio servidor.
`AdminDashboard.jsx` e `admin/AdminUsuarios.jsx` repetem como fallback de `VITE_API_URL`.
O resto do projeto usa caminho relativo `/api/...` + proxy do Vite, que é o certo. São 3 exceções.

### A-08 · Zero testes, com o runner já instalado
`vitest` e `jsdom` no `package.json`, nenhum `.test.js` no projeto. Alvos baratos e de alto risco:
`validadores.js`, `normalizadores.js`, `planTaxonomy.js`, `resolveSetor.js` — funções puras onde um
erro silencioso passa direto para o cadastro do colaborador no ERP.

---

## Performance e consultas

### P-01 · ALTO — Cache em memória sem teto; `redis` instalado e nunca importado
`cache.js` é um `Map` sem limite e sem eviction — só expira por TTL quando alguém pede a chave.
O comentário do próprio arquivo diz que `COBERTURA_CLIENTES` guarda **~48 mil registros por 6 horas**.
Reiniciar o backend zera tudo, e o código documenta request frio de **~20 s** nas taxonomias.
O pacote `redis` está nas dependências e não é importado em lugar nenhum — ou entra e resolve
persistência + teto de memória, ou sai do `package.json`.

### P-02 · ALTO — Tabelas inteiras puxadas do IXC para filtrar em JS
5 consultas com `rp: '10000'`, 4 com `rp: '5000'`, 14 com `rp: '1000'`, com filtro aplicado depois
em memória. A API do IXC aceita `qtype`/`query`/`oper` — dá para filtrar no servidor.
Começar pelos `rp: '10000'`, que são poucos e concentram o custo.

### P-03 · 14 `SELECT *` e SQL montado por interpolação em 2 pontos
Linhas 2481 e 4066. Os **valores vão parametrizados — não é injeção hoje**. Mas `${where}`
concatenado com `params.slice(0, -2)` logo abaixo é o tipo de construção onde o próximo filtro
adicionado às pressas vira injeção. Vale isolar antes que aconteça.

---

## O que já está bem-feito (não reescrever na Fase 3)

- **`db.js` — failover com detecção de standby.** Percorre primário e réplica, descarta nó em
  `pg_is_in_recovery()`, `statement_timeout` de 15 s, handler de erro no pool, reseleção de host
  sem reiniciar. Equivalente ao `target_session_attrs=read-write` que o driver `pg` não implementa.
- **`cache.js` — stale-while-revalidate deliberado.** Serve dado vencido enquanto revalida, com
  janela separada do TTL, e cada TTL longo justificado em termos de negócio.
- **Comentários que explicam o porquê.** "O IXC NEGA a leitura de `usuarios_grupo` para este token"
  evita que alguém refaça a mesma investigação. `features.js` é uma flag bem documentada.
- **Disciplina de documentação.** `AGENTS.md`, `CHANGELOG.md`, `docs/analysis/`, `openspec/`,
  migrations numeradas. A estrutura para trabalhar em fases já existe.
- **Modularização recente no caminho certo.** `components/ti/cadastro/` e `backend/services/`.

---

## Plano em fases

A ordem das duas primeiras não é negociável. Cada fase deixa o sistema funcionando ao final e
nenhuma exige parar o que o pessoal já usa. As fases 3–5 podem ser reordenadas.

### Fase 0 — Estancar o vazamento · 1–2 h
- Rotacionar `IXC_TOKEN_SECRET` no IXC e atualizar o `.env` do servidor.
- Apagar `backend/.env copy.example` e `lovable_keys.txt`; `.gitignore` → `.env*` + `!.env.example`; adicionar os `.json` de despejo.
- Verificar remoto do Git. Se existir: limpar histórico (`git filter-repo`) e avisar quem tem cópia.
- Firewall: porta 3001 só para o próprio servidor (o Vite já faz proxy de `/api`, nada quebra).

**Pronto quando:** o token antigo não autentica mais no IXC e `curl` de outra máquina na 3001 dá timeout.

### Fase 1 — Autenticação de verdade · 2–3 dias
- Tabela `sessoes` (id opaco, usuario_id, is_admin, expira_em) ou JWT assinado. Para intranet, a tabela é mais simples de revogar.
- Login devolve o token; frontend guarda em cookie `httpOnly` (ou memória + `sessionStorage`). O que **não** pode continuar é `is_admin` vir do navegador.
- `app.use('/api', requireAuth)` registrado **depois** de `/api/login` e `/api/health` — inverte o padrão: fechado por omissão.
- `adminAuth` passa a ler `req.usuario.is_admin` da sessão; `x-admin-email` some; auditoria grava o usuário autenticado.
- **Antes de mexer nos componentes:** criar `src/services/api.js` (A-03).

**Pronto quando:** `curl` sem token devolve 401 em toda rota exceto login/health, e editar `is_admin` no `localStorage` não abre mais a aba TI.

### Fase 2 — Endurecer as bordas · 1 dia
- Rate limit no login (`express-rate-limit`, ~10 tentativas / 15 min por IP).
- Trocar os 36 `erro: e.message` por mensagem genérica + `console.error`.
- Remover ou proteger as 4 rotas `/api/debug*` e `/api/test-ixc`.
- CORS restrito à origem da intranet, lida do `.env`.
- Corrigir os três `localhost:3001` do frontend.

**Pronto quando:** o indicador de "online" funcionar para um usuário acessando de outra máquina.

### Fase 3 — Quebrar o monolito do backend · gradual
- Mais barato primeiro: substituir as 23 montagens manuais do Basic Auth por `ixcHeaders()`. Achar-e-substituir, derruba ~100 linhas.
- Mover os 120+ scripts para `backend/tools/` e ignorar os `.json` de dados. Uma hora, ganho permanente.
- Extrair rotas por domínio, um por vez, com `server.js` como composição: `routes/plantoes.js`, `routes/comunicados.js`, `routes/cobertura.js`…

**Pronto quando:** `server.js` tiver menos de 300 linhas e nenhuma consulta SQL.

### Fase 4 — Frontend: rotas e componentes · gradual
- `AuthContext` no lugar do `user` em props.
- `react-router` com `<RotaAdmin>`. Ganho imediato: link compartilhável da escala de plantão.
- Quebrar `Dashboard`, `Comunicados` e `Processos` no padrão de `ti/cadastro/` — um por vez, começando pelo que você mexe mais.

**Pronto quando:** nenhum componente passar de 400 linhas e o botão "voltar" funcionar.

### Fase 5 — Performance e rede de segurança · contínuo
- Decidir sobre o Redis: usar ou remover do `package.json`.
- Migrar os `rp: '10000'` para filtro no lado do IXC.
- Primeiros testes com o `vitest` já instalado: `validadores.js`, `normalizadores.js`, `planTaxonomy.js`.

**Pronto quando:** `npm test` existir e passar, e o request frio de cobertura sair dos ~20 s.

---

## Escopo desta análise

**Lidos integralmente:** `server.js`, `db.js`, `cache.js`, `App.jsx`, `services/auth.js`,
`hooks/usePresence.js`, os `.gitignore`, os `package.json`, `vite.config.js`, `AGENTS.md`
e os documentos de `docs/analysis/`. Componentes grandes foram medidos e inspecionados por amostragem.

**Não executados:** teste dinâmico contra o servidor no ar; revisão do histórico do Git
(sem acesso ao `git` nesta análise); leitura das 24 migrations uma a uma.

Os itens S-01 a S-05 são de leitura direta do código e podem ser confirmados em minutos.
