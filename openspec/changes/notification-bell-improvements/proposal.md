## Why

O sino de notificações do Header hoje só exibe comunicados do tipo **Urgente**, ignora o tipo **Importante**, perde o estado "visto" ao recarregar a página e o dropdown aparece sem animação — resultando em uma experiência de notificação incompleta e pouco polida.

## What Changes

- O sino passa a buscar e exibir comunicados **Urgente** e **Importante** (não mais só Urgente)
- O badge muda de cor conforme a prioridade máxima presente: **vermelho** se houver qualquer Urgente, **amarelo** se houver apenas Importante
- O estado "visto" passa a ser persistido no `localStorage` por ID de comunicado e por `userId`, garantindo que o badge não volte após recarregar para comunicados já vistos
- O dropdown ganha uma animação de entrada (`fade + scale + translateY`) ao ser aberto

## Capabilities

### New Capabilities

- `notification-bell-multi-type`: Sino exibe Urgente + Importante com badge de cor adaptativa por prioridade
- `notification-seen-persistence`: Estado "visto" persistido no localStorage por `userId` e ID de comunicado
- `notification-dropdown-animation`: Dropdown do sino com animação de entrada suave

### Modified Capabilities

*(nenhuma)*

## Impact

- **Arquivo único:** `src/components/Header.jsx`
- **Estado:** adição de `importantAnnouncements`, `badgeColor` e lógica de `localStorage` com prefixo `notif_seen_{userId}`
- **CSS:** adição de `@keyframes notif-dropdown-in` via tag `<style>` inline (padrão já usado no projeto)
- **Sem novas dependências** externas
- **API:** sem mudanças — `/api/comunicados` já retorna os três tipos, apenas o filtro no frontend muda
