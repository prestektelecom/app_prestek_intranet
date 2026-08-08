## Context

O endpoint `/api/cobertura-ixc` ([backend/server.js:3129](backend/server.js#L3129)) monta as regiões do mapa em cinco passos: pagina `cliente_contrato` com `status = 'A'`, agrupa por `cidade::bairro`, resolve nomes via `/cidade`, mescla overrides manuais de `cobertura_cidades` e ordena. O agrupamento lê `c.cidade` e `c.bairro` do próprio contrato.

O IXC guarda esses campos como colunas anuláveis e indexadas em `cliente_contrato` (`bairro varchar(100) null=YES [MUL]`, `cidade int(11) null=YES [MUL]`), mas só as preenche quando o contrato tem endereço próprio. O campo que decide isso é `endereco_padrao_cliente enum('S','N') null=NO`, com default `'S'` — herdar do cliente é o comportamento padrão do sistema, não a exceção.

Medição contra o IXC de produção (07/08/2026, 21.173 contratos ativos):

```
                        SEM cidade    COM cidade
  endereco_padrao = S      19.099            63
  endereco_padrao = N           0         2.011

preenchimento no CONTRATO      preenchimento no CLIENTE (48.695)
  cidade      9,8%               cidade      100,0%
  bairro      9,8%               bairro      100,0%
  endereco    9,8%               endereco    100,0%
  latitude    0,3%               latitude     96,8%
  cidade_novo 0,0%               uf          100,0%
```

Os campos `*_novo` (bloco de mudança de endereço) estão zerados em toda a base — não são uma fonte a considerar.

O mapa mostra hoje 198 regiões / 2.075 contratos. A simulação do join resolve 21.172 contratos em 333 regiões e 27 cidades, sem nenhum registro irrecuperável.

Restrições: a API do IXC tem teto de 9.999 registros por página e não suporta operador `in`, então buscas em lote são "traz tudo e filtra em memória" — padrão já adotado pelo passo 3 do endpoint atual. O cache in-memory ([backend/cache.js](backend/cache.js)) usa TTL de 10 min para cobertura.

## Goals / Non-Goals

**Goals:**
- Levar a cobertura de contratos localizados de 9,8% para ~100%, sem alterar o shape do JSON de resposta.
- Tornar a procedência do endereço observável (por região e nos agregados de `meta`), para que a operação possa auditar sem rodar script.
- Usar as coordenadas reais que já existem no cadastro do cliente em vez de geocodificar o centroide da cidade.
- Corrigir a resolução de UF, hoje hardcoded em dois estados.

**Non-Goals:**
- Mudar a UI da Central de Cobertura — apresentação é escopo de `cobertura-ui-redesign`.
- Escrever ou corrigir endereços no IXC. Este change só lê.
- Substituir o cache in-memory por algo persistente.
- Deduplicar bairros por similaridade fonética ou fuzzy matching. Só normalização determinística.

## Decisions

### D1. Fallback em cascata contrato → cliente, e não chaveado por `endereco_padrao_cliente`

A regra de resolução é: **usa o endereço do contrato quando `cidade` estiver preenchida; senão, o do cliente vinculado por `id_cliente`.**

Alternativa considerada: ramificar por `endereco_padrao_cliente === 'S'`. Rejeitada porque os dados mostram 63 contratos com `endereco_padrao = 'S'` que **têm** endereço próprio preenchido — dado sujo/legado que a regra semântica descartaria. A cascata por preenchimento absorve os dois casos e é resiliente a inconsistência de flag. O campo `endereco_padrao_cliente` continua útil para diagnóstico, não para controle de fluxo.

O endereço do contrato tem precedência deliberada: quando existe, é o endereço de *instalação*, mais específico que o cadastral.

### D2. Buscar `/cliente` inteiro e indexar em memória

Não há operador `in` na API do IXC. As opções eram (a) uma chamada por cliente — ~19 mil requisições, inviável; (b) paginar `/cliente` completo — 5 páginas de 9.999, em paralelo, e montar um índice `id → cliente`.

Escolhemos (b), coerente com o que o passo 3 já faz para `/cidade`. Custo: ~5 requisições e um mapa de 48.695 entradas em memória, pago uma vez a cada 10 min de TTL. As páginas 2..N vão em paralelo, como já é feito com contratos.

O índice deve reter apenas os campos usados (`cidade`, `bairro`, `latitude`, `longitude`, `uf`) em vez do registro inteiro — os registros de cliente têm 166 campos e a maioria é irrelevante aqui.

Cache com chave própria (`cobertura-ixc:clientes`), separada do resultado, para que `/api/cobertura-ixc/contratos-bairro` possa reusar sem refazer a busca.

### D3. Centroide de coordenadas reais, Nominatim só como fallback

87,6% dos contratos (18.542) herdam `latitude`/`longitude` do cliente. A coordenada da região passa a ser a **média dos pontos dos seus contratos**, calculada no passo de agregação.

Precedência: override manual em `cobertura_cidades` > centroide de coordenadas reais > geocodificação Nominatim > sem coordenada. O override manual continua no topo porque é a única fonte que representa decisão humana explícita.

Alternativa considerada: mediana em vez de média, mais robusta a outliers (coordenada errada num cadastro). Ficamos na média por simplicidade, com uma salvaguarda: descartar pontos fora de um bounding box plausível do Nordeste antes de agregar. Se o resultado se mostrar instável, trocar por mediana é uma mudança local.

Isso derruba as chamadas ao Nominatim de ~198 para o punhado de regiões sem nenhum ponto — ganho de latência que compensa a chamada extra a `/cliente` da D2.

### D4. UF resolvida via `/uf`, com o mapa hardcoded como fallback

Existem 15 IDs de UF distintos no cadastro (`7`=AL com 36.696, `28`=SE com 11.827, e mais 13 IDs somando ~170 clientes). O código atual (`IXC_UF_MAP` em [server.js:3147](backend/server.js#L3147) e o duplicado `IXC_UF_MAP_GLOBAL` em [server.js:3360](backend/server.js#L3360)) mapeia só dois e cai em `'AL'` para todo o resto.

Passa a buscar `/uf` uma vez e montar `id → sigla`, com TTL longo (a tabela é estática). As duas constantes duplicadas são consolidadas numa só, mantida como fallback caso a chamada falhe — degradar para o comportamento atual é melhor que quebrar o endpoint.

A UF vem da **cidade**, não do cliente: `cidade.uf` é a fonte correta, já que o cliente pode ter UF cadastral divergente da cidade de instalação.

### D5. Normalização determinística de bairro, compartilhada com o front

A chave de região é `${cidade_ixc_id}::${bairro}`, gerada no backend e reconstruída no front por `chaveRegiao()` em [src/components/coverage/constants.js:33](src/components/coverage/constants.js#L33). As duas precisam produzir o mesmo resultado ou o mapa deixa de casar com a lista.

A normalização passa de `trim().toUpperCase()` para `trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'')`. Só remoção de acento e caixa — nada de abreviação (`JD.` → `JARDIM`) ou fuzzy, que criariam falsos positivos sem supervisão.

Impacto medido: 383 bairros distintos, 4 pares colidem (`FATIMA≡FÁTIMA`, `SAO PEDRO≡SÃO PEDRO`, `OLHO DAGUA≡OLHO D AGUA`, `SITIO BÉLEM≡SITIO BELEM`).

**Risco de migração dos overrides: verificado e descartado.** Existem apenas 3 registros em `cobertura_cidades` (`1683::CHINARE`, `1758::BREJAO`, `1792::ALTO SANTO ANTONIO`), nenhum com acento. Nenhuma migração de dados é necessária. O passo de merge deve, ainda assim, normalizar a chave do lado do banco na leitura, para que overrides futuros com acento casem corretamente.

### D6. Procedência exposta, não inferida

Cada região ganha `origem_endereco: 'contrato' | 'cliente'`. Quando uma região mistura as duas origens, vence `'contrato'` — sinaliza que ao menos parte dos dados é de instalação.

`meta` ganha `total_via_contrato`, `total_via_cliente` e `total_com_coordenada_real`, ao lado dos campos existentes. `total_sem_localizacao` permanece na resposta — deve ir a zero, e é justamente por isso que continua sendo o indicador de regressão mais barato que temos.

## Risks / Trade-offs

**O número na tela decuplica sem aviso** → 2.075 → ~21.172 contratos e 198 → ~333 regiões. Quem usa a Central de Cobertura vai ver os totais mudarem de um deploy para o outro e pode ler como bug. Mitigação: comunicar à operação antes do deploy, e usar os contadores de `meta` para demonstrar de onde vieram os 19.098 contratos recuperados.

**Latência do primeiro request (cache MISS) aumenta** → soma-se a busca de 5 páginas de `/cliente` (48.695 registros) aos 3 de contratos. Mitigação parcial: as páginas vão em paralelo, e a queda de ~198 chamadas ao Nominatim para quase zero compensa boa parte. Se ainda assim ficar ruim, o próximo passo é pré-aquecer o cache num job.

**Memória**: mapa de 48.695 clientes somado aos 21.173 contratos brutos já cacheados → mitigado retendo só os 5 campos usados por cliente (D2), não o registro de 166 campos.

**Coordenada de cadastro pode ser imprecisa** → clientes geocodificados por CEP caem no centroide do CEP, não na casa. Para agregação por bairro isso é irrelevante; para override manual, não muda nada, já que o override tem precedência. O bounding box da D3 é a salvaguarda contra o caso patológico.

**Acoplamento front/back na chave de região** → se a normalização mudar só num lado, mapa e lista divergem silenciosamente (falha que já aconteceu neste componente com as cores de status, segundo o comentário em [constants.js:1-4](src/components/coverage/constants.js#L1-L4)). Mitigação: alterar `chaveRegiao()` e o agrupamento do backend na mesma task, com teste que confronta as duas.

**`/uf` pode não existir ou não responder** → o fallback para o mapa hardcoded mantém o comportamento atual em vez de derrubar o endpoint.

## Migration Plan

1. Implementar atrás do comportamento existente, comparando resultados via os contadores de `meta` antes de considerar concluído.
2. Validar em execução real: `total_sem_localizacao` deve ir a `0`, `total_via_contrato + total_via_cliente` deve igualar o total de contratos ativos.
3. Conferir as 3 regiões com override manual — devem continuar exibindo tecnologia, status e coordenada configurados.
4. Avisar a operação da mudança de escala dos números.

Rollback: a mudança é confinada ao endpoint e a `chaveRegiao()`; reverter o commit restaura o comportamento anterior. Nenhuma migração de schema, nenhum dado escrito.

## Open Questions

- **Contrato ativo vs. internet ativa**: o filtro é `cliente_contrato.status = 'A'`, mas o breakdown já distingue `status_internet` (`'CA'` bloqueio automático, `'FA'` financeiro em atraso, `'D'` desativado). "Cobertura" deveria contar contrato ativo ou login ativo? Este change preserva o critério atual; vale confirmar com a operação se é o pretendido.
- **Endereço de cobrança**: o cadastro do cliente tem também `bairro_cob`/`cidade_cob`. Assumimos que o endereço de instalação é o `bairro`/`cidade` principal. Confirmar que não há caso onde a instalação está no par `_cob`.
- **Média ou mediana** para o centroide (D3) — decidir com dados depois da primeira execução, se aparecerem regiões com centroide visivelmente deslocado.
