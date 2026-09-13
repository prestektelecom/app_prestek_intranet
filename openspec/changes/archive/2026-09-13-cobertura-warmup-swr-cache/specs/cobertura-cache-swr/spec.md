## Purpose

Garante que a Central de Cobertura de Rede responda em menos de 200ms para qualquer usuário, eliminando o custo de 349 segundos que hoje recai sobre o primeiro request após o servidor subir ou o cache expirar.

## ADDED Requirements

### Requirement: Cache pré-aquecido na subida do servidor
O servidor SHALL iniciar o processo de construção do cache de cobertura imediatamente após `app.listen()`, em background (fire-and-forget), sem bloquear a aceitação de conexões.

#### Scenario: Warmup inicia sem bloquear o servidor
- **WHEN** o servidor é iniciado
- **THEN** o log registra o início do pré-aquecimento e o servidor aceita requisições imediatamente, antes do cache estar pronto

#### Scenario: Warmup falha silenciosamente
- **WHEN** o warmup em background falha (ex: IXC indisponível na subida)
- **THEN** o servidor continua operando normalmente; a falha é logada como warning; o próximo request ao endpoint disparará a construção normalmente

### Requirement: Dado stale servido imediatamente enquanto o cache é renovado
O endpoint `/api/cobertura-ixc` SHALL retornar o dado em cache imediatamente quando o TTL de 10 minutos expirar, desde que o dado não tenha mais de 40 minutos (janela stale de 30 min além do TTL). A renovação do cache SHALL ocorrer em background, fora do ciclo do request.

#### Scenario: Cache expirado dentro da janela stale
- **WHEN** um request chega após os 10 minutos de TTL e antes dos 40 minutos da janela stale
- **THEN** a resposta é retornada imediatamente com o dado anterior e `cacheStatus: 'STALE'`; um processo de renovação é iniciado em background

#### Scenario: Apenas uma renovação em voo por vez
- **WHEN** múltiplos requests chegam com cache stale e já há uma renovação em andamento
- **THEN** todos recebem o dado stale imediatamente; nenhum request adicional inicia nova renovação; apenas um rebuild roda em background

#### Scenario: Cache completamente expirado (além da janela stale)
- **WHEN** um request chega após os 40 minutos (além da janela stale)
- **THEN** o endpoint bloqueia o request e constrói o cache em foreground, retornando `cacheStatus: 'MISS'` ao concluir

### Requirement: Campo `cacheStatus` indica a procedência da resposta
O campo `cacheStatus` SHALL estar presente em todas as respostas de `/api/cobertura-ixc` com um dos três valores: `'HIT'` (dado fresco do cache), `'STALE'` (dado do cache vencido sendo renovado em background) ou `'MISS'` (dado recém-construído).

#### Scenario: Resposta com dado fresco
- **WHEN** o cache está válido (dentro do TTL de 10 min)
- **THEN** `cacheStatus` é `'HIT'`

#### Scenario: Resposta com dado stale
- **WHEN** o cache expirou mas está dentro da janela stale
- **THEN** `cacheStatus` é `'STALE'`

#### Scenario: Resposta após rebuild
- **WHEN** o cache foi construído durante o request (cache MISS ou warmup recém-concluído)
- **THEN** `cacheStatus` é `'MISS'`

### Requirement: API de cache suporta janela stale configurável
A função `cacheSet` SHALL aceitar um parâmetro opcional `staleWindowMs`. A função `cacheGet` SHALL retornar `{ hit: true, stale: true, data }` quando o item está expirado mas dentro da janela stale, e `{ hit: false }` quando está além dela.

#### Scenario: Item dentro do TTL
- **WHEN** `cacheGet` é chamado e `expiresAt > now`
- **THEN** retorna `{ hit: true, stale: false, data }`

#### Scenario: Item na janela stale
- **WHEN** `cacheGet` é chamado e `expiresAt <= now < staleUntil`
- **THEN** retorna `{ hit: true, stale: true, data }`

#### Scenario: Item além da janela stale
- **WHEN** `cacheGet` é chamado e `now >= staleUntil`
- **THEN** retorna `{ hit: false }`

#### Scenario: Item sem janela stale configurada
- **WHEN** `cacheSet` foi chamado sem `staleWindowMs` e o item expirou
- **THEN** `cacheGet` retorna `{ hit: false }` (comportamento atual preservado)
