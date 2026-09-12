## ADDED Requirements

### Requirement: Contraste do badge de tipo

O badge de tipo de cada `ComunicadoCard` SHALL usar a variante de texto (`*Strong`) do token semântico do tipo sobre o fundo `-Soft`, garantindo contraste WCAG AA (≥ 4,5:1).

#### Scenario: Badge de tipo Importante
- **WHEN** um comunicado tem `tipo === "Importante"`
- **THEN** o texto do badge usa `warningStrong` sobre `warningSoft`

#### Scenario: Badge de tipo Urgente ou Geral
- **WHEN** um comunicado tem `tipo === "Urgente"` ou `tipo === "Geral"`
- **THEN** o texto do badge usa `dangerStrong` ou `successStrong`, respectivamente, sobre o `-Soft` correspondente

### Requirement: Truncamento do corpo do comunicado

O corpo (`descricao`) de cada `ComunicadoCard` SHALL ser truncado a um número máximo de linhas por padrão, com uma forma de expandir para ler o conteúdo completo. Asteriscos literais de markdown (`*texto*`) SHALL ser removidos antes da exibição.

#### Scenario: Descrição longa
- **WHEN** um comunicado tem descrição que excede o limite de exibição padrão (~220 caracteres)
- **THEN** o card exibe até 4 linhas com um botão "Ler mais"
- **AND** clicar em "Ler mais" expande para o texto completo e o botão passa a exibir "Ler menos"

#### Scenario: Descrição curta
- **WHEN** um comunicado tem descrição dentro do limite de exibição padrão
- **THEN** o card exibe a descrição completa, sem botão de expandir

#### Scenario: Descrição com markdown de WhatsApp
- **WHEN** a descrição contém texto entre asteriscos (ex: `*ATENÇÃO*`)
- **THEN** o card exibe o texto sem os caracteres de asterisco
