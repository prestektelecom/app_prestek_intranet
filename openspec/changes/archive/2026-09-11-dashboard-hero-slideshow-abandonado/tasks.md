## 1. Preparação e limpeza do estado

- [x] 1.1 Ler `Dashboard.jsx` e localizar a declaração de `heroBgImage` e o componente `HeroCard`
- [x] 1.2 Substituir estado `heroBgImage: string` por `heroBgImages: string[]` com inicialização que lê `dashboardHeroBgImages` do localStorage e faz fallback para `dashboardHeroBg` legado (migração automática)
- [x] 1.3 Atualizar a prop passada ao `HeroCard` de `bgImage/onChangeBg` para `bgImages/onChangeBgImages`

## 2. Utilitário de redimensionamento via Canvas

- [x] 2.1 Implementar função utilitária `resizeImageToDataUrl(file: File, maxPx = 1280, quality = 0.82): Promise<string>` usando `FileReader` + `HTMLCanvasElement` dentro de `Dashboard.jsx` (acima dos componentes)
- [x] 2.2 Testar a função manualmente com uma imagem grande (verificar que a dimensão máxima é 1280px e o formato é JPEG base64)

## 3. Componente HeroBgModal

- [x] 3.1 Criar componente `HeroBgModal({ images, onSave, onClose })` inline em `Dashboard.jsx`, acima de `HeroCard`
- [x] 3.2 Implementar grid de thumbnails: cada thumbnail com `object-cover`, proporção fixa, e botão × sobreposto para remoção
- [x] 3.3 Implementar estado vazio: mensagem visual quando `images.length === 0`
- [x] 3.4 Implementar área de upload: `<input type="file" accept="image/*" multiple hidden>` acionado por botão estilizado
- [x] 3.5 Implementar handler de upload: para cada arquivo selecionado, chamar `resizeImageToDataUrl` e adicionar ao estado local do modal
- [x] 3.6 Implementar botão "Salvar": persiste em `localStorage['dashboardHeroBgImages']` via `JSON.stringify`, chama `onSave(newImages)` e fecha o modal
- [x] 3.7 Implementar fechamento por backdrop (clique fora da área do modal)
- [x] 3.8 Verificar acessibilidade: foco no modal ao abrir, `aria-modal`, `aria-label`

## 4. Slideshow no HeroCard

- [x] 4.1 Refatorar `HeroCard` para aceitar `bgImages: string[]` e `onChangeBgImages`
- [x] 4.2 Adicionar estado `slideIndex: number` e `useEffect` com `setInterval(8000)` que avança o índice em loop; limpar o intervalo no cleanup
- [x] 4.3 Implementar dois layers `<img>` absolutamente posicionados com `transition: opacity 1s ease`; o layer ativo tem `opacity: 1`, o inativo tem `opacity: 0`
- [x] 4.4 Garantir que o overlay de legibilidade (`bg-gradient-to-br from-black/50 via-black/30 to-black/60`) seja renderizado acima dos layers de imagem
- [x] 4.5 Manter fallback para gradiente + grid SVG quando `bgImages.length === 0`
- [x] 4.6 Quando `bgImages.length === 1`, exibir imagem estática (sem intervalo, sem dois layers)

## 5. Integração e wiring

- [x] 5.1 Adicionar estado `isHeroBgModalOpen: boolean` no componente `Dashboard`
- [x] 5.2 Passar `onChangeBg={() => setIsHeroBgModalOpen(true)}` ao `HeroCard` para que o botão 🖼 abra o modal
- [x] 5.3 Renderizar `HeroBgModal` condicionalmente com `isHeroBgModalOpen`, passando `images={heroBgImages}`, `onSave` e `onClose`
- [x] 5.4 Handler `onSave`: atualizar estado `heroBgImages`, fechar modal

## 6. Verificação

- [ ] 6.1 Testar slideshow com 3 imagens: verificar crossfade suave a cada 8 segundos
- [ ] 6.2 Testar com 1 imagem: verificar que não há animação nem erro no console
- [ ] 6.3 Testar com 0 imagens: verificar que o gradiente padrão é exibido
- [ ] 6.4 Testar upload de foto de câmera (>3 MB): verificar que é redimensionada e salva sem erro de quota do localStorage
- [ ] 6.5 Testar remoção de imagem no modal: verificar que o slideshow reflete a mudança imediatamente
- [ ] 6.6 Testar migração legada: setar `localStorage['dashboardHeroBg'] = 'https://...'` e recarregar — verificar que a imagem aparece no slideshow
- [ ] 6.7 Verificar que, com imagens salvas, o Hero exibe somente a imagem (sem textos nem overlay) e que os textos de saudação aparecem apenas no fallback de gradiente

## Abandonada (2026-09-11, Fase 3 do programa Impeccable)

Tarefas 1-5 estavam concluídas (23/30); a 6 (verificação manual) nunca rodou.
Entre então e agora, o `Dashboard.jsx` foi reescrito por completo (commits
`1b17990`, `6054504`): o `HeroCard`, o `HeroBgModal` e todo o estado
`heroBgImage(s)` foram removidos do código. Não sobrou vestígio no `grep` do
repositório. O header do dashboard hoje é `DashboardHeader`, sem imagem de
fundo, sem slideshow, sem upload.

Decisão: abandonar. A funcionalidade não existe mais para "terminar" — seria
reimplementar algo que o próprio produto já decidiu não ter. Se o slideshow de
fundo voltar a ser desejado, abrir uma proposta nova a partir do `Dashboard.jsx`
atual, não retomar esta.
