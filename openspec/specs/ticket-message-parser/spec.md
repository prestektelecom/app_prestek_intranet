# ticket-message-parser Specification

## Purpose
Extração do texto útil do corpo de um ticket do IXC (`parseTicketMessage`, em `TicketsList.jsx`) e as colunas exibidas na lista de Meus Chamados.

## Requirements

### Requirement: Extrair conteúdo limpo do corpo de ticket IXC
`parseTicketMessage(texto)` SHALL receber o corpo bruto de um ticket e retornar o conteúdo real da situação descrita, sem delimitadores de template, cabeçalhos de seção ou metadados de solicitante.

#### Scenario: Mensagem com formato padrão
- **WHEN** o texto contém blocos delimitados por três ou mais sinais `=`
- **THEN** a função SHALL retornar o conteúdo entre os delimitadores, sem as linhas de cabeçalho (ex.: `DESCREVA A SITUAÇÃO:`, `Solicitante:`)

#### Scenario: Mensagem sem delimitadores
- **WHEN** o texto não contém delimitadores
- **THEN** a função SHALL retornar o texto original normalizado

#### Scenario: Mensagem nula ou vazia
- **WHEN** o texto é `null`, `undefined` ou vazio
- **THEN** a função SHALL retornar `""`

### Requirement: Colunas da lista de chamados
A lista SHALL exibir as colunas ID, Assunto (texto limpo via `parseTicketMessage`), Status e Data, sem coluna Protocolo.

#### Scenario: Renderização
- **WHEN** a API retorna tickets
- **THEN** a tabela SHALL ter ID (com `#`), Assunto, badge de Status e Data em `dd/mm/aaaa`

#### Scenario: Data ausente
- **WHEN** nenhum campo de data está presente
- **THEN** a coluna Data SHALL tentar a data embutida nos 8 primeiros dígitos do protocolo (`YYYYMMDD...`) e, sem ela, exibir `—`
