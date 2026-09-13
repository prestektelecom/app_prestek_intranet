## 1. Fundação — busca e indexação de clientes

- [x] 1.1 Extrair um helper de paginação do IXC a partir do padrão já usado em `/api/cobertura-ixc` (página 1 para descobrir o total, páginas 2..N em paralelo, `rp = 9999`)
- [x] 1.2 Implementar a busca paginada de `/cliente` usando o helper, retornando um índice `id → { cidade, bairro, latitude, longitude, uf }` (apenas esses campos, nunca o registro completo)
- [x] 1.3 Adicionar a chave de cache `cobertura-ixc:clientes` com TTL próprio em [backend/cache.js](backend/cache.js), separada de `cobertura-ixc:resultado`
- [x] 1.4 Envolver a busca de clientes em tratamento de erro que degrada para índice vazio, sem derrubar o endpoint
- [x] 1.5 Verificar que o número de clientes indexados bate com o `total` informado pela API — `48695/48695`

## 2. Resolução de UF

- [x] 2.1 Implementar a busca de `/uf` do IXC montando o mapa `id → sigla`, com cache de TTL longo
- [x] 2.2 Consolidar `IXC_UF_MAP` e `IXC_UF_MAP_GLOBAL` em uma única constante de fallback (`IXC_UF_FALLBACK`)
- [x] 2.3 Fazer a resolução de UF usar o mapa vindo de `/uf`, caindo para a constante de fallback quando a consulta falhar
- [x] 2.4 Derivar a UF da região a partir da cidade da região, não do cadastro do cliente
- [x] 2.5 Conferir que ao menos uma região fora de AL/SE aparece com a sigla correta — surgiram `CE` (1) e `PI` (2), antes rotuladas `AL`

## 3. Normalização de bairro

- [x] 3.1 Criar a função de normalização (`trim` + caixa alta + `normalize('NFD')` + remoção de diacríticos), sem abreviações nem correspondência aproximada
- [x] 3.2 Aplicar a normalização no agrupamento do backend
- [x] 3.3 Aplicar a mesma normalização em `chaveRegiao()` ([src/components/coverage/constants.js](src/components/coverage/constants.js)), na mesma alteração, para que backend e frontend não divirjam — inclui rotear as duas construções inline de chave em [CoverageMap.jsx](src/components/CoverageMap.jsx) pelo helper
- [x] 3.4 Aplicar a normalização também à chave lida de `cobertura_cidades` no merge de overrides
- [x] 3.5 Confirmar que `FATIMA`/`FÁTIMA`, `SAO PEDRO`/`SÃO PEDRO`, `OLHO DAGUA`/`OLHO D AGUA` e `SITIO BELEM`/`SITIO BÉLEM` colapsam em uma região cada — nenhum bairro acentuado restou na resposta
- [x] 3.6 Confirmar que `JD. DAS ACACIAS` e `JARDIM DAS ACACIAS` permanecem regiões distintas — `JARDIM AMERICA` e `RESIDENCIAL JARDIM AMERICA` seguem separados

## 4. Cascata de resolução de endereço

- [x] 4.1 Implementar a resolução por preenchimento de `cidade`: endereço do contrato quando presente, senão o do cliente por `id_cliente`
- [x] 4.2 Registrar `origem_endereco` (`'contrato' | 'cliente'`) por contrato durante o agrupamento
- [x] 4.3 Definir `origem_endereco` da região como `'contrato'` quando ela mistura as duas origens
- [x] 4.4 Contabilizar em `total_sem_localizacao` apenas os contratos sem `cidade` em ambas as fontes
- [x] 4.5 Verificar que os 63 contratos com `endereco_padrao_cliente = 'S'` e endereço próprio usam o endereço do contrato — `total_via_contrato = 2074 = 2011 ('N') + 63 ('S' com endereço)`

## 5. Coordenadas

- [x] 5.1 Definir o bounding box de plausibilidade e descartar pontos fora dele antes de agregar
- [x] 5.2 Calcular o centroide das coordenadas reais dos contratos de cada região
- [x] 5.3 Implementar a precedência: override manual > centroide real > geocodificação > sem coordenada
- [x] 5.4 Chamar `/api/geocodificar` apenas para regiões sem nenhuma coordenada real — inclui derivar a coordenada do marcador de cidade do centroide dos seus bairros
- [x] 5.5 Conferir no mapa que bairros da mesma cidade deixaram de compartilhar o mesmo ponto — 294/326 regiões passam a ter coordenada própria (antes só as 3 com override manual)

