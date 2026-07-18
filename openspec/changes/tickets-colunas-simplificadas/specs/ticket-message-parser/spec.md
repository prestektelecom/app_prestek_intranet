## ADDED Requirements

### Requirement: Extrair conteúdo limpo do corpo de ticket IXC
O sistema SHALL fornecer uma função `parseTicketMessage(texto)` que recebe o corpo bruto de um ticket IXC e retorna o conteúdo real da situação descrita, sem delimitadores de template, cabeçalhos de seção ou metadados de solicitante.

#### Scenario: Mensagem com formato padrão SUPORTE TI
- **WHEN** o campo `menssagem` contém blocos delimitados por `========================`
- **THEN** a função SHALL retornar apenas o texto entre os delimitadores, com linhas de cabeçalho (ex.: `DESCREVA A SITUAÇÃO:`, `Solicitante:`) removidas, truncado a no máximo 150 caracteres

#### Scenario: Mensagem sem delimitadores (formato livre)
- **WHEN** o campo `menssagem` não contém `========================`
- **THEN** a função SHALL retornar o texto original truncado a 150 caracteres, sem modificação

#### Scenario: Mensagem nula ou vazia
- **WHEN** o campo `menssagem` é `null`, `undefined` ou string vazia
- **THEN** a função SHALL retornar uma string vazia `""`

### Requirement: Exibir colunas simplificadas na tabela de chamados
A tabela de "Meus Chamados" SHALL exibir as colunas na seguinte ordem: ID, Assunto, Mensagem (resumida), Status, Data — sem a coluna Protocolo.

#### Scenario: Renderização da tabela com dados válidos
- **WHEN** a API retorna uma lista de tickets com campos `id`, `titulo`, `menssagem`, `status` e campo de data
- **THEN** a tabela SHALL renderizar exatamente 5 colunas: ID (com `#`), Assunto (`titulo`), Mensagem limpa (via `parseTicketMessage`), badge de Status, e Data formatada em `dd/mm/aaaa`

#### Scenario: Campo de data ausente
- **WHEN** nenhum campo de data válido está presente no registro do ticket
- **THEN** a coluna Data SHALL exibir `—` (travessão) em vez de `--/--/--`

### Requirement: Identificar e corrigir campo de data do ticket IXC
O sistema SHALL mapear corretamente o campo de data de abertura retornado pela API IXC para exibição na coluna "Data".

#### Scenario: Campo de data encontrado na resposta IXC
- **WHEN** a resposta da API IXC contém um campo de data no registro de ticket (ex.: `data_abertura`, `dt_registro`)
- **THEN** o frontend SHALL formatar e exibir a data no formato brasileiro `dd/mm/aaaa`

#### Scenario: Fallback via número de protocolo
- **WHEN** nenhum campo de data direto está disponível E o protocolo segue o formato `YYYYMMDD...`
- **THEN** o sistema SHALL extrair e exibir a data a partir dos primeiros 8 dígitos do protocolo
