## Why

O componente de diretório de serviços (`ServicesDirectory.jsx`) possui botões de filtro na barra superior que quebram linha ou ocultam partes das palavras (ex: "Internet PF", "Internet PJ", "Serviços Técnicos") dependendo da largura da tela, por falta de tratamento adequado de quebra de linha em telas menores.

## What Changes

- Adicionar a classe utilitária `whitespace-nowrap` nos botões de filtro do componente `ServicesDirectory.jsx`, garantindo alinhamento de design consistente com os botões de ordenação (que já possuem essa classe).

## Capabilities

### New Capabilities

- `directory-filter-layout`: Layout e comportamento da barra de filtros do diretório de serviços, assegurando que o texto dos botões não quebre ou seja truncado em telas pequenas e que a barra ofereça rolagem horizontal adequada.

### Modified Capabilities

Nenhuma.

## Impact

- Componente `ServicesDirectory.jsx` (interface de filtros de serviços).
