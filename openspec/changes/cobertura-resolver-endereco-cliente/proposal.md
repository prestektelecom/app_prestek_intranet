## Why

A Central de Cobertura de Rede exibe hoje **9,8% da rede real**: 2.075 de 21.175 contratos ativos. O endpoint `/api/cobertura-ixc` lê `bairro` e `cidade` direto do registro de `cliente_contrato`, mas o IXC **não materializa** essas colunas quando o contrato usa `endereco_padrao_cliente = 'S'` — o endereço vive apenas no cadastro do cliente. Como esse é o padrão do sistema (`default 'S'`, `null=NO`), 19.100 contratos chegam com `cidade = '0'` e `bairro = ''` e são descartados silenciosamente em `total_sem_localizacao`.

Diagnóstico executado contra o IXC de produção em 07/08/2026 confirma a correlação:

```
                        SEM cidade    COM cidade
  endereco_padrao = S      19.099            63
  endereco_padrao = N           0         2.011
```

O dado perdido é integralmente recuperável: o cadastro do cliente tem `cidade`, `bairro`, `endereco`, `cep` e `uf` preenchidos em **100%** dos 48.695 registros, e `latitude`/`longitude` em **96,8%**. Simulação do join `contrato → id_cliente → cliente` resolve **21.172 de 21.173 contratos (100%)** em **333 regiões** e **27 cidades**, com **zero registros irrecuperáveis**.

## What Changes

- **BREAKING (dados, não API)**: `/api/cobertura-ixc` passa a resolver o endereço com fallback em cascata — endereço do contrato quando preenchido, senão o do cliente vinculado por `id_cliente`. Os números exibidos na tela saltam de 2.075 para ~21.172 contratos e de 198 para ~333 regiões. O contrato de resposta (shape do JSON) não muda; a contagem sim.
- Cada região passa a expor `origem_endereco` (`'contrato' | 'cliente'`) para auditoria e para a UI poder sinalizar a procedência.
- Coordenadas reais substituem geocodificação: **87,6% dos contratos (18.542)** têm `latitude`/`longitude` no cadastro do cliente. A região recebe o centroide dos pontos reais dos seus contratos; a chamada ao Nominatim vira fallback apenas para regiões sem nenhuma coordenada.
- Correção do mapa de UF: `IXC_UF_MAP` cobre hoje apenas `{'7':'AL','28':'SE'}` com fallback silencioso para `'AL'`. Existem **15 IDs de UF distintos** no cadastro; ~172 clientes fora de AL/SE são rotulados incorretamente. O mapa passa a ser resolvido via endpoint `/uf` do IXC, com cache.
- Normalização de bairro ganha remoção de acentos (`normalize('NFD')`), eliminando 4 pares duplicados confirmados (`FATIMA≡FÁTIMA`, `SAO PEDRO≡SÃO PEDRO`, `OLHO DAGUA≡OLHO D AGUA`, `SITIO BELEM≡SITIO BÉLEM`) em 383 bairros distintos.
- `meta` da resposta ganha `total_via_contrato`, `total_via_cliente` e `total_com_coordenada_real` para tornar a procedência observável sem novo diagnóstico.

Fora de escopo: alterar a UI da Central de Cobertura (coberta por `cobertura-ui-redesign`), e escrever endereço de volta no IXC.

## Capabilities

### New Capabilities
- `cobertura-dados-ixc`: origem, resolução e agregação dos dados de cobertura vindos do IXC — regra de fallback de endereço contrato→cliente, resolução de UF, normalização de bairro, derivação de coordenadas e os contadores de procedência expostos em `meta`.

### Modified Capabilities
<!-- Nenhuma. `cobertura-ui-redesign` cobre apresentação; nenhum de seus requisitos muda. -->

## Impact

**Código**
- [backend/server.js](backend/server.js) — endpoint `/api/cobertura-ixc` (~L3129-3325): passos 1-5 da montagem. Também `IXC_UF_MAP` (L3147) e `IXC_UF_MAP_GLOBAL` (L3360), hoje duplicados.
- [backend/server.js](backend/server.js) — `/api/cobertura-ixc/contratos-bairro`, que reusa o cache `cobertura-ixc:contratos-brutos` e precisa enxergar o endereço resolvido.
- [backend/server.js](backend/server.js) — `/api/geocodificar` deixa de ser o caminho principal; permanece como fallback.
- [src/components/coverage/constants.js](src/components/coverage/constants.js) — `chaveRegiao()` deve acompanhar a normalização de bairro para que map, lista e modal continuem batendo.

**Chamadas externas ao IXC**
- Nova: `/cliente` paginado (48.695 registros ≈ 5 páginas de 9.999), buscado em paralelo como já se faz com contratos.
- Nova: `/uf` (uma chamada, cacheável por longo período).
- Reduzida: Nominatim passa de ~198 chamadas para apenas as regiões sem coordenada.

**Cache**
- `cobertura-ixc:resultado` e `cobertura-ixc:contratos-brutos` (TTL 10 min) permanecem; a chave de clientes precisa de TTL próprio.

**Banco local**
- `cobertura_cidades` (overrides manuais) — chaves `cidade_ixc_id::bairro` existentes foram gravadas com a normalização antiga (trim+uppercase, com acento). Ao introduzir remoção de acentos, overrides de bairros acentuados podem deixar de casar. Requer verificação e possível migração.

**Risco**
- O salto de 2.075 → 21.172 contratos muda drasticamente números que a operação já vê na tela. A mudança precisa ser comunicada, não apenas publicada.
