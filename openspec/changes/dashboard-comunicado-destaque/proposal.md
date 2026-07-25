## Why

O Dashboard exibe comunicados dentro de um card compacto no Bento Grid, sem aproveitar o impacto visual de ter imagem + título em destaque full-width logo abaixo do cabeçalho — como visto em referências modernas (Notion, Linear, portais corporativos Apple-style). O comunicado mais importante merece protagonismo equivalente a um editorial de revista, não apenas um chip de texto num card estreito.

## What Changes

- Adicionar um novo componente `ComunicadoBanner` — um banner cinematográfico full-width, posicionado estaticamente entre o `DashboardHeader` e o Bento Grid.
- O banner exibe o comunicado mais recente (ou o de maior prioridade) com: imagem de capa, overlay gradiente, badge de tipo (Urgente / Importante / Aviso), título e subtítulo sobrepostos.
- Quando não há comunicado com imagem, exibe uma versão degradê sólido com ícone + título (fallback elegante).
- O `ComunicadosCard` existente no Bento Grid passa a exibir os comunicados **secundários** (lista sem o item já em destaque no banner).
- Banner é clicável → navega para a view `announcements`.

## Capabilities

### New Capabilities
- `comunicado-banner-destaque`: Banner cinematográfico full-width que exibe o comunicado mais importante com imagem, overlay, badge de tipo e texto sobreposto. Suporta fallback sem imagem.

### Modified Capabilities
- `comunicados-card-lista`: O `ComunicadosCard` do Bento Grid passa a exibir apenas os comunicados secundários (a partir do índice 1, ou itens sem flag de destaque), evitando duplicação com o banner.

## Impact

- **`src/components/Dashboard.jsx`**: Novo componente `ComunicadoBanner`, inserção do banner entre `DashboardHeader` e `ResponsiveReactGridLayout`, ajuste no `ComunicadosCard` para excluir o item em destaque da lista.
- **`/api/comunicados`**: Endpoint existente, sem alterações. O banner usa o mesmo dado (primeiro item por data ou tipo Urgente/Importante tem prioridade).
- **Sem breaking changes** na API ou na estrutura de dados existente.
