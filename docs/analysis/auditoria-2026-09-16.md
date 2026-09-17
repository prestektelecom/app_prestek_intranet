# Auditoria — Prestek Intranet (2026-09-16)

## Escopo e método

Investigação somente leitura do repositório local (`f:\vault\20 Projetos\prestek_intranet`,
commit `6ce18fd`, sincronizado com `origin/main`). Nenhum arquivo foi editado, nenhum
script executado, nenhum endpoint real chamado, nenhuma credencial testada contra o
IXC/produção. Delegada a 3 subagentes em paralelo:

1. **Mapa integral** — inventário de rotas, middlewares, integrações IXC, persistência, scripts.
2. **Segurança e confiabilidade** — autenticação/autorização, validação de escrita no IXC, upload, logging, arquivos sensíveis rastreados.
3. **Arquitetura e performance** — duplicação, N+1, cache, paginação, testes.

Este documento consolida os três relatórios num backlog único, priorizado por severidade,
para aprovação antes de qualquer correção — nada aqui foi corrigido ainda.

**Atualização 2026-09-17**: Felix aprovou o primeiro lote (P0+P1, itens 1-12). Todos os 12
implementados e verificados com `node --check` (sintaxe) — não testados ao vivo contra
produção nesta sessão. Ver marcação `[FEITO]` em cada item abaixo e a entrada correspondente
em `MEMORIA.md` → Decisões (Segurança).

Ponto de partida corrigido: um documento externo analisando `/root/prestek_intranet` no
commit `235d0de2` (produção, ainda não lançada) apontava `adminAuth` confiando em header
`x-admin-email` e CORS refletindo qualquer origem — **ambos já corrigidos neste repositório
local** desde 2026-09-11 (commit `1e530a0`, já em `origin/main`). Essa cópia de produção
está desatualizada; produção ainda não foi lançada, então não há deploy pendente urgente.

---

## P0 — Crítico

### 1. Segunda credencial IXC real hardcoded, nunca antes catalogada `[FEITO 2026-09-17]`
- **Arquivo**: `backend/debug_clients.js:13`
- **Evidência**: header `Authorization: Basic <base64>` hardcoded, decodifica para `72:<token>` — formato `IXC_USER_ID:IXC_TOKEN_SECRET` real, contra `sistema.prestek.com.br`. É um usuário IXC (**id 72**) diferente do já conhecido e com rotação adiada (**id 222**, conta do Felix — ver Pendências em `MEMORIA.md`).
- **Impacto**: credencial viva de um segundo usuário IXC exposta em arquivo rastreado no git. Escopo de permissão do usuário 72 no IXC não verificado (pode ter escrita).
- **Esforço**: baixo — trocar para `process.env.IXC_USER_ID`/`IXC_TOKEN_SECRET` como os ~90 outros scripts já fazem, ou apagar o script se for descartável.
- **Dependências**: nenhuma.
- **Risco de correção**: baixíssimo (script de diagnóstico standalone, não referenciado em `package.json`).
- **Teste de aceitação**: `grep -rn "Basic [A-Za-z0-9+/=]\{40,\}"` em `backend/` não retorna mais nada; script continua funcional lendo do `.env`.
- **Rollback**: reverter o commit único.
- **Decisão pendente do Felix**: identificar a quem pertence o usuário IXC 72 e se precisa ser revogado/rotacionado no próprio IXC (fora do escopo de código).

