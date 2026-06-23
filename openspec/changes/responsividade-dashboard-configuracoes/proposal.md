## Why

A interface da intranet quebra visualmente em telas pequenas: a Dashboard usa um grid desktop-only com widgets de tamanhos fixos, e a tela de Configurações mantém uma grade de 12 colunas sem breakpoints, esmagando o card lateral e o formulário em dispositivos móveis. Isso prejudica a usabilidade para colaboradores que acessam de celulares ou tablets.

## What Changes

- Adaptar o layout da **Dashboard** para empilhar widgets em telas pequenas (`sm`/`xs`) sem perder a experiência desktop.
- Tornar os widgets internos da Dashboard (hero, KPIs de setor, OS, plantão) proporcionais em telas estreitas.
- Refatorar a **Configurações** para empilhar o card lateral de navegação e o formulário em mobile, mantendo a disposição lado a lado em desktop.
- Ajustar paddings, fontes e grids internos dos formulários de Configurações para não estourarem horizontalmente.
- Garantir que o Header (busca, ações, perfil) não sobreponha ou esmague elementos ao redimensionar a janela.

## Capabilities

### New Capabilities
- `dashboard-responsive-layout`: Layout responsivo da Dashboard com breakpoints para mobile, tablet e desktop.
- `settings-responsive-layout`: Layout responsivo da tela de Configurações com navegação e formulário adaptáveis.

### Modified Capabilities
- (nenhum — esta change é puramente de implementação visual, sem alteração de requisitos funcionais)

## Impact

- `src/components/Dashboard.jsx`
- `src/components/Configuracoes.jsx`
- `src/components/Header.jsx` (ajustes leves de overflow/actions em telas pequenas)
- `src/index.css` (possíveis ajustes de utilitários do grid-layout, se necessário)