## 6. Resposta e observabilidade

- [x] 6.1 Adicionar `total_via_contrato`, `total_via_cliente` e `total_com_coordenada_real` a `meta`
- [x] 6.2 Adicionar `origem_endereco` a cada região de `dados`
- [x] 6.3 Confirmar que nenhum campo existente da resposta foi removido ou renomeado
- [x] 6.4 Ajustar `/api/cobertura-ixc/contratos-bairro` para enxergar o endereço resolvido, reusando o cache de clientes

## 7. Validação contra produção

- [x] 7.1 Executar o endpoint com cache limpo e conferir `meta.total_sem_localizacao === 0`
- [x] 7.2 Conferir que `total_via_contrato + total_via_cliente + total_sem_localizacao` iguala o total de contratos ativos — `2072 + 19090 + 0 = 21162`
- [x] 7.3 Conferir a ordem de grandeza esperada: ~21.172 contratos, ~333 regiões, 27 cidades — obtido 21.162 contratos, **326** regiões, 27 cidades (a simulação previa 333 porque ainda não colapsava acentos)
- [x] 7.4 Conferir que as 3 regiões com override (`1683::CHINARE`, `1758::BREJAO`, `1792::ALTO SANTO ANTONIO`) mantêm tecnologia, status e coordenada configurados
- [x] 7.5 Medir a latência do primeiro request (cache MISS) e registrar o resultado; abrir tarefa de pré-aquecimento se ficar inaceitável — **medido, inaceitável, tarefas abertas no grupo 9**
- [x] 7.6 Verificado ao vivo (2026-09-13, Fase 9 do Impeccable): clicado "DOM CONSTANTINO" na lista — o mapa centraliza no marcador correto e abre um popup "Penedo / DOM CONSTANTINO", batendo com cidade e bairro exibidos na lista. Sem divergência observada entre lista, mapa e popup.

## 8. Fechamento

- [ ] 8.1 Comunicar à operação a mudança de escala dos números (2.075 → ~21.538 contratos, 198 → 326 regiões) — **o deploy já aconteceu**: verificado ao vivo em 2026-09-13 que a Central de Cobertura em produção já exibe os novos números. Item deixado pendente porque é uma comunicação do Felix à operação, não uma tarefa de código — registrado em MEMORIA.md.
- [ ] 8.2 Levar as questões em aberto do design a quem decide: critério contrato ativo vs. internet ativa, e uso de `bairro_cob`/`cidade_cob` — decisão de produto, não de código; registrado em MEMORIA.md.
- [ ] 8.3 Revisitar a escolha média vs. mediana no centroide, com base nas regiões observadas na validação — registrado em MEMORIA.md para uma rodada futura.

## 9. Latência do request frio (aberto por 7.5)

Medições contra produção, servidor dedicado na porta 3099:

| Cenário | Latência |
|---|---:|
| Frio: contratos + 48.695 clientes | **349 s** |
| Cache de cobertura vencido, clientes ainda quentes | **98 s** |
| Tudo em cache | **1 s** |

A coleta de clientes responde por ~250 s. Já mitigado em parte elevando `COBERTURA_CLIENTES` para 6 h — o custo passa de uma vez a cada 10 min para uma vez a cada 6 h. Os 98 s recorrentes são a busca de contratos, que já existia antes deste change.

- [x] 9.1 Implementado na change `cobertura-warmup-swr-cache` (tarefa 4.1): `buildCoberturaCache()` chamada em fire-and-forget dentro do callback de `app.listen()`.
- [x] 9.2 Implementado na change `cobertura-warmup-swr-cache` (tarefas 1-3): stale-while-revalidate completo em `cache.js`/`server.js`, com `_coberturaRevalidando` evitando corridas duplas.
- [x] 9.3 Resolvido: `buildCoberturaCache()` renova `cobertura-ixc:resultado` E `cobertura-ixc:contratos-brutos` juntos (mesma função, mesmo `await`), então a busca de contratos já ganha o mesmo tratamento sem esforço adicional.