### 2. Quatro rotas `/api/admin/*` de escrita sem `adminAuth` `[FEITO 2026-09-17]`
- **Arquivos/linhas**: `backend/server.js:2220` (`POST /api/admin/grupos-nomes`), `:2253` (`POST /api/admin/grupos-supervisores`), `:2281` (`POST /api/admin/responsaveis-manuais`), `:2308` (`POST /api/admin/setores-descricoes`).
- **Evidência**: só têm o `requireAuth` global (login válido); rotas irmãs corretas (`:4033`, `:4052`, `:4078` etc.) usam `adminAuth`. Confirmado por leitura direta do código.
- **Impacto**: qualquer funcionário autenticado pode reatribuir supervisores de grupo, responsáveis manuais do organograma e descrições de setor via chamada direta à API, sem passar pela UI admin.
- **Esforço**: baixo — adicionar `adminAuth` como segundo argumento em cada uma das 4 rotas (mesmo padrão já usado 12x no arquivo).
- **Dependências**: nenhuma.
- **Risco de correção**: baixo, mas precisa confirmar que nenhuma tela hoje chama essas rotas a partir de um usuário não-admin por engano (checar `ResponsaveisManual.jsx`/`SectorsToolbar` etc. antes de aplicar).
- **Teste de aceitação**: chamar cada rota com um JWT de usuário não-admin retorna 403; com admin, continua funcionando como hoje.
- **Rollback**: reverter o commit único.

### 3. CRUD de Comunicados sem `adminAuth` + autoria forjável `[FEITO 2026-09-17]`
- **Arquivo/linhas**: `backend/server.js:320` (`POST`), `:341` (`PUT`), `:360` (`DELETE`) `/api/comunicados`.
- **Evidência**: só `requireAuth`. `criado_por` (linha 321) vem cru do corpo da requisição, sem cruzar com `req.usuario.email`.
- **Impacto**: qualquer funcionário logado pode criar, editar ou excluir qualquer comunicado da empresa inteira, e forjar quem "criou" o comunicado. `AdminComunicados.jsx` assume proteção que o backend não impõe.
- **Esforço**: baixo — `adminAuth` nas 3 rotas + trocar `criado_por` do body por `req.usuario.email`/nome resolvido no servidor.
- **Dependências**: nenhuma.
- **Risco de correção**: baixo.
- **Teste de aceitação**: as 3 operações falham com 403 para não-admin; `criado_por` gravado sempre bate com o usuário do JWT, mesmo se o body mandar outro valor.
- **Rollback**: reverter o commit único.

### 4. `backend/ixc_debug.log` rastreado no git com PII real, ainda sendo escrito em produção `[FEITO 2026-09-17]`
- **Arquivo**: `backend/ixc_debug.log` (rastreado, `git show HEAD:backend/ixc_debug.log` retorna 2022 linhas); escrita contínua em `backend/server.js:1865` (`fs.appendFileSync`, sem rotação/limite).
- **Evidência**: conteúdo real inspecionado localmente — nomes completos de colaboradores, mensagens de chamados internos, IDs de cliente/contrato/ticket/OS reais. Já está no `.gitignore` (linha 32), mas isso não remove o arquivo já commitado nem impede que `git commit -a` o reintroduza atualizado.
- **Impacto**: PII real exposta no histórico do git (repositório privado, mas ainda uma exposição desnecessária); arquivo cresce sem limite no disco de produção.
- **Esforço**: baixo — `git rm --cached backend/ixc_debug.log`; considerar não gravar PII em texto plano (log estruturado sem nome/mensagem, ou nível de log configurável).
- **Dependências**: nenhuma.
- **Risco de correção**: baixíssimo (destravar do git não apaga o arquivo local).
- **Teste de aceitação**: `git ls-files | grep ixc_debug.log` vazio; próxima chamada a `/api/ixc/su-ticket` não aparece em `git status`.
- **Rollback**: `git add` de volta o arquivo (não recomendado). Mesma família de decisão já registrada em `MEMORIA.md` sobre reescrever histórico do git — considerar junto.

---

## P1 — Alto

### 5. `/api/plantoes` (criar/excluir) sem `adminAuth` `[FEITO 2026-09-17]`
- **Arquivo/linhas**: `backend/server.js:1333` (`DELETE`), `:1390` (`POST`).
- **Impacto**: qualquer funcionário logado cria ou apaga a escala de plantão de qualquer data.
- **Esforço**: baixo. **Risco**: baixo, mas confirmar se supervisores não-admin precisam continuar podendo criar plantão (pode exigir um nível de permissão intermediário, não só `adminAuth` binário).
- **Teste de aceitação**: 403 para usuário comum; supervisor/admin continua funcionando.

