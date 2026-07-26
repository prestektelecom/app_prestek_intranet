## Why

O token `CARD` em `Dashboard.jsx` contém `overflow-hidden`, que corta os pseudo-elementos do `GlowingEffect` que se posicionam `-1px` fora do card. Isso faz com que o efeito de borda interativo seja invisível em todos os cards que usam esse token (`PlantaoBento`, `OsBento`, `AtalhosCard`, `AniversariantesCard`, `TeamBento`). O `ComunicadosCard` tem o mesmo problema por razão idêntica.

## What Changes

- Remover `overflow-hidden` do token `CARD` (linha 17 de `Dashboard.jsx`).
- Adicionar `overflow-hidden` diretamente no **wrapper filho de conteúdo** de cada card afetado, para preservar o clipping do conteúdo interno sem bloquear o efeito de borda.
- O `GlowingEffect` passará a ser visível ao hover em todos os cards do Dashboard que já receberam o componente.

## Capabilities

### New Capabilities
*(nenhuma — é uma correção de comportamento visual existente)*

### Modified Capabilities
- `glowing-effect-cards`: O requisito de que o GlowingEffect seja visível nos cards do Dashboard agora se aplica corretamente ao `overflow` — o wrapper externo não pode ter `overflow-hidden` quando o efeito estiver presente.

## Impact

- **Arquivo afetado**: `src/components/Dashboard.jsx`
- **Token afetado**: constante `CARD` (L17) — perda do `overflow-hidden` no pai
- **Cards afetados (6)**: `PlantaoBento`, `OsBento`, `ComunicadosCard`, `AtalhosCard`, `AniversariantesCard`, `TeamBento`
- **Risco**: Conteúdo que transborda (ex: textos longos, listas) pode ficar visível fora dos limites do card se o inner wrapper não receber o `overflow-hidden` corretamente — mitigação: aplicar `overflow-hidden` no div filho de conteúdo.
- **Sem dependências externas novas**.
