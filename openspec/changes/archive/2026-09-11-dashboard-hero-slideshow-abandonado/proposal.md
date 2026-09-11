## Why

O Hero Card do dashboard exibe atualmente um gradiente estático ou uma única URL de imagem inserida manualmente via `window.prompt()`. Isso limita a personalização e oferece uma experiência pouco atraente para o usuário. A melhoria permite que cada usuário faça upload de múltiplas fotos e as veja passando automaticamente como slideshow no banner do painel.

## What Changes

- O botão ?? do Hero Card passa a abrir um **modal de gerenciamento de imagens** no lugar do `window.prompt()`
- O modal permite **upload de arquivos** diretamente do dispositivo (suporte a múltiplos arquivos)
- Imagens são **redimensionadas no browser** via Canvas API (máx. 1280px, qualidade ~0.82) antes de salvar, para respeitar o limite do localStorage
- A lista de imagens é **persistida em localStorage** como array de data URLs base64 (`dashboardHeroBgImages`)
- O Hero Card renderiza as imagens em **crossfade slideshow automático** (intervalo fixo de 8 segundos), sem dots de navegação
- Quando não há imagens salvas, mantém o comportamento atual (gradiente de accent + grid SVG)
- O estado migra de `heroBgImage: string` para `heroBgImages: string[]`

## Capabilities

### New Capabilities

- `hero-slideshow`: Slideshow automático de imagens no Hero Card com crossfade CSS, ciclo contínuo e intervalo fixo de 8s
- `hero-image-manager`: Modal de upload e gerenciamento de imagens do Hero (upload, preview, remoção, persistência em localStorage com redimensionamento via Canvas)

### Modified Capabilities

- Nenhum requirement existente é alterado; o Hero Card é um componente novo introduzido pelo `dashboard-visual-refresh` (já completo)

## Impact

- **`src/components/Dashboard.jsx`**: Refatoração do `HeroCard` e do estado `heroBgImage` ? `heroBgImages`; adição do componente `HeroBgModal`
- **localStorage**: chave `dashboardHeroBg` (string) ? `dashboardHeroBgImages` (JSON array); compatibilidade retroativa com a chave antiga
- **Sem novos endpoints de API** — solução 100% client-side
- **Sem novas dependências** — usa Canvas API nativa e FileReader API nativa