### 6. Vazamento sistêmico de `error.message` cru (~34 rotas + middleware global) `[FEITO 2026-09-17]`
- **Arquivos/linhas**: 34 ocorrências do padrão `erro: e.message`/`err.message`, incluindo as 4 rotas do item 2, rotas admin (`4048`, `4073`, `4126`), rotas de TI (`4231`–`4430`), rotas de cobertura/escritórios (`3660`–`3959`). Middleware de erro global: `backend/server.js:4492-4500` devolve `err.message` cru para qualquer status ≠ 413.
- **Impacto**: mensagens de erro do driver `pg` tipicamente incluem nome de tabela/coluna/trecho de query — mapeamento de schema para qualquer usuário autenticado que force um erro.
- **Esforço**: médio — padronizar uma função `respostaErro(res, status, mensagemPublica, erroReal)` que loga `erroReal` no servidor e nunca o devolve ao cliente; aplicar nas ~34 rotas + middleware global.
- **Teste de aceitação**: forçar um erro (ex. ID inválido) em 5 rotas amostradas não retorna nada parecido com SQL/stack trace.

### 7. IDOR — nenhuma rota cruza `:id`/`userId` com `req.usuario` do JWT `[FEITO 2026-09-17]`
- **Arquivos/linhas**: `backend/server.js:1123` (`GET /api/configuracoes/:usuarioId`), `:1240` (`POST` mesmo path, sem whitelist de `chave`), `:1139`/`:1153` (`POST /api/presenca/:usuarioId(/logout)`), `:4134`/`:4156` (`GET`/`POST /api/user/dashboard-layout`).
- **Impacto**: qualquer usuário logado lê/grava preferências, avatar, status de presença ou layout de dashboard de outro usuário. Impacto moderado (não é dado financeiro), mas padrão repetido em 5+ rotas.
- **Esforço**: médio — checar `req.usuario.id === :usuarioId` (ou `req.usuario.id === userId` do body/query) em cada uma; para `/configuracoes`, também adicionar whitelist de `chave` gravável.
- **Teste de aceitação**: usuário A não consegue ler/gravar dado de usuário B via essas rotas; continua funcionando para o próprio usuário.

### 8. `PUT /api/funcionario/:usuarioId` escreve no IXC sem checar posse `[FEITO 2026-09-17]`
- **Arquivo/linha**: `backend/server.js:894-982` (escrita real em `funcionarios/:id` no IXC em `:954`).
- **Impacto**: só `requireAuth`; nenhuma verificação de que `usuarioId` é o próprio usuário do token — dado real de funcionário no ERP pode ser editado por qualquer um logado.
- **Esforço**: baixo — mesma checagem do item 7.
- **Teste de aceitação**: usuário A recebe 403 ao tentar `PUT /api/funcionario/<id-de-B>`.

### 9. `POST /api/ixc/su-ticket` permite abrir chamado em nome de outro colaborador `[FEITO 2026-09-17]`
- **Arquivo/linha**: `backend/server.js:1751`.
- **Impacto**: `colaborador_id`, `nome_solicitante`, `email_solicitante` vêm do corpo sem cruzar com `req.usuario` — chamado real no IXC pode ser aberto com identidade forjada.
- **Esforço**: baixo/médio — derivar solicitante de `req.usuario` no servidor em vez de confiar no body (ou validar que `colaborador_id` corresponde ao usuário logado).
- **Teste de aceitação**: ticket criado sempre registra o solicitante real do JWT, mesmo se o body mandar outro.

