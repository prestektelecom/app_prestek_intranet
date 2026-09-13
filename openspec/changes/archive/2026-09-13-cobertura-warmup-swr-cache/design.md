## Context

O endpoint `/api/cobertura-ixc` ([backend/server.js:3357](backend/server.js#L3357)) tem ~210 linhas de lógica inlined diretamente no handler do Express. O handler verifica o cache, e se MISS executa todo o pipeline (paginação IXC, join, agregação, Nominatim, merge de overrides, `cacheSet`) antes de chamar `res.json()`. Não há separação entre "construir o dado" e "responder ao request".

O [`backend/cache.js`](backend/cache.js) expõe `cacheGet(key)` → `{ hit, data }` e `cacheSet(key, data, ttlMs)`. `cacheGet` deleta o item expirado e retorna `{ hit: false }` — sem noção de stale.

Medições (`cobertura-resolver-endereco-cliente`, task 7.5):
- Contratos: ~98s (3 páginas × ~21k registros)
- Clientes: ~249s (5 páginas × ~48k registros, sequencial por restrição de heap)
- Total cache MISS: **~349s**
- TTL atual: 10 min (`COBERTURA_IXC`), 6h (`COBERTURA_CLIENTES`)

## Goals / Non-Goals

**Goals:**
- Extrair `buildCoberturaCache()` do handler para uma função reutilizável.
- Pré-aquecer o cache ao subir o servidor (sem bloquear `app.listen()`).
- Implementar Stale-While-Revalidate no `cache.js` e no handler de cobertura.
- Garantir que apenas um rebuild rode em background por vez.

**Non-Goals:**
- Alterar a lógica de negócio (join, agregação, normalização de bairro).
- Persistir o cache em disco para sobreviver a restarts.
- Aplicar SWR em outros endpoints.
- Alterar o TTL de 10 min (`COBERTURA_IXC`) ou 6h (`COBERTURA_CLIENTES`).

## Decisions

### D1. Extração para `buildCoberturaCache()`, não para módulo separado

A lógica de construção fica no mesmo arquivo `server.js`, como função hoisted acima do handler. Alternativa considerada: mover para `backend/services/cobertura.js`. Rejeitada porque o `server.js` usa `pool`, `paginarIXC`, `normalizarBairro`, `getMapaUF`, `getIndiceClientes` e `cacheSet` já em escopo — extrair para um módulo exigiria importar/exportar ~8 símbolos sem ganho de leitura neste momento. Se o arquivo crescer, a extração fica mais fácil com a função já isolada.

A função não recebe `req`/`res` e não chama `res.json()`. Retorna `responseBody` e escreve diretamente no cache. O handler passa a ser:

```javascript
app.get('/api/cobertura-ixc', async (req, res) => {
    const cached = cacheGet(CACHE_KEY_COB);
    if (cached.hit && !cached.stale) return res.json({ ...cached.data, cacheStatus: 'HIT' });
    if (cached.hit && cached.stale) {
        if (!_coberturaRevalidando) revalidarCobertura(); // fire-and-forget, sem await
        return res.json({ ...cached.data, cacheStatus: 'STALE' });
    }
    // MISS: bloqueia e constrói
    const result = await buildCoberturaCache();
    return res.json({ ...result, cacheStatus: 'MISS' });
});
```

### D2. SWR implementado no `cache.js`, não no handler

O contrato de `cacheGet` e `cacheSet` é estendido em vez de adicionar lógica de stale no handler:

```javascript
// cacheSet: novo parâmetro opcional
cacheSet(key, data, ttlMs, staleWindowMs = 0)
// Armazena: { data, expiresAt: now + ttlMs, staleUntil: now + ttlMs + staleWindowMs }

// cacheGet: três estados
// { hit: true, stale: false, data }  → dentro do TTL
// { hit: true, stale: true, data }   → expirado, dentro de staleUntil
// { hit: false }                     → além de staleUntil (ou sem stale configurado)
```

Alternativa considerada: adicionar `cacheGetStale(key)` separado. Rejeitada — enriquece `cacheGet` sem breaking change (itens sem `staleWindowMs` têm `staleUntil = expiresAt`, então o comportamento atual é preservado).

### D3. Flag de revalidação em voo (`_coberturaRevalidando`) em memória

Uma variável booleana em escopo de módulo controla se já há um rebuild em curso. Antes de disparar o rebuild, o handler verifica e seta a flag; `buildCoberturaCache()` a limpa ao terminar (sucesso ou erro).

Alternativa considerada: checar a existência de uma chave de "lock" no cache. Rejeitada — o in-memory é mais simples e suficiente; o processo Node é single-threaded para esse propósito.

### D4. Warmup em `server.on('listening')`, não após `pool.connect()`

O warmup deve ocorrer depois que a porta está aberta. O ponto mais seguro é dentro do callback de `app.listen()` / `server.on('listening')`. O bloco `iniciarServidor()` ([server.js:4200](backend/server.js#L4200)) já centraliza o `app.listen()` — é onde a chamada fire-and-forget vai.

Não deve ser após `pool.connect()` porque o servidor pode demorar mais para começar a escutar do que o tempo de conexão ao banco.

### D5. Janela stale de 30 min para cobertura (`COBERTURA_SWR_WINDOW`)

TTL: 10 min → dado atualizado.
Stale window: 30 min → até 40 min no total antes de virar MISS real.

Decisão confirmada com o usuário: dado de até 40 min atrás é aceitável para a operação da Central de Cobertura. A constante `TTL.COBERTURA_SWR_WINDOW = 1800 * 1000` (30 min) entra em `cache.js`, configurável via `process.env.CACHE_STW_COBERTURA`.

## Risks / Trade-offs

**Janela de vulnerabilidade no startup** → os primeiros ~349s após restart, um usuário que chegar antes do warmup terminar ainda paga o custo do MISS. Aceito: deploys ocorrem em horários de baixo tráfego, e o warmup começa imediatamente.

**Dado stale até 40 min** → a operação verá números levemente defasados quando o cache está sendo renovado. Aceito: `cacheStatus: 'STALE'` na resposta permite que o front exiba um indicador se necessário.

**Erro no rebuild em background** → se `buildCoberturaCache()` falha, `_coberturaRevalidando` é limpa, o dado stale continua sendo servido, e o próximo request tenta novamente. Risco: se o IXC ficar instável por mais de 40 min, o endpoint passa a retornar MISS (bloqueante) em vez de stale. Aceitável: é o comportamento degradado esperado.

**`cacheSet` com `staleWindowMs` aplicado a outros usos** → o parâmetro é opcional com default 0. Todos os `cacheSet` existentes que não passam o 4º argumento se comportam exatamente como antes.

## Migration Plan

1. Alterar `cache.js` (D2) — sem impacto nos callers existentes.
2. Extrair `buildCoberturaCache()` de `server.js` (D1) — comportamento preservado.
3. Refatorar handler de `/api/cobertura-ixc` para SWR (D1, D3).
4. Adicionar warmup em `iniciarServidor()` (D4).
5. Verificar em execução: logs de startup devem mostrar o warmup iniciando; resposta ao 2º request deve ter `cacheStatus: 'HIT'`.
6. Rollback: reverter os 4 passos acima. Nenhuma migração de schema, nenhum dado escrito.
