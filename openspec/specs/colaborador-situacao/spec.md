# colaborador-situacao Specification

## Purpose
A situação de vínculo do colaborador — Ativo, Férias, Afastado, Inativo — como dado de primeira classe da tela: extraída de onde ela realmente vive, exibida como metadado e disponível como filtro.

## Requirements

### Requirement: Situação extraída do prefixo do nome
O módulo `src/components/directory/statusColaborador.js` SHALL extrair a situação do prefixo entre parênteses de `funcionario_nome`, e SHALL retornar o nome já sem esse prefixo.

O IXC devolve a situação operacional dentro do nome, não no campo `ativo`:

```
"(INATIVO) LUANA DOS SANTOS SILVA ROCHA MARIA "   ativo='N'
"(AFASTADO) JOYCE DE MELO OLIVEIRA"               ativo='S'
"(FÉRIAS) ALAINE SILVA DOS SANTOS"                ativo='S'
"(FERIAS)MICHELE DA SILVA SANTANA "               ativo='N'
```

A extração SHALL tolerar as variações reais da base: ausência de espaço após o parêntese, espaço à esquerda e à direita do nome, e grafia com e sem acento.

#### Scenario: Prefixo conhecido vira rótulo
- **WHEN** o nome começa com "(FÉRIAS)", "(FERIAS)", "(AFASTADO)", "(AFASTADA)", "(INATIVO)" ou "(INATIVA)"
- **THEN** a situação recebe o rótulo normalizado correspondente e o nome retornado não contém o prefixo

#### Scenario: Prefixo desconhecido é preservado
- **WHEN** o nome começa com um prefixo fora do mapa, como "(NPS)"
- **THEN** o texto original do prefixo é exibido como rótulo, sem capitalização, em vez de ser descartado

#### Scenario: Sem prefixo, a flag decide
- **WHEN** o nome não tem prefixo
- **THEN** o rótulo vem de `ativo === 'S'` → "Ativo", caso contrário "Inativo"

### Requirement: Divergência entre prefixo e flag é sinalizada
Quando o prefixo do nome e a flag `ativo` discordam, a situação SHALL ser marcada como divergente, e a UI SHALL exibir um indicador junto ao rótulo com `title` e `aria-label` explicando o conflito.

A tela SHALL NOT escolher silenciosamente uma das duas fontes.

#### Scenario: Férias com flag inativa
- **WHEN** o colaborador tem prefixo "(FÉRIAS)" e `ativo` diferente de `'S'`
- **THEN** o chip exibe "Férias" acompanhado do indicador de divergência

#### Scenario: Inativo com flag ativa
- **WHEN** o colaborador tem prefixo "(INATIVO)" e `ativo === 'S'`
- **THEN** o chip exibe "Inativo" acompanhado do indicador de divergência

### Requirement: Nome exibido em capitalização de nome próprio
`nomeProprio()` SHALL converter o nome de caixa alta para capitalização de nome próprio em pt-BR, mantendo em minúscula as partículas (`da`, `das`, `de`, `do`, `dos`, `e`, …) quando não forem a primeira palavra, e capitalizando cada parte de nomes compostos por hífen.

#### Scenario: Partículas preservadas
- **WHEN** o nome é "LUANA DOS SANTOS SILVA ROCHA MARIA"
- **THEN** é exibido como "Luana dos Santos Silva Rocha Maria"

#### Scenario: Nome composto por hífen
- **WHEN** o nome é "MARIA-CLARA DE ANDRADE"
- **THEN** é exibido como "Maria-Clara de Andrade"

### Requirement: Filtro por situação
A toolbar SHALL exibir um filtro de situação com contagem por rótulo, à frente do filtro por departamento.

Rótulos com contagem zero SHALL ser omitidos, exceto quando forem o filtro ativo. A contagem SHALL ser calculada antes da aplicação do próprio filtro de situação, mas depois da busca e do filtro de departamento.

#### Scenario: Filtrar quem está de férias
- **WHEN** o usuário aciona o chip "Férias"
- **THEN** apenas colaboradores com essa situação são listados, e o chip é marcado com `aria-pressed="true"`

#### Scenario: Contagens não colapsam ao filtrar
- **WHEN** um filtro de situação está ativo
- **THEN** os demais chips continuam exibindo suas contagens reais, e não zero

#### Scenario: Combinação com departamento
- **WHEN** há filtro de departamento e de situação ativos
- **THEN** ambos são aplicados, e as contagens de situação refletem apenas o departamento selecionado

### Requirement: Busca insensível a acento
O índice de busca SHALL incluir o nome limpo, o nome bruto, o e-mail e o ramal, todos normalizados sem diacríticos.

Sem isso, metade da base — que tem nomes acentuados — só é encontrável digitando o acento exato.

#### Scenario: Busca sem acento encontra nome acentuado
- **WHEN** o usuário digita "jose"
- **THEN** "José" é encontrado

#### Scenario: Busca encontra pelo nome sem o prefixo
- **WHEN** o usuário digita o nome de alguém cujo cadastro tem prefixo de situação
- **THEN** o colaborador é encontrado, tanto pelo nome limpo quanto pelo nome bruto