### 10. N+1 em 4 rotas de plantão (até ~1200 queries extras por requisição) `[FEITO 2026-09-17]`
- **Arquivos/linhas**: `backend/server.js:1677-1723` (`GET /api/plantoes`, 3 queries por linha), `:1459-1547` (`historico`, 6 queries por linha × até 200 linhas), `:1549-1631` (`historico/export`, mesmo padrão sem paginação nenhuma), `:1633-1675` (`historico/:data`, mesmo padrão, capado em `LIMIT 10`, impacto baixo).
- **Evidência de padrão correto já existente no repo**: `/api/top-vendedores` (`:3112-3130`) já resolveu o mesmo problema com `Promise.all`; `/api/setores` (`:2522`) já cacheia.
- **Impacto**: latência crescente com o volume de dados; pior caso ~1200 queries numa única requisição HTTP.
- **Esforço**: médio — coletar todos os IDs únicos da página numa passada, um único `SELECT ... WHERE funcionario_id = ANY($1)`, montar `Map`, mapear em memória. Consolidar também a função `resolverNomes()` duplicada 3x (`:1517`, `:1578`, `:1645`) nesse processo.
- **Teste de aceitação**: `GET /api/plantoes/historico` com 200 linhas gera 1 query extra, não 1200 (medir via log/contador de queries); resposta idêntica em conteúdo.

### 11. `/api/eficiencia/:funcionarioId` — loop minuto-a-minuto sem cache (CPU) `[PARCIAL 2026-09-17: cache aplicado; reescrita analítica do loop, não feita]`
- **Arquivo/linhas**: `backend/server.js:656-891`, `calcHorasUteis` (`:778-793`, até 43.200 iterações), chamada 9x por requisição (`:846-866`).
- **Impacto**: bloqueia o event loop do Node a cada carregamento de Dashboard, para cada usuário; sem cache apesar de `TTL` já existir declarado e não usado (`cache.js:64`, `TTL.OS_CHAMADOS`).
- **Esforço**: baixo para cache (conectar o TTL já existente); médio-alto para reescrever o cálculo de forma analítica (sem loop minuto a minuto).
- **Teste de aceitação**: 2ª chamada dentro do TTL não recalcula (medir tempo de resposta); resultado idêntico ao cálculo atual num caso de teste conhecido.

### 12. Scripts com capacidade de escrita real no IXC de produção, sem proteção `[FEITO 2026-09-17: guarda CONFIRMAR_ESCRITA_IXC em 8/9; test_validacao_estados.js só toca o backend local, não IXC — não guardado]`
- **Arquivos**: `backend/test_put_all_fields.js`, `test_put_correct.js`, `test_put_full_os.js`, `test_put_full_ticket.js`, `test_put_os.js`, `test_put_ticket.js`, `test_minimal_put.js`, `test_final_fix.js`, `test_validacao_estados.js` (~9 arquivos, credenciais via `.env`, não hardcoded).
- **Impacto**: execução acidental (`node backend/test_put_full_os.js`) grava/altera dado real no ERP de produção; sem checagem de ambiente nem confirmação.
- **Esforço**: baixo — mover para uma subpasta `backend/scripts/diagnostico-manual/` fora do caminho comum, e/ou adicionar uma guarda simples (`if (!process.env.CONFIRMAR_ESCRITA_IXC) { console.error(...); process.exit(1) }`) no topo de cada um.
- **Teste de aceitação**: rodar um dos scripts sem a variável de confirmação aborta sem chamar o IXC.

---

## P2 — Médio

### 13. `/api/comunicados` sem `LIMIT`/cache + 3 fetches redundantes no frontend
- **Backend**: `backend/server.js:310-318`, `SELECT * ... ORDER BY criado_em DESC` sem `LIMIT`, sem cache — é o endpoint mais chamado do app (polling de 30s via `src/hooks/useComunicados.js`).
- **Frontend**: `Dashboard.jsx:404-418` (`ComunicadoBanner`) e `:681-692` (`ComunicadosCard`) — montados juntos, cada um faz seu próprio fetch; `Comunicados.jsx:111-128` também não usa o hook. `useComunicados.js` já existe e resolve exatamente isso (comentário no próprio arquivo, linhas 3-5) mas nunca foi adotado por essas 3 telas.
- **Esforço**: baixo/médio — `LIMIT` + cache curto no backend; portar os 3 consumidores para `useComunicados()` (Comunicados.jsx precisa de mutação otimista após create/update/delete).
- **Teste de aceitação**: Network tab mostra 1 fetch de `/api/comunicados` por carregamento de Dashboard, não 2; resposta com `LIMIT` razoável (ex. 50) continua cobrindo o feed real.

