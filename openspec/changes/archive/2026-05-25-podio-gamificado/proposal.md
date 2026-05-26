## Why

A seção de Pódios de Vendas (Serviços Internos) utiliza atualmente ícones de usuário genéricos e sem apelo visual, o que reduz o engajamento das vendedoras e não condiz com o padrão de design premium de outras áreas (como Login e Dashboard). A gamificação com avatares 3D realistas e confetes dinâmicos visa valorizar os melhores resultados e incentivar a competitividade saudável da equipe.

## What Changes

- **Integração de Avatares 3D**: Substituição do ícone genérico `person` por avatares 3D mapeados de forma consistente (determinística) no pódio.
- **Efeitos Premium de Destaque**: Aplicação de brilho azul (`glow`), coroas flutuantes e badges modernos para destacar as posições do Top 3.
- **Injeção Dinâmica de Confetes**: Disparo automático de confetes na tela utilizando a biblioteca `canvas-confetti` (via CDN) no momento em que a aba de pódios é visualizada.

## Capabilities

### New Capabilities
- `gamificacao-podio-vendas`: Implementação da gamificação com avatares 3D, efeitos visuais premium e confetes interativos no pódio de vendas.

### Modified Capabilities

## Impact

- **Frontend**: Componente `ServicesDirectory.jsx` e estilos relacionados.
- **Biblioteca Externa**: Injeção da biblioteca `canvas-confetti` via script dinâmico/CDN.
- **Mapeamento de Avatares**: Uso do utilitário existente `avatarPngs.js`.
