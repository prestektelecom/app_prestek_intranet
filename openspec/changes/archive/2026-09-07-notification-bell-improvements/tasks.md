## 1. Estado e Dados — Multi-type

- [x] 1.1 Adicionar estado `importantAnnouncements` (`useState([])`) em `Header.jsx`
- [x] 1.2 Refatorar o `useEffect` de `fetchUrgents` para buscar e separar `Urgente` e `Importante` em dois arrays
- [x] 1.3 Derivar `badgeColor`: `C.danger` se `urgentes.length > 0`, senão `C.warning` se `importantes.length > 0`, senão `null`
- [x] 1.4 Atualizar a condição de exibição do badge para usar `badgeColor` (em vez de `hasUrgent && !hasViewedUrgent`)

## 2. Persistência — localStorage por userId

- [x] 2.1 Criar helper `getSeenKey(userId)` que retorna `notif_seen_${userId}`
- [x] 2.2 Criar helper `getSeenIds(userId)` que lê e parseia o array do localStorage (retorna `[]` em caso de erro)
- [x] 2.3 Criar helper `markAsSeen(userId, ids)` que salva o array atualizado no localStorage
- [x] 2.4 Refatorar `hasViewedUrgent` / `setHasViewedUrgent` para usar os helpers: calcular `hasUnread` comparando IDs dos comunicados atuais vs localStorage
- [x] 2.5 Ao abrir o sino, chamar `markAsSeen(userId, [...urgentes, ...importantes].map(c => String(c.id)))`

## 3. UI — Dropdown multi-tipo

- [x] 3.1 Atualizar o header do dropdown para exibir contagem separada: `X Urgente(s)` em vermelho e `Y Importante(s)` em amarelo (quando ambos presentes)
- [x] 3.2 Renderizar os cards de `urgentAnnouncements` e `importantAnnouncements` no dropdown com o ícone e cor corretos por tipo (reusar `getTypeMeta` de `Comunicados.jsx` ou replicar a lógica local)
- [x] 3.3 Atualizar estado "tudo tranquilo" para verificar `urgentes.length === 0 && importantes.length === 0`

## 4. Animação — Dropdown

- [x] 4.1 Adicionar tag `<style>` no retorno do `Header` com `@keyframes notif-dropdown-in` (opacity 0→1, scale 0.97→1, translateY -6px→0, 160ms, cubic-bezier)
- [x] 4.2 Aplicar `animation: notif-dropdown-in 160ms cubic-bezier(0.4,0,0.2,1) both` no `div` do dropdown

## 5. Verificação

- [x] 5.1 Verificar badge vermelho com comunicado Urgente presente
- [x] 5.2 Verificar badge amarelo com apenas Importante presente
- [x] 5.3 Verificar ausência de badge com apenas Geral presente
- [x] 5.4 Recarregar página e confirmar que badge não reaparece para comunicados já vistos
- [x] 5.5 Confirmar animação de entrada do dropdown ao abrir
