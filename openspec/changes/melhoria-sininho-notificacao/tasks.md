## 1. Utilitário de Tempo Relativo

- [x] 1.1 Criar `src/utils/relativeTime.js` com a função `formatRelativeTime(dateStr)` usando `Intl.RelativeTimeFormat` em pt-BR
- [x] 1.2 Implementar lógica de thresholds: agora (<1min), minutos (<1h), horas (<24h), ontem (<48h), dias (<30d), data absoluta (≥30d)
- [x] 1.3 Implementar fallback seguro: se `dateStr` for inválido, retornar o valor original sem lançar exceção

## 2. Animação do Sino (CSS)

- [x] 2.1 Adicionar keyframe `bell-shake` no `src/index.css` com rotação sutil (-15deg → +15deg → 0)
- [x] 2.2 Adicionar classe CSS `.bell-shake-hover:hover` que aplica a animação com `animation-duration: 0.5s`

## 3. Componente NotificationBell

- [x] 3.1 Criar pasta `src/components/notifications/` e arquivo `NotificationBell.jsx`
- [x] 3.2 Mover toda a lógica de estado de notificações do `Header.jsx` para `NotificationBell.jsx` (useState, useEffect de fetch, useEffect de seen, handleBellClick, getSeenKey, etc.)
- [x] 3.3 Mover o `ref` do dropdown e o `useEffect` de click-outside para `NotificationBell.jsx`
- [x] 3.4 Receber via props: `user`, `setCurrentView`, e o tema `C` (ou chamar `useBentoTheme()` internamente)

## 4. Badge Numérico

- [x] 4.1 Calcular `unseenCount = unseenUrgents.length + unseenImportants.length`
- [x] 4.2 Calcular `badgeLabel = unseenCount > 9 ? '9+' : String(unseenCount)`
- [x] 4.3 Substituir o badge de ponto (8×8px) por um badge numérico (min-width 16px, height 16px, border-radius 8px, font-size 9px)
- [x] 4.4 Renderizar badge apenas quando `unseenCount > 0`

## 5. Animação de Hover no Sino

- [x] 5.1 Aplicar a classe `bell-shake-hover` ao `<span>` do ícone somente quando `unseenCount > 0`
- [x] 5.2 Verificar visualmente que o hover NÃO anima quando todas as notificações estão lidas

## 6. Marcação Individual como Lida

- [x] 6.1 Implementar função `handleItemClick(id)` que adiciona o id ao `seenIds` e atualiza o localStorage imediatamente
- [x] 6.2 Implementar limpeza de IDs obsoletos: ao salvar, filtrar para manter apenas IDs presentes na lista atual
- [x] 6.3 Adicionar o handler `onClick={handleItemClick(a.id)}` em cada item do dropdown

## 7. Ação "Marcar Todas como Lidas"

- [x] 7.1 Implementar função `handleMarkAllRead()` que adiciona todos os IDs atuais ao `seenIds`
- [x] 7.2 Renderizar botão "Marcar todas como lidas" no header do dropdown, visível apenas quando `unseenCount > 0`

## 8. Distinção Visual Lido / Não Lido

- [x] 8.1 Adicionar borda lateral esquerda colorida (3px, cor do tipo) em itens não lidos (`!seenIds.includes(String(a.id))`)
- [x] 8.2 Reduzir opacidade (0.65) dos itens já lidos
- [x] 8.3 Adicionar transição CSS suave (opacity 0.2s) na mudança de estado

## 9. Agrupamento por Tipo no Dropdown

- [x] 9.1 Remover a lista plana `allNotifications` e substituir por renderização de dois grupos: urgentes depois importantes
- [x] 9.2 Adicionar cabeçalho de seção para cada grupo com ícone, nome do tipo e contagem
- [x] 9.3 Omitir grupo quando estiver vazio (não renderizar cabeçalho)
- [x] 9.4 Ordenar itens de cada grupo por `criado_em` decrescente

## 10. Tempo Relativo nos Itens

- [x] 10.1 Importar `formatRelativeTime` de `src/utils/relativeTime.js` no `NotificationBell.jsx`
- [x] 10.2 Substituir a formatação de data atual (`Intl.DateTimeFormat 'day 2-digit month short'`) pela chamada de `formatRelativeTime(a.criado_em)`

## 11. Acessibilidade

- [x] 11.1 Adicionar `aria-label` dinâmico no botão sino: "Notificações (N não lidas)" ou "Notificações (sem novas)"
- [x] 11.2 Adicionar `aria-expanded={isNotificationsOpen}` no botão sino
- [x] 11.3 Adicionar `role="dialog"` e `aria-label="Notificações"` no painel dropdown

## 12. Integração no Header

- [x] 12.1 Importar `NotificationBell` de `src/components/notifications/NotificationBell.jsx` no `Header.jsx`
- [x] 12.2 Substituir o bloco do sino (divs/button/dropdown) por `<NotificationBell user={user} setCurrentView={setCurrentView} />`
- [x] 12.3 Remover os estados e hooks de notificação do `Header.jsx` (agora vivem em `NotificationBell.jsx`)
- [x] 12.4 Verificar que o Header continua funcionando normalmente (busca, avatar, breadcrumb)

## 13. Verificação Final

- [ ] 13.1 Testar no browser: badge aparece/some corretamente ao marcar lidas
- [ ] 13.2 Testar animação shake no hover com e sem notificações não lidas
- [ ] 13.3 Testar agrupamento com cenários: só Urgente, só Importante, ambos, nenhum
- [ ] 13.4 Testar tempo relativo com datas de hoje, ontem, 5 dias atrás, 40 dias atrás
- [ ] 13.5 Testar persistência: marcar itens como lidos → recarregar página → verificar que continuam lidos
