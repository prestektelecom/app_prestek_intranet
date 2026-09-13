## 1. Remocao do Confetti

- [x] 1.1 Remover o estado `confettiLoaded` e o ref `confettiLoadingRef` de `ServicesDirectory.jsx`
- [x] 1.2 Remover as funcoes `triggerConfetti` e `runConfettiEffects` de `ServicesDirectory.jsx`
- [x] 1.3 Remover o `useEffect` que observa `activeSlide` e chama `triggerConfetti` (linhas 93-97)
- [x] 1.4 Verificar que nenhuma outra referencia a `confetti` ou `canvas-confetti` existe no arquivo apos remocao

## 2. Header e Tabs de Navegacao do Carousel

- [x] 2.1 Remover o bloco de 3 pontinhos de navegacao (`div` com os 3 botoes dot, linhas 752-757)
- [x] 2.2 Adicionar header de secao "Rankings do Mes" com subtitulo acima do container do carousel (`div className="mt-8 relative overflow-hidden"`)
- [x] 2.3 Criar os 3 botoes de tab de navegacao com icone + rotulo: Planos (`workspace_premium`), Colaboradoras (`group`), Ticket Medio (`request_quote`)
- [x] 2.4 Aplicar estilo ativo na tab correspondente ao `activeSlide` atual — implementado com o gradiente laranja da marca (`from-[#9A3412] to-[#EC7D23]`), não o azul originalmente descrito aqui (app migrou para "Bento Laranja" antes desta verificação)
- [x] 2.5 Garantir que cada tab tenha area de toque minima de 44x44px (`min-h-[44px] min-w-[44px]`)
- [x] 2.6 Conectar o `onClick` de cada tab ao `setActiveSlide(0|1|2)`

## 3. Verificacao

- [x] 3.1 Confirmado ao vivo, 2026-09-13: nenhum confetti aparece ao trocar de slide (auto-play observado por 2 ciclos)
- [x] 3.2 Confirmado via `browser_network_requests`: zero requisições contendo "confetti"
- [x] 3.3 Confirmado: `aria-pressed` da tab acompanha o `activeSlide` do auto-play (índice avançou de 1→2 sozinho após 3s)
- [x] 3.4 Confirmado em 375×800: as 3 tabs visíveis, cada uma com ≥44px de altura
