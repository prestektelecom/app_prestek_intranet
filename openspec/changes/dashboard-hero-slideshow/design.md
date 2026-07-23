## Context

O Hero Card do dashboard (`HeroCard` em `src/components/Dashboard.jsx`) foi introduzido pela change `dashboard-visual-refresh`. Atualmente suporta uma única imagem de fundo via `window.prompt()` (URL de texto), persistida em `localStorage['dashboardHeroBg']`. Não há suporte a múltiplas imagens, upload de arquivo local, ou transição entre imagens.

O componente é renderizado pelo `react-grid-layout` como item `static` (não movível), ocupando a linha completa do topo do painel.

## Goals / Non-Goals

**Goals:**
- Substituir `window.prompt()` por um modal visual de gerenciamento de imagens
- Suportar upload de arquivos locais (múltiplos de uma vez)
- Redimensionar automaticamente no browser para proteger o limite do localStorage (~5 MB)
- Implementar crossfade slideshow automático com intervalo de 8 segundos
- Manter compatibilidade retroativa com `localStorage['dashboardHeroBg']` (string legada)
- Zero novas dependências externas

**Non-Goals:**
- Upload para servidor / CDN
- Sincronização entre dispositivos (backend)
- Dots ou controles de navegação manual
- Configuração do intervalo pelo usuário
- Drag-and-drop para reordenar imagens

## Decisions

### D1: Canvas API para redimensionamento (vs. enviar imagem como está)

**Decisão**: Antes de converter para base64, redimensionar para máximo de 1280px na maior dimensão, com qualidade JPEG de 0.82.

**Alternativas consideradas**:
- *Salvar direto*: simples, mas foto de câmera (~3 MB) gera ~4 MB de base64, facilmente estoura o localStorage com 2 fotos.
- *IndexedDB*: resolveria o limite de tamanho sem redimensionamento, mas adiciona complexidade (API assíncrona, gerenciamento de object stores). Para o hero decorativo do dashboard, Canvas é suficiente.

**Rationale**: A imagem aparece em um container de ~218px de altura. 1280px de largura é mais que suficiente. O crossfade CSS não precisa de resolução alta.

### D2: Dois layers `<img>` sobrepostos com `opacity` para crossfade (vs. CSS `transition` em um único elemento)

**Decisão**: Dois elementos `<img>` absolutamente posicionados empilhados. O de cima tem `opacity: 0` (com `transition: opacity 1s ease`) quando deve sair e `opacity: 1` quando ativo.

**Alternativas consideradas**:
- *CSS animation `@keyframes`*: mais complexo, difícil de sincronizar com estado React.
- *N elementos empilhados (um por imagem)*: funciona, mas com muitas imagens cria DOM desnecessário. Para 2~3 imagens o custo é irrelevante, mas dois layers com swapping de `src` é mais simples de manter.

**Rationale**: Dois layers com troca de `src` é idiomático em slideshows React: o layer "fora" recebe o novo `src` e vai de `opacity 0 → 1`, enquanto o layer "dentro" vai de `opacity 1 → 0`. Sem flash, sem reflow.

### D3: Componente `HeroBgModal` inline em `Dashboard.jsx` (vs. arquivo separado)

**Decisão**: Manter inline no mesmo arquivo, extraindo como função componente acima de `HeroCard`.

**Alternativas consideradas**:
- *Arquivo separado `src/components/HeroBgModal.jsx`*: melhor separação, mas `Dashboard.jsx` já tem outros componentes inline (KpiCard, HeroCard, SetorBento etc.) e o modal só é usado aqui.

**Rationale**: Consistência com o padrão atual do arquivo. Extração futura é trivial se necessário.

### D4: Migração de `heroBgImage (string)` → `heroBgImages (string[])` com fallback

**Decisão**: Na inicialização do estado, ler `localStorage['dashboardHeroBgImages']` (novo). Se ausente, checar `localStorage['dashboardHeroBg']` (legado) e migrar automaticamente para o novo formato.

```js
() => {
  const newKey = localStorage.getItem('dashboardHeroBgImages');
  if (newKey) return JSON.parse(newKey);
  const legacy = localStorage.getItem('dashboardHeroBg');
  return legacy ? [legacy] : [];
}
```

**Rationale**: Usuários que já tinham uma imagem via URL não perdem a configuração.

## Risks / Trade-offs

- **[Risco] Limite do localStorage** → Mitigação: redimensionamento via Canvas (D1) limita cada imagem a ~150–300 KB em base64. Com 3 imagens: ~900 KB máximo, bem abaixo dos 5 MB.
- **[Risco] Formato WebP/HEIC não suportado por `canvas.toDataURL('image/jpeg')`** → Mitigação: o Canvas desenha qualquer formato que o browser consiga decodificar (WebP sim, HEIC depende do browser). A saída é sempre JPEG.
- **[Trade-off] Imagens ficam presas no dispositivo** → Aceitável por ora (requisito explícito: localStorage é suficiente).
- **[Trade-off] `Dashboard.jsx` já tem ~880 linhas** → O modal adiciona ~80–100 linhas. Continua dentro do limite funcional, mas reforça a necessidade de extrair componentes futuramente.
