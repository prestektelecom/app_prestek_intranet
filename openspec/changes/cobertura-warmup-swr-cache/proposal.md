## Why

O endpoint `/api/cobertura-ixc` demora **~349 segundos** no primeiro request após o servidor subir (cache MISS). Isso acontece porque a busca sequencial de ~21k contratos + ~48k clientes no IXC é feita sob demanda, bloqueando o usuário que chega com o cache frio. O change `cobertura-resolver-endereco-cliente` documentou esse problema na task 7.5 e abriu as tasks 9.1–9.3 para resolução — este change as implementa.

## What Changes

- **`buildCoberturaCache()`**: toda a lógica de paginação, join contrato→cliente, agregação e `cacheSet` é extraída do handler `GET /api/cobertura-ixc` para uma função standalone assíncrona, sem `res`/`req`. O handler passa a ser um roteador fino que consulta o cache e delega o rebuild a essa função.
- **Pré-aquecimento na subida** (task 9.1): após `app.listen()`, `buildCoberturaCache()` é chamada em fire-and-forget. O servidor já está respondendo enquanto o cache aquece em background. A janela de vulnerabilidade (~349s após startup) é aceita como comportamento esperado.
- **Stale-While-Revalidate no `cache.js`** (task 9.2): `cacheSet` ganha parâmetro `staleWindowMs` opcional. `cacheGet` passa a retornar `{ hit: true, stale: true, data }` quando o item expirou mas ainda está dentro da janela stale. O handler serve o dado stale imediatamente e dispara `buildCoberturaCache()` em background (uma única corrida por vez via flag de revalidação em voo).
- **Task 9.3 implicitamente resolvida**: a busca de contratos brutos é parte de `buildCoberturaCache()` — quando o rebuild roda em background, ambos os caches (`cobertura-ixc:resultado` e `cobertura-ixc:contratos-brutos`) são renovados juntos.
- **TTL stale de cobertura**: 30 minutos além dos 10 min de TTL atual. Dado de até 40 min atrás é aceitável para a operação da Central de Cobertura.
- **`cacheStatus`** na resposta passa a incluir `'STALE'` além de `'HIT'` e `'MISS'`, para que o frontend possa exibir um indicador discreto quando o dado está sendo renovado.

## Capabilities

### New Capabilities
- `cobertura-cache-swr`: comportamento de cache da Central de Cobertura — pré-aquecimento na subida do servidor e revalidação stale-while-revalidate para que nenhum usuário pague o custo do rebuild em foreground.

### Modified Capabilities
<!-- Nenhuma. O shape do JSON de resposta não muda (exceto pelo valor de `cacheStatus`); os requisitos de negócio da Central de Cobertura permanecem inalterados. -->

## Impact

**Código**
- [`backend/cache.js`](backend/cache.js): `cacheSet` ganha parâmetro `staleWindowMs`; `cacheGet` retorna campo `stale`.
- [`backend/server.js`](backend/server.js): extração de `buildCoberturaCache()` (L3365–L3568), refatoração do handler de `/api/cobertura-ixc` para SWR, e chamada de warmup em `iniciarServidor()`.

**APIs**
- `GET /api/cobertura-ixc`: `cacheStatus` pode ser `'HIT'`, `'MISS'` ou `'STALE'` (novo). Nenhum outro campo muda.

**Dependências**
- Nenhuma dependência nova.

**Risco**
- Baixo: mudança confinada ao mecanismo de cache e à estrutura interna do handler. A lógica de negócio (join, agregação, normalização) não é alterada.
