## 1. Estender `cache.js` com suporte a stale window (D2)

- [x] 1.1 Adicionar campo `staleUntil` no `_store`: `cacheSet(key, data, ttlMs, staleWindowMs = 0)` armazena `{ data, expiresAt: now + ttlMs, staleUntil: now + ttlMs + staleWindowMs }`
- [x] 1.2 Alterar `cacheGet` para retornar `{ hit: true, stale: false, data }` quando `expiresAt > now`, `{ hit: true, stale: true, data }` quando `now` está entre `expiresAt` e `staleUntil`, e `{ hit: false }` quando além de `staleUntil` (ou sem stale window)
- [x] 1.3 Adicionar `COBERTURA_SWR_WINDOW` em `TTL` no `cache.js`: `parseInt(process.env.CACHE_STW_COBERTURA || '1800') * 1000` (30 min)
- [x] 1.4 Verificar que todos os `cacheSet` existentes no `server.js` (que passam 3 argumentos) ainda se comportam exatamente como antes — `staleWindowMs` default 0 implica `staleUntil = expiresAt`, mantendo o comportamento atual de expirar sem stale

## 2. Extrair `buildCoberturaCache()` do handler (D1)

- [x] 2.1 Criar a função `async function buildCoberturaCache()` hoisted acima do handler `app.get('/api/cobertura-ixc', ...)`, recortando todo o bloco `try { ... }` atual (L3365–L3568 do server.js)
- [x] 2.2 A função não recebe `req`/`res`. Deve chamar `cacheSet(CACHE_KEY_COB, responseBody, TTL.COBERTURA_IXC, TTL.COBERTURA_SWR_WINDOW)` e `cacheSet('cobertura-ixc:contratos-brutos', ...)` como já faz, e **retornar** `responseBody`
- [x] 2.3 Em caso de erro, a função lança a exceção (sem `res.status(500).json()`) — o caller é responsável por tratar
- [x] 2.4 Confirmar que o handler, após a extração, continua funcionando: fazer um request em desenvolvimento e verificar que a resposta contém `dados`, `total` e `meta`

## 3. Implementar SWR no handler de `/api/cobertura-ixc` (D1, D3)

- [x] 3.1 Declarar a flag `let _coberturaRevalidando = false` em escopo de módulo, acima do handler
- [x] 3.2 Criar a função `async function revalidarCobertura()` que: (a) verifica `_coberturaRevalidando` e retorna se já em curso; (b) seta `_coberturaRevalidando = true`; (c) chama `await buildCoberturaCache()`; (d) limpa `_coberturaRevalidando = false` em `finally`; (e) loga erros como warning sem propagar
- [x] 3.3 Refatorar o handler: `const cached = cacheGet(CACHE_KEY_COB)` → se `cached.hit && !cached.stale`: retorna `{ ...cached.data, cacheStatus: 'HIT' }` → se `cached.hit && cached.stale`: chama `revalidarCobertura()` (sem await) e retorna `{ ...cached.data, cacheStatus: 'STALE' }` → caso contrário (MISS): `const result = await buildCoberturaCache(); return res.json({ ...result, cacheStatus: 'MISS' })`
- [x] 3.4 Envolver o MISS em try/catch: em caso de erro, retornar `res.status(500).json({ sucesso: false, erro: e.message })`

## 4. Pré-aquecimento na subida do servidor (D4)

- [x] 4.1 Na função `iniciarServidor()`, dentro do callback de `app.listen()` (após o `console.log` de confirmação), adicionar: `console.log('🔥 [warmup] Pré-aquecendo cache de cobertura em background...'); buildCoberturaCache().catch(e => console.warn('[warmup] falha no pré-aquecimento de cobertura:', e.message));`
- [x] 4.2 Verificar nos logs do servidor que, ao reiniciar, a linha de warmup aparece imediatamente após `✅ Backend proxy rodando...` e o servidor aceita requests enquanto o cache é construído

## 5. Validação

- [x] 5.1 Reiniciar o servidor e verificar nos logs: (a) servidor responde na porta; (b) log de warmup aparece; (c) após ~349s, log de conclusão do índice de clientes aparece
- [x] 5.2 Fazer um request em `/api/cobertura-ixc` imediatamente após o restart (antes do warmup terminar) — deve bloquear e retornar com `cacheStatus: 'MISS'`
- [x] 5.3 Fazer um request após o warmup concluir — deve retornar com `cacheStatus: 'HIT'` em menos de 200ms
- [ ] 5.4 Aguardar ou forçar expiração do TTL (10 min) e fazer um novo request — deve retornar imediatamente com `cacheStatus: 'STALE'` e disparar rebuild em background
- [ ] 5.5 Fazer múltiplos requests simultâneos com cache stale — todos retornam STALE imediatamente; logs mostram apenas um rebuild em andamento
- [ ] 5.6 Após o rebuild em background concluir, o próximo request retorna `cacheStatus: 'HIT'`
- [x] 5.7 Confirmar que `/api/cobertura-ixc/contratos-bairro` continua funcionando (usa `cobertura-ixc:contratos-brutos`, que é renovado junto pelo `buildCoberturaCache()`)
