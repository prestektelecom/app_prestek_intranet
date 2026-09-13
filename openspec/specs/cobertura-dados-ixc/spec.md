# cobertura-dados-ixc Specification

## Purpose

Como o endpoint `/api/cobertura-ixc` resolve, a partir dos dados brutos do IXC, a localização, coordenada e procedência de cada contrato ativo — a fundação de dados sobre a qual a Central de Cobertura de Rede é construída.

## Requirements

### Requirement: Resolução de endereço em cascata contrato → cliente

O endpoint `/api/cobertura-ixc` SHALL determinar a localização de cada contrato ativo pela seguinte precedência: o endereço do próprio contrato quando o campo `cidade` estiver preenchido; caso contrário, o endereço do cliente vinculado por `id_cliente`.

A resolução SHALL ser feita pelo preenchimento do campo `cidade`, nunca pelo valor de `endereco_padrao_cliente`.

Um contrato SHALL ser contabilizado em `total_sem_localizacao` apenas quando nem o contrato nem o cliente vinculado tiverem `cidade` preenchida.

#### Scenario: Contrato com endereço próprio
- **WHEN** um contrato ativo tem `cidade` preenchida com valor diferente de `'0'` e vazio
- **THEN** a região do contrato é derivada de `contrato.cidade` e `contrato.bairro`
- **AND** a região resultante registra `origem_endereco` como `'contrato'`

#### Scenario: Contrato com endereço herdado do cliente
- **WHEN** um contrato ativo tem `cidade` igual a `'0'` ou vazia
- **AND** o cliente identificado por `id_cliente` tem `cidade` preenchida
- **THEN** a região do contrato é derivada de `cliente.cidade` e `cliente.bairro`
- **AND** a região resultante registra `origem_endereco` como `'cliente'`

#### Scenario: Flag divergente do preenchimento
- **WHEN** um contrato tem `endereco_padrao_cliente` igual a `'S'` mas possui `cidade` preenchida
- **THEN** o endereço do contrato é usado, e não o do cliente

#### Scenario: Contrato sem localização em nenhuma das fontes
- **WHEN** um contrato ativo tem `cidade` vazia e o cliente vinculado também tem `cidade` vazia ou não existe
- **THEN** o contrato é somado a `meta.total_sem_localizacao`
- **AND** o contrato não aparece em nenhuma região do mapa

#### Scenario: Região com contratos de origens distintas
- **WHEN** uma mesma região agrupa contratos resolvidos pelo contrato e contratos resolvidos pelo cliente
- **THEN** a região registra `origem_endereco` como `'contrato'`

### Requirement: Busca em lote do cadastro de clientes

O endpoint SHALL obter os registros de `/cliente` do IXC por paginação completa, respeitando o limite de 9.999 registros por página, buscando as páginas posteriores à primeira em paralelo.

O índice de clientes mantido em memória SHALL reter apenas os campos utilizados na resolução — `cidade`, `bairro`, `latitude`, `longitude` e `uf` — e não o registro completo.

O resultado SHALL ser armazenado em cache sob chave própria, distinta da chave do resultado de cobertura, de modo que outros endpoints possam reutilizá-lo sem refazer a busca.

#### Scenario: Paginação completa do cadastro
- **WHEN** o cadastro de clientes tem mais de 9.999 registros
- **THEN** o endpoint consulta a primeira página para obter o total
- **AND** consulta as páginas restantes em paralelo
- **AND** o número de clientes indexados é igual ao total informado pela API

#### Scenario: Reuso via cache
- **WHEN** uma segunda requisição ocorre dentro da validade do cache de clientes
- **THEN** nenhuma nova chamada a `/cliente` é feita ao IXC

#### Scenario: Falha na busca de clientes
- **WHEN** a consulta a `/cliente` falha
- **THEN** o endpoint responde com as regiões resolvíveis apenas pelo endereço do contrato
- **AND** os contratos não resolvidos são somados a `meta.total_sem_localizacao`

### Requirement: Coordenada da região derivada de pontos reais

Cada região SHALL receber coordenada pela seguinte precedência: override manual em `cobertura_cidades`; senão o centroide das coordenadas reais dos contratos da região; senão geocodificação via `/api/geocodificar`; senão nenhuma coordenada.

Antes de compor o centroide, coordenadas fora de um bounding box plausível para a área de atuação SHALL ser descartadas.

#### Scenario: Região com override manual de coordenada
- **WHEN** existe registro em `cobertura_cidades` com `latitude` e `longitude` para a região
- **THEN** a coordenada do override é usada, independentemente de haver coordenadas reais nos contratos

