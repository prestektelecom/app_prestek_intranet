## Why

Atualmente, o componente `Sectors.jsx` exibe os cards de setores com a descrição truncada em até 2 linhas usando `-webkit-line-clamp: 2`. Isso impede que os usuários vejam a descrição completa de setores que possuem textos mais longos.

## What Changes

- Adicionar o estado `isExpanded` ao componente `SectorCard` em `Sectors.jsx`.
- Exibir um botão/link discreto "Ver mais" / "Ver menos" abaixo da descrição de setores com texto longo.
- Ajustar os estilos CSS do parágrafo da descrição de forma que ela se expanda dinamicamente ao clicar no botão.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `sectors-directory`: Diretório e informações de setores da empresa, agora permitindo expandir e recolher descrições longas interativamente.

## Impact

- Componente `Sectors.jsx` (diretório de setores).
