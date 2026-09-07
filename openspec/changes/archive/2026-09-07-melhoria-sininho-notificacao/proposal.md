## Why

O sininho de notificações atual exibe comunicados urgentes/importantes de forma básica: sem contador numérico visível, sem distinção visual de itens já lidos vs não lidos, sem agrupamento por tipo, e com interação limitada (clicar abre o painel, mas sem feedback de hover no botão nem animação de sino). Isso reduz a eficiência informacional e o apelo visual do componente mais crítico do Header.

## What Changes

- Adicionar **contador numérico** no badge do sino (ex: "3" em vez de só um ponto vermelho)
- Adicionar **estado visual "não lido"** em cada item de notificação (borda ou highlight lateral colorida)
- Adicionar **efeito de hover** no botão do sino com animação sutil de "shake"
- Adicionar **indicador de loading** enquanto busca comunicados
- Adicionar **marcação individual** de notificação como lida ao clicar no item
- Adicionar **agrupamento** das notificações por tipo (Urgente / Importante) com cabeçalhos de seção
- Adicionar **tempo relativo** (ex: "há 2h", "há 3 dias") além da data
- Melhorar **estado vazio** com ilustração mais elaborada
- Adicionar **ação "Marcar todas como lidas"** no header do dropdown
- Melhorar **acessibilidade** (aria-label no botão, role no dropdown)

## Capabilities

### New Capabilities
- `notification-bell-ui`: Componente do sininho de notificações com badge numérico, animação de hover/shake, estado de loading, e dropdown aprimorado
- `notification-item-read-state`: Lógica de marcação individual de item como lido (persiste no localStorage), estado visual diferenciado para itens não lidos vs lidos
- `notification-grouping`: Agrupamento das notificações por tipo com separadores visuais (Urgente / Importante)
- `notification-relative-time`: Utilitário de tempo relativo em pt-BR (ex: "há 2h", "ontem", "há 3 dias")

### Modified Capabilities
- `notification-badge`: Badge agora exibe número em vez de ponto simples

## Impact

- `src/components/Header.jsx` — refatoração do bloco de notificações (sem quebrar o layout geral do Header)
- `src/index.css` — adição da keyframe `bell-shake` para a animação de hover
- Possível extração de `src/components/notifications/NotificationBell.jsx` se o componente crescer acima de 150 linhas
- Nenhuma alteração de API — continua consumindo `/api/comunicados`
- Nenhuma mudança de schema de dados
