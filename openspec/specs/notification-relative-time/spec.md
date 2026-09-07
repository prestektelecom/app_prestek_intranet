## Requirements

### Requirement: Exibição de tempo relativo em pt-BR
O sistema SHALL exibir o tempo relativo de cada notificação em português do Brasil usando `Intl.RelativeTimeFormat`. O tempo relativo SHALL ser exibido em lugar da data absoluta abreviada atual (ex: "14 de jul."). Para notificações com mais de 30 dias, SHALL exibir a data absoluta formatada como fallback.

#### Scenario: Notificação de menos de 1 hora
- **WHEN** a notificação foi criada há menos de 60 minutos
- **THEN** o sistema exibe "há X minutos" ou "agora mesmo" se for menos de 1 minuto

#### Scenario: Notificação de 1 a 23 horas
- **WHEN** a notificação foi criada entre 1 e 23 horas atrás
- **THEN** o sistema exibe "há X horas"

#### Scenario: Notificação de ontem
- **WHEN** a notificação foi criada entre 24h e 48h atrás
- **THEN** o sistema exibe "ontem"

#### Scenario: Notificação de 2 a 29 dias
- **WHEN** a notificação foi criada entre 2 e 29 dias atrás
- **THEN** o sistema exibe "há X dias"

#### Scenario: Notificação com mais de 30 dias
- **WHEN** a notificação foi criada há 30 dias ou mais
- **THEN** o sistema exibe a data absoluta formatada em pt-BR (ex: "14 de jan.")

### Requirement: Utilitário isolado de tempo relativo
A lógica de formatação de tempo relativo SHALL estar em um utilitário isolado `src/utils/relativeTime.js`, exportando a função `formatRelativeTime(dateStr: string): string`. O utilitário SHALL funcionar sem dependências externas (usar apenas APIs nativas do browser).

#### Scenario: Função exportada e utilizável
- **WHEN** outro módulo importa `formatRelativeTime` de `src/utils/relativeTime.js`
- **THEN** a função retorna uma string formatada para qualquer dateStr ISO válido

#### Scenario: Fallback para data inválida
- **WHEN** `dateStr` não é uma data válida
- **THEN** a função retorna a string original `dateStr` sem lançar exceção
