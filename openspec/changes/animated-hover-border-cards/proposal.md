## Why

Os cards do dashboard Prestek Intranet carecem de feedback visual interativo ao hover, tornando a interface estática e sem vida. Adicionar um efeito de borda animada com as cores do Design System Bento Blue cria uma percepção de qualidade premium e comunica interatividade sem poluir o layout — especialmente importante nos temas dark (Cyber, Aurora, AMOLED) onde os efeitos luminosos ganham destaque natural.

## What Changes

- Nova classe utilitária CSS `.bento-hover-border` adicionada ao `src/index.css`, usando `box-shadow` multicamada com tokens CSS das cores do tema ativo
- Variáveis CSS dedicadas ao efeito por tema (`--hover-border-from`, `--hover-border-to`, `--hover-border-glow`) injetadas em `:root`, `.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled`
- Upgrade do `BentoCard.jsx` (componente base) com suporte à classe `bento-hover-border` via prop `hoverBorder` (default: `true`)
- Aplicação da classe nos cards Tailwind diretos: `TechBentoCard`, `PlanoBentoCard`, `StreamingBentoCard`
- Aplicação da classe no `KpiCard` do Dashboard
- Efeito de pulse/glow contínuo opcional para cards de destaque (ex: urgentes, suporte TI)

## Capabilities

### New Capabilities

- `hover-border-effect`: Sistema de borda animada por CSS (`box-shadow` multicamada + tokens de tema) que se adapta automaticamente às 4 paletas de tema do Design System Bento Blue (Light, Cyber, Aurora, AMOLED)

### Modified Capabilities

- `bento-blue-global-tokens`: Adição de 3 novos tokens CSS por variante de tema para o efeito de hover border (`--hover-border-from`, `--hover-border-to`, `--hover-border-glow`)

## Impact

- **`src/index.css`**: Adição de ~60 linhas (tokens + classe utilitária + keyframe)
- **`src/components/common/BentoCard.jsx`**: Prop `hoverBorder` adicionada, aplicação condicional da classe
- **`src/components/services/TechBentoCard.jsx`**: Adição da classe no `div` raiz
- **`src/components/services/PlanoBentoCard.jsx`**: Adição da classe no `div` raiz
- **`src/components/services/StreamingBentoCard.jsx`**: Adição da classe no `div` raiz
- **`src/components/Dashboard.jsx` (`KpiCard`)**: Adição da classe ao `div` raiz do componente inline
- **Sem breaking changes**: Prop `hoverBorder` tem default `true`, comportamento existente preservado; a classe CSS é aditiva
- **Dependências**: Nenhuma nova dependência externa