### 14. Redis declarado mas nunca usado — documentação desalinhada
- **Evidência**: `redis` em `backend/package.json`, descrito em `CONTEXTO_IA.md`/`MEMORIA.md` ("Express/PG/Redis"), mas `backend/cache.js:5` é um `Map()` em memória de processo único — nenhum import de `redis`/`ioredis` em todo o backend.
- **Impacto**: nenhum bug funcional (funciona bem para 1 processo), mas documentação engana sobre a stack real, e é um limite de escala não documentado (cache não sobrevive a restart nem é compartilhado entre processos).
- **Esforço**: baixo (corrigir `CONTEXTO_IA.md`/`MEMORIA.md` para descrever o cache real) a alto (migrar de fato para Redis, decisão de produto/infra).
- **Decisão do Felix**: só documentar a realidade, ou migrar para Redis de verdade?

### 15. Zero testes automatizados apesar de `vitest`/`jsdom` instalados
- **Evidência**: nenhum `*.test.js`/`*.spec.js` em todo o repositório; sem `vitest.config.*`; sem script `test`/`lint` em nenhum `package.json`.
- **Esforço**: baixo/médio para uma base mínima (config do vitest + 2-3 testes de lógica pura de alto valor: `resolveSetor.js`, `useComunicados.js`, parsing de nome/situação já documentado em `MEMORIA.md`); alto para cobertura ampla.

### 16. `TicketsList.jsx` renderiza até 1000 linhas sem paginação/virtualização
- Já documentado como pendência conhecida (`MEMORIA.md`, Fase 8); confirmado no código (`ResponsiveTable.jsx:59,97` sem slice/virtualização; sem `react-window`/`react-virtual` no projeto). Esforço: médio (client-side) a médio-alto (paginação real no backend).

### 17. `/api/colaboradores` sem cache de rota
- **Arquivo/linha**: `backend/server.js:985-1091`. Bate o IXC + 2 queries locais a cada chamada, sem cache, apesar de `/api/setores` (mesma fonte de funcionários) já cachear por 5 min. Esforço: baixo.

### 18. Duplicação de lógica pura entre arquivos
- `relativeTime()` reimplementada 3x (`Comunicados.jsx:25-41`, `Dashboard.jsx:480-490` e `:709-719` — **as duas últimas no mesmo arquivo**, `AdminComunicados.jsx:35`); `stripMarkdown`/`formatFullDate` duplicadas em 2 arquivos; `hexToRgb`/`tone()` reimplementado localmente em 3 arquivos apesar de já existir `src/utils/tone.js` (usado corretamente por `Processos.jsx`); `resolverNomes()` (backend) duplicada verbatim 3x em `server.js` (mesmas linhas do item 10, consolidar junto). Esforço: baixo, funções puras sem estado.

---

## P3 — Baixo / decisão de produto

### 19. Dashboard/Comunicados/Processos como "god files" (1200-1400 linhas)
Não é mistura de camadas grave — é convenção do projeto não aplicada uniformemente (telas irmãs como `coverage/`, `schedule/`, `ti/cadastro/` já foram extraídas em fases anteriores do programa Impeccable). Blocos concretos de extração seguros listados no relatório da subagente de arquitetura (disponível sob pedido). Esforço baixo/médio, sem risco funcional se for só mover JSX.

### 20. `tmp_check_ti.js` com credencial hardcoded
Já catalogado em `MEMORIA.md` (Pendências) — rotação de `IXC_TOKEN_SECRET` adiada por decisão consciente do Felix até o go-live. Reconfirmado nesta auditoria, nenhuma ação nova.

