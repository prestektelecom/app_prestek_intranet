## 1. Fundação — busca e indexação de clientes

- [ ] 1.1 Extrair um helper de paginação do IXC a partir do padrão já usado em `/api/cobertura-ixc` (página 1 para descobrir o total, páginas 2..N em paralelo, `rp = 9999`)
- [ ] 1.2 Implementar a busca paginada de `/cliente` usando o helper, retornando um índice `id → { cidade, bairro, latitude, longitude, uf }` (apenas esses campos, nunca o registro completo)
- [ ] 1.3 Adicionar a chave de cache `cobertura-ixc:clientes` com TTL próprio em [backend/cache.js](backend/cache.js), separada de `cobertura-ixc:resultado`
- [ ] 1.4 Envolver a busca de clientes em tratamento de erro que degrada para índice vazio, sem derrubar o endpoint
- [ ] 1.5 Verificar que o número de clientes indexados bate com o `total` informado pela API

## 2. Resolução de UF

- [ ] 2.1 Implementar a busca de `/uf` do IXC montando o mapa `id → sigla`, com cache de TTL longo
- [ ] 2.2 Consolidar `IXC_UF_MAP` ([server.js:3147](backend/server.js#L3147)) e `IXC_UF_MAP_GLOBAL` ([server.js:3360](backend/server.js#L3360)) em uma única constante de fallback
- [ ] 2.3 Fazer a resolução de UF usar o mapa vindo de `/uf`, caindo para a constante de fallback quando a consulta falhar
- [ ] 2.4 Derivar a UF da região a partir da cidade da região, não do cadastro do cliente
- [ ] 2.5 Conferir que ao menos uma região fora de AL/SE aparece com a sigla correta

## 3. Normalização de bairro

- [ ] 3.1 Criar a função de normalização (`trim` + caixa alta + `normalize('NFD')` + remoção de diacríticos), sem abreviações nem correspondência aproximada
- [ ] 3.2 Aplicar a normalização no agrupamento do backend
- [ ] 3.3 Aplicar a mesma normalização em `chaveRegiao()` ([src/components/coverage/constants.js:33](src/components/coverage/constants.js#L33)), na mesma alteração, para que backend e frontend não divirjam
- [ ] 3.4 Aplicar a normalização também à chave lida de `cobertura_cidades` no merge de overrides
- [ ] 3.5 Confirmar que `FATIMA`/`FÁTIMA`, `SAO PEDRO`/`SÃO PEDRO`, `OLHO DAGUA`/`OLHO D AGUA` e `SITIO BELEM`/`SITIO BÉLEM` colapsam em uma região cada
- [ ] 3.6 Confirmar que `JD. DAS ACACIAS` e `JARDIM DAS ACACIAS` permanecem regiões distintas

## 4. Cascata de resolução de endereço

- [ ] 4.1 Implementar a resolução por preenchimento de `cidade`: endereço do contrato quando presente, senão o do cliente por `id_cliente`
- [ ] 4.2 Registrar `origem_endereco` (`'contrato' | 'cliente'`) por contrato durante o agrupamento
- [ ] 4.3 Definir `origem_endereco` da região como `'contrato'` quando ela mistura as duas origens
- [ ] 4.4 Contabilizar em `total_sem_localizacao` apenas os contratos sem `cidade` em ambas as fontes
- [ ] 4.5 Verificar que os 63 contratos com `endereco_padrao_cliente = 'S'` e endereço próprio usam o endereço do contrato

## 5. Coordenadas

- [ ] 5.1 Definir o bounding box de plausibilidade e descartar pontos fora dele antes de agregar
- [ ] 5.2 Calcular o centroide das coordenadas reais dos contratos de cada região
- [ ] 5.3 Implementar a precedência: override manual > centroide real > geocodificação > sem coordenada
- [ ] 5.4 Chamar `/api/geocodificar` apenas para regiões sem nenhuma coordenada real
- [ ] 5.5 Conferir no mapa que bairros da mesma cidade deixaram de compartilhar o mesmo ponto

## 6. Resposta e observabilidade

- [ ] 6.1 Adicionar `total_via_contrato`, `total_via_cliente` e `total_com_coordenada_real` a `meta`
- [ ] 6.2 Adicionar `origem_endereco` a cada região de `dados`
- [ ] 6.3 Confirmar que nenhum campo existente da resposta foi removido ou renomeado
- [ ] 6.4 Ajustar `/api/cobertura-ixc/contratos-bairro` para enxergar o endereço resolvido, reusando o cache de clientes

## 7. Validação contra produção

- [ ] 7.1 Executar o endpoint com cache limpo e conferir `meta.total_sem_localizacao === 0`
- [ ] 7.2 Conferir que `total_via_contrato + total_via_cliente + total_sem_localizacao` iguala o total de contratos ativos
- [ ] 7.3 Conferir a ordem de grandeza esperada: ~21.172 contratos, ~333 regiões, 27 cidades
- [ ] 7.4 Conferir que as 3 regiões com override (`1683::CHINARE`, `1758::BREJAO`, `1792::ALTO SANTO ANTONIO`) mantêm tecnologia, status e coordenada configurados
- [ ] 7.5 Medir a latência do primeiro request (cache MISS) e registrar o resultado; abrir tarefa de pré-aquecimento se ficar inaceitável
- [ ] 7.6 Conferir na UI que mapa, lista e modal continuam casando após a mudança de chave de região

## 8. Fechamento

- [ ] 8.1 Comunicar à operação a mudança de escala dos números (2.075 → ~21.172 contratos, 198 → ~333 regiões) antes do deploy
- [ ] 8.2 Levar as questões em aberto do design a quem decide: critério contrato ativo vs. internet ativa, e uso de `bairro_cob`/`cidade_cob`
- [ ] 8.3 Revisitar a escolha média vs. mediana no centroide, com base nas regiões observadas na validação
