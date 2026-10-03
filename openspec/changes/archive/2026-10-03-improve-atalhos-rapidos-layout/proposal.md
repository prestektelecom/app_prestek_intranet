## Why

O card "Atalhos Rápidos" no Dashboard exibe label e hint na mesma linha horizontal, causando texto espremido e truncamento prematuro do hint em larguras menores. A reorganização vertical elimina a competição por espaço e torna os atalhos mais legíveis e confortáveis.

## What Changes

- O layout interno de cada botão de atalho passa de **horizontal (label | hint)** para **vertical (label em cima / hint embaixo)**
- O hint deixa de ter `shrink-0 truncate` fixo na direita e passa a ocupar uma linha abaixo do label
- Tamanhos de fonte e espaçamentos são ajustados para acomodar o novo layout sem aumentar significativamente a altura de cada item
- Nenhuma mudança funcional — os botões continuam com os mesmos links e ações

## Capabilities

### New Capabilities
- Nenhuma

### Modified Capabilities
- `atalhos-rapidos-button-layout`: Layout interno dos botões passa de linha única (label + hint lado a lado) para coluna (label + hint empilhados verticalmente)

## Impact

- **Arquivo**: `src/components/Dashboard.jsx` — função `AtalhosRapidosCard`, especificamente o JSX dos botões (linhas ~832–846)
- **Nenhuma API, rota ou estado** é alterado
- **Sem quebra de compatibilidade** — mudança puramente visual/CSS
