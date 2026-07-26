## Context

Atualmente, o `ServicesDirectory.jsx` utiliza três componentes filhos de cards: `PlanoBentoCard.jsx`, `TechBentoCard.jsx` e `StreamingBentoCard.jsx`. O objetivo é unificar o padrão visual de cards na intranet com o modelo `GradientCard`, que traz um apelo estético moderno (Framer Motion, glassmorphism badges, ícones e gradientes por categoria), mantendo todas as métricas e o módulo de **Rankings do Mês**.

## Goals / Non-Goals

**Goals:**
- Implementar o componente `GradientCard` reutilizável em `src/components/ui/gradient-card.jsx`.
- Adaptar `PlanoBentoCard.jsx`, `TechBentoCard.jsx` e `StreamingBentoCard.jsx` para utilizarem o layout e a estética do `GradientCard`.
- Garantir compatibilidade com modo escuro/claro e breakpoints responsivos (`sm`, `md`, `lg`).
- Preservar sem alterações o bloco **Rankings do Mês** e suas requisições de API (`top-vendedores`, IXC).

**Non-Goals:**
- Redesenhar a API backend ou schema das rotas `/api/planos-negociacoes`, `/api/servicos-tecnicos` ou `/api/top-vendedores`.
- Alterar as regras de permissão de administrador ou funcionalidade do modal de comparação.

## Decisions

- **Variantes CVA de Gradiente**:
  - `blue`: Internet PF (`from-sky-500/10 via-blue-500/15 to-indigo-500/10`).
  - `emerald`: Internet PJ (`from-emerald-500/10 via-teal-500/15 to-cyan-500/10`).
  - `amber`: Link Dedicado (`from-amber-500/10 via-orange-500/15 to-yellow-500/10`).
  - `purple`: Serviços Técnicos (`from-purple-500/10 via-indigo-500/15 to-violet-500/10`).
  - `rose`: Pacotes de Streaming (`from-rose-500/10 via-pink-500/15 to-red-500/10`).

- **Animações**:
  - Utilizar `framer-motion` para o card (`whileHover={{ scale: 1.02, y: -4 }}`) e para o gráfico decorativo de fundo (`whileHover={{ scale: 1.1, rotate: 3 }}`).

- **Integração de Controles de Ação**:
  - Manter os elementos interativos como `Checkbox de Comparar` e botões de `Editar/Excluir` em um container `z-20` para não interferir na área de clique dos cards.

## Risks / Trade-offs

- [Overflow no Hover] → Garantir `overflow-hidden` nos cards para que a ilustração flutuante `-right-1/4 -bottom-1/4` não crie barras de rolagem indesejadas no container.
