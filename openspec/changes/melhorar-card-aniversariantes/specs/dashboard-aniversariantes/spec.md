## Purpose

Define como o card de aniversariantes do Dashboard apresenta os colaboradores com aniversário próximo: identidade visual (foto e fallback), legibilidade dos nomes vindos do IXC, comunicação da proximidade da data, e quais informações complementares aparecem apenas quando realmente existem.

## ADDED Requirements

### Requirement: Avatar do colaborador exibe foto real quando disponível

O card SHALL exibir a foto do colaborador como avatar quando o campo de foto estiver presente e válido. Quando não houver foto, o sistema SHALL exibir as iniciais do colaborador como fallback, mantendo as mesmas dimensões e formato circular, de modo que a altura da linha não varie entre os dois casos.

#### Scenario: Colaborador possui foto cadastrada

- **WHEN** o card renderiza um colaborador cujo campo de foto contém uma imagem válida
- **THEN** o avatar exibe a foto do colaborador, recortada em círculo e sem distorção de proporção

#### Scenario: Colaborador sem foto cadastrada

- **WHEN** o card renderiza um colaborador cujo campo de foto está ausente, vazio ou nulo
- **THEN** o avatar exibe as iniciais do colaborador (primeira letra do primeiro nome e primeira letra do último nome), nas mesmas dimensões do avatar com foto

#### Scenario: Foto cadastrada falha ao carregar

- **WHEN** a imagem de foto do colaborador não consegue ser carregada
- **THEN** o avatar não exibe imagem quebrada e a linha do colaborador permanece com altura e alinhamento inalterados

#### Scenario: Colaborador com nome de palavra única

- **WHEN** o nome do colaborador contém apenas uma palavra e não há foto
- **THEN** o avatar exibe a primeira letra dessa palavra, sem erro de renderização

### Requirement: Nomes são normalizados e encurtados para leitura

Nomes de colaboradores chegam da origem em caixa alta e frequentemente com quatro ou mais palavras. O card SHALL exibir o nome em capitalização de nome próprio e SHALL reduzi-lo a primeiro e último nome, de forma que caiba na largura da linha sem truncamento nos casos comuns. O nome completo SHALL permanecer acessível ao usuário por meio de atributo de título na linha.

#### Scenario: Nome longo em caixa alta

- **WHEN** o card recebe o nome "ADRIANO PEREIRA GOMES DOS SANTOS"
- **THEN** exibe "Adriano Santos" e disponibiliza o nome completo normalizado via atributo de título

#### Scenario: Nome com duas palavras

- **WHEN** o card recebe o nome "VITOR SILVA"
- **THEN** exibe "Vitor Silva"

#### Scenario: Nome com espaços extras nas bordas

- **WHEN** o card recebe um nome com espaços em branco no início ou fim, como "INGRID GRAZIELLE SANTOS SOUZA "
- **THEN** os espaços extras são desconsiderados e o nome exibido é "Ingrid Souza"

#### Scenario: Nome contém partícula de ligação

- **WHEN** o card recebe o nome "VITOR SANTOS DA SILVA"
- **THEN** a última palavra significativa é usada como sobrenome, exibindo "Vitor Silva" e não "Vitor Da"

### Requirement: Proximidade do aniversário é comunicada em linguagem relativa

O card SHALL exibir, para cada colaborador, um rótulo que expresse quantos dias faltam para o aniversário, cobrindo toda a faixa exibida pelo card e não apenas os casos de hoje e amanhã. O rótulo SHALL usar termos relativos em português.

#### Scenario: Aniversário é hoje

- **WHEN** faltam zero dias para o aniversário do colaborador
- **THEN** o rótulo exibe "Hoje"

#### Scenario: Aniversário é amanhã

- **WHEN** falta exatamente um dia para o aniversário do colaborador
- **THEN** o rótulo exibe "Amanhã"

#### Scenario: Aniversário em mais de um dia

- **WHEN** faltam quatro dias para o aniversário do colaborador
- **THEN** o rótulo exibe "em 4 dias"

#### Scenario: Aniversário no limite da janela exibida

- **WHEN** faltam sete dias para o aniversário do colaborador
- **THEN** o rótulo exibe "em 7 dias" e o colaborador permanece visível na lista

### Requirement: Linha secundária exibe a data por extenso

A linha secundária de cada colaborador SHALL exibir a data do aniversário em formato legível contendo o dia da semana abreviado e o dia/mês, sem depender de dados externos que possam estar indisponíveis. Essa linha SHALL sempre conter conteúdo — nunca renderizar vazia.

#### Scenario: Data exibida na linha secundária

- **WHEN** o aniversário do colaborador cai em uma segunda-feira, dia 04 de agosto
- **THEN** a linha secundária exibe "seg, 04/08"

#### Scenario: Ausência de dados complementares não esvazia a linha

- **WHEN** nenhuma informação complementar de departamento está disponível para o colaborador
- **THEN** a linha secundária continua exibindo a data por extenso, sem espaço vazio reservado

### Requirement: Aniversários iminentes se destacam dos demais

O card SHALL diferenciar visualmente os colaboradores cujo aniversário é hoje ou amanhã dos demais colaboradores da lista, de modo que o usuário identifique os casos iminentes sem ler todos os rótulos.

#### Scenario: Aniversariante do dia

- **WHEN** um colaborador faz aniversário hoje
- **THEN** sua linha recebe tratamento visual de destaque distinto das linhas de aniversários mais distantes

#### Scenario: Aniversariante distante

- **WHEN** um colaborador faz aniversário em cinco dias
- **THEN** sua linha usa o tratamento visual padrão, sem destaque

#### Scenario: Nenhum aniversário iminente

- **WHEN** nenhum colaborador da lista faz aniversário hoje ou amanhã
- **THEN** todas as linhas usam o tratamento visual padrão e o card permanece legível

### Requirement: Linhas do card respondem à interação do ponteiro

Cada linha de colaborador SHALL apresentar retorno visual ao passar o ponteiro sobre ela, indicando os limites da linha na lista.

#### Scenario: Ponteiro sobre uma linha

- **WHEN** o usuário posiciona o ponteiro sobre a linha de um colaborador
- **THEN** a linha apresenta retorno visual de destaque temporário

### Requirement: Departamento é exibido apenas quando resolvido

O departamento do colaborador SHALL ser exibido como informação complementar somente quando puder ser resolvido a partir dos dados de origem. Quando não for possível resolvê-lo, o card SHALL omitir a informação por completo, sem reservar espaço nem renderizar elemento vazio.

#### Scenario: Departamento resolvido

- **WHEN** o departamento do colaborador é resolvido com sucesso a partir dos dados de origem
- **THEN** o card exibe o nome do departamento como informação complementar da linha

#### Scenario: Departamento não resolvido

- **WHEN** o identificador de departamento do colaborador é nulo ou não corresponde a nenhum registro conhecido
- **THEN** o card não exibe informação de departamento e não reserva espaço vazio para ela

#### Scenario: Identificador alternativo disponível

- **WHEN** o identificador primário de departamento não resolve mas um identificador alternativo de função resolve
- **THEN** o card exibe o valor resolvido pelo identificador alternativo
