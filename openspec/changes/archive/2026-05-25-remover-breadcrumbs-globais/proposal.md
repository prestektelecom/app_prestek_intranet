## Why

Os cabeçalhos dos componentes principais da intranet utilizam breadcrumbs estáticos que duplicam informações de contexto visual e, em muitos casos (como na tela de Mapa de Cobertura), possuem links quebrados ou sem utilidade real, além de ocuparem espaço vertical desnecessário. A remoção global simplifica o visual das páginas e centraliza a navegação no menu principal da SPA.

## What Changes

Remoção completa dos componentes e trechos JSX de Breadcrumbs das seguintes telas da intranet:
- **Setores** (`Sectors.jsx`)
- **Agenda** (`Schedule.jsx`)
- **Filiais** (`Offices.jsx`)
- **Mapa de Cobertura** (`Coverage.jsx`)
- **Diretório** (`Directory.jsx`)
- **Comunicados** (`Comunicados.jsx`)

## Capabilities

### New Capabilities
<!-- Nenhuma nova funcionalidade será introduzida -->

### Modified Capabilities
- `cobertura-ui-redesign`: Remoção da exigência visual do Breadcrumb na tela de cobertura.

## Impact

Afeta os arquivos JSX de visualização principais em `src/components/`, reduzindo o acoplamento de funções de navegação como `setCurrentView` onde elas não são mais necessárias.