### 21. Reescrever histórico do git
Já catalogado em `MEMORIA.md` — decisão pendente do Felix, vale mais depois de rotacionar as credenciais (item 20 e a nova, item 1). Considerar incluir `backend/ixc_debug.log` (item 4) na mesma reescrita, se ela acontecer.

### 22. ~95 scripts de diagnóstico soltos na raiz de `backend/`
Artefatos de sessões de depuração anteriores (`diagnostico_chinare*.js`, `check_*.js`, `tmp_*.js`), já commitados, sem risco de segredo adicional além dos já catalogados (exceto item 1, novo). Poderiam ser movidos para uma subpasta `backend/scripts/diagnostico-historico/` para não poluir a raiz — decisão de organização, não urgência.

---

## Achado à parte — números do documento inicial

Os números citados no documento externo (1.007 arquivos, 257 arquivos JS/JSX/TS/TSX,
36.399 linhas, `server.js` com 4.484 linhas, 88 rotas) estavam todos **desatualizados,
não errados** — o repositório cresceu depois. Valores atuais: 1.492 arquivos rastreados,
265 arquivos JS/JSX/TS/TSX, 37.611 linhas, `server.js` com 4.542 linhas, 89 rotas.

---

## Próximos passos sugeridos

1. Felix decide o destino da credencial do usuário IXC 72 (item 1) — ação no próprio sistema IXC, fora do código. **Ainda pendente** mesmo com o código corrigido.
2. ~~Aprovar quais itens P0/P1 entram no primeiro lote de correção~~ — **aprovado por Felix em 2026-09-17: todos os 12 (P0+P1)**, implementados na mesma sessão (ver `[FEITO]` em cada item e a entrada em `MEMORIA.md` → Decisões (Segurança) de 2026-09-17).
3. Correção em lotes pequenos, com diff revisável por lote, como já é praática no projeto (ver `MEMORIA.md`, Decisões). **Feito nesta sessão como um lote único** (12 itens relacionados, verificados com `node --check`); teste ao vivo contra produção real ainda pendente — recomendado antes de dar como definitivamente encerrado.
4. P2/P3 ficam para uma rodada seguinte, priorizados por impacto real observado.

## Notas de implementação (2026-09-17)

- Itens 7 e 8 (IDOR) foram corrigidos ignorando o parâmetro de identidade vindo da URL/body e usando sempre `req.usuario.id` (do JWT) — mais forte que só comparar os dois valores, e evita depender de uma suposição não verificada sobre se `usuario.id` e `funcionario.id` (dois espaços de ID distintos no IXC) coincidem para o usuário logado.
- Item 9 (`su-ticket`) foi editado COM CUIDADO por tocar a mesma rota que a change `fix-ixc-os-contrato-desatualizado` (sessão anterior, 2026-09-17, ainda não commitada) acabou de corrigir ao vivo em produção — só o bloco de resolução do SOLICITANTE foi alterado (agora via `usuarios_perfil` pelo `usuario_id` do JWT, não mais por `colaborador_id`/`email_solicitante` do corpo); a lógica de resolução de login/contrato do cliente placeholder 681, e a criação da OS, não foram tocadas.
- Item 10 (N+1) introduziu 3 funções compartilhadas (`buscarMapaFuncionarios`, `nomesDoMapa`, `pessoasDoMapa`) logo antes das rotas de Plantão em `server.js`, substituindo 3 cópias verbatim de `resolverNomes()` + o `getPessoas()` de `GET /api/plantoes`.
- Item 6 usou uma mensagem genérica única ("Erro interno do servidor.") para todas as ~35 rotas afetadas, em vez de uma mensagem customizada por rota — troca deliberada de esforço por cobertura completa; o detalhe real do erro continua no `console.error` do servidor.
- Nenhuma correção foi testada contra o backend rodando de verdade (não iniciado nesta sessão, para não arriscar conexão com Postgres/IXC de produção sem supervisão). Recomendado rodar `npm run dev` localmente e testar ao vivo antes do próximo deploy — especialmente os itens 7-10, que reescrevem lógica de negócio, não só adicionam uma guarda.
