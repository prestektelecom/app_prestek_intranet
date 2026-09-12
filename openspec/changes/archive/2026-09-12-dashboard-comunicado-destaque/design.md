## Context

O Dashboard atual já busca comunicados via `/api/comunicados` dentro do `ComunicadosCard` (um widget do Bento Grid). O card tem um header colorido que exibe o primeiro comunicado como "destaque" — mas sem imagem, sem impacto visual real. O restante da lista fica numa coluna estreita (6/12 colunas).

A referência visual desejada é um **banner editorial full-width** — similar ao que portais como Notion, Linear e intranets Apple/Stripe usam para comunicações internas importantes: imagem de capa com overlay escuro e texto sobreposto, posicionado estaticamente entre o cabeçalho da página e o grid de widgets.

## Goals / Non-Goals

**Goals:**
- Criar `ComunicadoBanner` — componente React estático (fora do `react-grid-layout`) posicionado entre `DashboardHeader` e `ResponsiveReactGridLayout`.
- Exibir o comunicado de maior prioridade (Urgente > Importante > mais recente) com imagem de capa, overlay gradiente, badge de tipo e texto sobreposto.
- Implementar fallback elegante (gradiente sólido + ícone + título) quando não há imagem disponível.
- Ajustar `ComunicadosCard` no Bento para listar apenas os comunicados secundários (excluindo o que está no banner).
- Clicar no banner navega para a view `announcements`.
- Transição suave de entrada (fade-in) no carregamento.

**Non-Goals:**
- Adicionar campo de imagem à API de comunicados (usa `imagem_url` se o campo já existir; caso contrário, sempre usa fallback).
- Criar carousel/slideshow de múltiplos comunicados em destaque — apenas 1 por vez.
- Alterar a tela completa de Comunicados (`Comunicados.jsx`).
- Paginação ou auto-rotação do banner.

## Decisions

### D1 — Componente estático fora do grid (vs. widget do grid)
**Decisão**: `ComunicadoBanner` é renderizado fora do `ResponsiveReactGridLayout`, diretamente no JSX do componente pai, como elemento estático.

**Rationale**: O banner tem papel editorial/hierárquico — como um título de página — não é um widget de dados com posição variável. Inserir no grid causaria complexidade de layout desnecessária (h fixo, w=12, não pode ser movido). Mantê-lo estático garante que sempre apareça abaixo do `DashboardHeader`, sem risco de desalinhamento.

**Alternativa considerada**: Widget `hero` no grid (como era antes) — descartado pelo usuário por ser redundante.

---

### D2 — Prioridade de seleção do comunicado em destaque
**Decisão**: O banner exibe o comunicado no topo da lista ordenada por `criado_em DESC`. Se o array tiver itens `Urgente` ou `Importante`, eles têm prioridade sobre os mais recentes.

**Rationale**: Simples de implementar sem alterar a API. A ordenação já existe no `ComunicadosCard`. Comunicados urgentes devem naturalmente sobressair.

**Implementação**:
```js
const featured = comunicados.find(c => c.tipo === 'Urgente')
  || comunicados.find(c => c.tipo === 'Importante')
  || comunicados[0]
  || null;
```

---

### D3 — Imagem de capa: campo `imagem_url` (opcional)
**Decisão**: Se o comunicado tiver campo `imagem_url` (ou `foto`, `capa`) populado, usar como `background-image`. Se não tiver, usar gradiente sólido temático por tipo.

**Rationale**: Não força mudança na API. Funciona hoje com fallback, e quando a equipe quiser adicionar imagens aos comunicados no futuro, o banner já estará pronto para consumi-las.

---

### D4 — Compartilhamento de dados entre Banner e ComunicadosCard
**Decisão**: Cada componente faz seu próprio fetch de `/api/comunicados`. Não usar context ou prop drilling.

**Rationale**: Consistente com o padrão atual do projeto (cada card é auto-suficiente). O endpoint é leve e rápido. Evita acoplamento entre componentes.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Dois fetches para `/api/comunicados` no mesmo carregamento | Impacto mínimo (payload pequeno, sem cache invalidation). Pode-se futuramente centralizar via Context. |
| Comunicado sem imagem deixa banner com visual menos impactante | Gradiente sólido + ícone garante fallback aceitável. Incentivar equipe a adicionar imagens. |
| Banner ocupa altura mesmo quando não há comunicados | Suprimir o banner completamente (`return null`) quando a lista estiver vazia. |