#### Scenario: Região com coordenadas reais nos contratos
- **WHEN** a região não tem override de coordenada
- **AND** ao menos um contrato da região tem `latitude` e `longitude` preenchidas e dentro do bounding box
- **THEN** a coordenada da região é o centroide desses pontos
- **AND** nenhuma chamada de geocodificação é feita para essa região

#### Scenario: Região sem nenhuma coordenada real
- **WHEN** a região não tem override e nenhum de seus contratos tem coordenada válida
- **THEN** a coordenada é obtida por geocodificação a partir do nome da cidade e da UF

#### Scenario: Coordenada fora da área plausível
- **WHEN** um contrato tem coordenada fora do bounding box definido
- **THEN** esse ponto é excluído do cálculo do centroide da região

### Requirement: Resolução de UF a partir da tabela do IXC

O endpoint SHALL resolver a sigla da UF consultando o recurso `/uf` do IXC e montando o mapa de `id` para sigla, em vez de usar uma tabela fixa no código.

A UF de uma região SHALL ser derivada da cidade da região, não do cadastro do cliente.

O mapa fixo atual SHALL ser mantido apenas como fallback para o caso de a consulta a `/uf` falhar, e SHALL existir em uma única definição compartilhada, sem duplicação no arquivo.

#### Scenario: UF fora de Alagoas e Sergipe
- **WHEN** uma região pertence a uma cidade cuja `uf` não é `'7'` nem `'28'`
- **THEN** a sigla exibida corresponde à UF real retornada por `/uf`
- **AND** a região não é rotulada como `'AL'`

#### Scenario: Falha na consulta de UF
- **WHEN** a consulta a `/uf` falha
- **THEN** o endpoint usa o mapa de fallback e continua respondendo normalmente

#### Scenario: Definição única do mapa de fallback
- **WHEN** o código do endpoint é inspecionado
- **THEN** existe uma única definição do mapa de fallback de UF, referenciada por todos os pontos que precisam dele

### Requirement: Normalização determinística de nome de bairro

O nome do bairro usado na chave de região SHALL ser normalizado por remoção de espaços nas bordas, conversão para caixa alta e remoção de acentos por decomposição Unicode.

A normalização SHALL ser idêntica no agrupamento do backend e na função `chaveRegiao()` do frontend.

A normalização SHALL ser aplicada também à chave lida de `cobertura_cidades` no momento do merge de overrides.

Abreviações e correspondência aproximada NÃO SHALL ser aplicadas.

#### Scenario: Bairros que diferem apenas por acento
- **WHEN** a base contém contratos com bairro `'FÁTIMA'` e outros com `'FATIMA'` na mesma cidade
- **THEN** ambos são agrupados em uma única região
- **AND** o total de contratos da região é a soma das duas grafias

#### Scenario: Consistência entre backend e frontend
- **WHEN** o backend gera a chave de uma região e o frontend a reconstrói via `chaveRegiao()`
- **THEN** as duas chaves são idênticas

#### Scenario: Override com bairro acentuado
- **WHEN** existe registro em `cobertura_cidades` cujo bairro contém acento
- **THEN** o override é aplicado à região correspondente

#### Scenario: Bairros distintos não são fundidos
- **WHEN** a base contém bairros com abreviações diferentes, como `'JD. DAS ACACIAS'` e `'JARDIM DAS ACACIAS'`
- **THEN** eles permanecem como regiões distintas

### Requirement: Procedência observável na resposta

A resposta de `/api/cobertura-ixc` SHALL expor, em `meta`, os campos `total_via_contrato`, `total_via_cliente` e `total_com_coordenada_real`, além dos campos já existentes.

Cada região SHALL expor o campo `origem_endereco`.

O shape existente da resposta SHALL ser preservado — nenhum campo atual pode ser removido ou renomeado.

#### Scenario: Contadores de procedência
- **WHEN** uma requisição a `/api/cobertura-ixc` é concluída com sucesso
- **THEN** `meta.total_via_contrato` somado a `meta.total_via_cliente` e a `meta.total_sem_localizacao` é igual ao total de contratos ativos coletados

#### Scenario: Campos existentes preservados
- **WHEN** um consumidor lê a resposta
- **THEN** os campos `sucesso`, `dados`, `total`, `cacheStatus` e os campos de `meta` já existentes continuam presentes com o mesmo significado

#### Scenario: Cobertura total após a correção
- **WHEN** o endpoint é executado contra a base de produção
- **THEN** `meta.total_sem_localizacao` é `0`
