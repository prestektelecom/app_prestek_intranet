## 1. Mapa reflete filtro/busca (P0)

- [x] 1.1 Trocado o efeito de sincronização de marcadores para iterar `filtrados` em vez de `offices`, e a dependência `[mapPronto, offices]` para `[mapPronto, filtrados]`
- [x] 1.2 Novo efeito refaz `fitBounds` sobre `filtrados` quando `filtro`/`busca` mudam, com guarda para lista vazia
- [x] 1.3 Verificado ao vivo: selecionar "SE" reduziu de 16 para 5 marcadores no mapa, batendo exatamente com a contagem da lista

## 2. Tema em toda a tela (P0)

- [x] 2.1 Painel da lista migrado para `C.surface`/`C.ink`/`C.ink2`/`C.line`
- [x] 2.2 Chips de filtro e campo de busca migrados (com `aria-pressed`/`aria-label` de brinde)
- [x] 2.3 `EscritorioModal` e o diálogo de exclusão migrados por completo (fundo, labels, inputs, botões)
- [x] 2.4 Moldura do mapa migrada para `C.line`; divisor de redimensionamento também migrado (com `role="separator"` de brinde)
- [x] 2.5 Badge "Matriz" corrigido para `C.onAccent` no texto
- [x] 2.6 Gradiente dos botões corrigido para `C.accentDeep`→`C.accent` (antes misturava hex do claro com hex do Aurora escuro)
- [x] 2.7 Verificado ao vivo: em AMOLED, painel da lista `rgb(10,10,10)` (era branco fixo); legenda de cidade `rgb(136,136,136)` (tom correto do tema); badge "Matriz" 6,22:1 no claro e ~7:1 no AMOLED (era 2,80:1 fixo); legenda de cidade 7,69:1 no claro (era 3,01:1)

## 3. Ações admin acessíveis + diálogos (P0)

- [x] 3.1 Editar/excluir revelados em `group-focus-within` além de `group-hover`, e sempre visíveis em `(hover: none)`
- [x] 3.2 `aria-label` descritivo (`Editar/Excluir ${office.nome}`) adicionado
- [x] 3.3 `useDismissable`+`trapTab` local + `role="dialog"`/`aria-modal`/`aria-labelledby` aplicados em `EscritorioModal` e no diálogo de exclusão; removido o handler de Escape compartilhado no componente pai (redundante agora)
- [x] 3.4 Verificado ao vivo: `.focus()` real no botão de editar deixa o wrapper com opacity 1 (visível), confirmado sem artefato de transição CSS; foco inicial do diálogo de exclusão já entra em "Cancelar"; Tab dentro dele cicla só entre Cancelar/Excluir, nunca escapando para o botão de outra linha (achado mais grave da crítica, agora corrigido e confirmado)

## 4. Formulário acessível + sem alert() (P1)

- [x] 4.1 `htmlFor`/`id` adicionados nos 10 campos — verificado ao vivo que os 10 pares resolvem corretamente via `document.getElementById`
- [x] 4.2 `alert()` de `excluirEscritorio` substituído por estado `erroExclusao` renderizado inline no diálogo, limpo ao abrir/fechar
- [x] 4.3 Verificado por leitura de código (não foi simulada uma falha real de exclusão para não arriscar dado de produção); o padrão replica exatamente `erro`/`erroLink`, já testados no mesmo arquivo

## 5. Alvos de toque + mobile (P1)

- [x] 5.1 `min-h-[44px]` nos chips de filtro e no campo de busca — medido 44px nos dois (eram 28px e 30px)
- [x] 5.2 Hero mantido intocado (padding/KPIs são um padrão compartilhado com 9 heroes irmãs — grep confirmou, não é bug local desta tela); em vez disso, a raiz da página virou `overflow-y-auto` abaixo de `md` e a área de lista+mapa ganhou altura própria fixa
- [x] 5.3 Lista e mapa mudaram de `h-[45%]`/`h-[55%]` (fatias de um espaço que já não cabia) para `h-[360px]` fixo em mobile, cada um com seu próprio scroll interno — desktop preservado via `md:h-auto md:flex-1`
- [x] 5.4 Verificado ao vivo em 375×812: lista com 360px de altura, 3 itens completamente visíveis (mínimo exigido pela spec era 2), scroll interno funcionando (`scrollHeight > clientHeight`); desktop 1440px re-verificado sem regressão (366px de altura em ambos os painéis, split preservado)

## 6. Fechamento

- [x] 6.1 `npx vite build` limpo (2 rodadas — 1ª antes de corrigir o `min-h`/altura do mobile que tinha crescido para 1507px por perda de contexto de altura limitada, 2ª depois)
- [x] 6.2 `openspec validate impeccable-escritorios --strict` limpo
- [ ] 6.3 Commit
