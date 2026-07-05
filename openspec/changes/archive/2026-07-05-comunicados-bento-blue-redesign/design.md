## Context

A página `Comunicados.jsx` é o único componente de nível de página que ainda usa a paleta "Warm Brown/Âmbar" original do projeto. As demais páginas (`Dashboard.jsx`, `ServicesDirectory.jsx`, `Directory.jsx`, `Coverage.jsx`) já foram migradas para o sistema visual "Bento Blue", que usa inline styles com tokens `C = { bg, surface, accent, ink, ... }`, fonte "Plus Jakarta Sans" + "JetBrains Mono", hero banner com gradiente azul, e componentes Bento (cards, chips, pills glassmorphism).

O componente atual (365 linhas) usa exclusivamente classes Tailwind com tokens amber e tem layout em timeline vertical. A lógica de dados (fetch, filtro, ordenação, CRUD) está correta e deve ser preservada integralmente; apenas a camada visual precisa ser reescrita.

## Goals / Non-Goals

**Goals:**
- Migrar toda a camada visual de `Comunicados.jsx` para o padrão Bento Blue.
- Adicionar hero banner com gradiente azul, KPI pills, e campo de busca integrado.
- Substituir o layout de timeline por feed de cards Bento com cores semânticas por tipo.
- Redesenhar chips de filtro com contagem (estilo `Directory.jsx` → `ChipButton`).
- Redesenhar modal CRUD e modal de exclusão no padrão Bento Blue.
- Preservar 100% da lógica de negócio: fetch, POST, PUT, DELETE, filtro, ordenação.
- Manter suporte a `user.is_admin` para ações de edição/exclusão.

**Non-Goals:**
- Alteração de endpoints de API ou contratos de dados.
- Adição de novas funcionalidades (ex: paginação, preview de imagem, reactions).
- Mudanças em `index.css` ou no sistema de temas globais.
- Refatoração de outros componentes além de `Comunicados.jsx`.
- Suporte a dark mode via media query (o sistema atual usa class-based theming; este componente passará a usar inline styles como os demais).

## Decisions

### D1: Inline styles vs. Tailwind classes

**Decisão**: Usar predominantemente inline styles com tokens `C{}` (como `Dashboard.jsx` e `Directory.jsx`), removendo classes Tailwind.

**Rationale**: Os demais componentes Bento Blue usam inline styles para ter controle fino sobre sombras, gradientes e transições — padrão que não é facilmente expressável em Tailwind sem `[...]` arbitrários. Consistência com o codebase existente é prioritária.

**Alternativa descartada**: Manter Tailwind mas trocar as cores. Isso criaria uma divergência de abordagem em relação aos componentes-referência.

---

### D2: Layout dos comunicados — feed de cards

**Decisão**: Substituir a timeline vertical por um **feed de cards** com grid responsivo (`1 → 2 → 3 colunas`), cada card com `border-left` colorido por tipo e hover `translateY(-4px)`.

**Rationale**: Grid de cards é o padrão Bento usado em `ServicesDirectory` e `Directory`. A timeline era visualmente interessante, mas não é consistente com o restante do sistema e usa âncoras absolutely positioned que são difíceis de manter.

**Alternativa descartada**: Manter timeline com nova paleta. Descartado por quebrar o padrão Bento.

---

### D3: Cores semânticas por tipo de comunicado

**Decisão**: Usar o objeto `C` para mapear tipos para cores do sistema:
- `Urgente` → `C.danger` (#E84545) com `C.dangerSoft`
- `Importante` → `C.warning` (#D97706) com `C.warningSoft`  
- `Geral` → `C.success` (#1F8A5B) com `C.successSoft`

**Rationale**: Reutiliza os tokens semânticos já definidos em todos os componentes Bento, evitando hardcoding de novos valores de cor.

---

### D4: Busca integrada no hero

**Decisão**: Incluir campo de busca inline no hero banner com glassmorphism (background `rgba(255,255,255,0.15)`, `backdropFilter: blur(8px)`), filtrando por `titulo` e `descricao`.

**Rationale**: O `Directory.jsx` tem o mesmo padrão e a experiência de busca inline no hero é consistente e elimina a necessidade de uma barra de busca extra fora do banner.

---

### D5: Botão "Novo Comunicado" dentro do hero

**Decisão**: Posicionar o botão "Novo Comunicado" (admin only) dentro do hero banner, no canto superior direito, com estilo glassmorphism (branco translúcido).

**Rationale**: Mantém o CTA principal visível e no contexto do banner, sem poluir a área de filtros.

---

### D6: Modal CRUD com header gradiente

**Decisão**: O modal de criação/edição terá header com `background: linear-gradient(120deg, accentDeep, accent)`, texto branco, e ícone de campanha — espelhando o hero banner.

**Rationale**: Reforça a identidade visual e diferencia claramente o modal do conteúdo da página.

## Risks / Trade-offs

- **[Risco] Dark mode**: Os componentes Bento Blue usam inline styles e não respondem às classes `dark:` do Tailwind. O sistema de temas do projeto precisa ser verificado para garantir que a ausência de `dark:` classes não quebre a experiência em modo escuro. → **Mitigação**: Verificar como `Dashboard.jsx` lida com dark mode e replicar a mesma abordagem (que é aceita pelo projeto).

- **[Risco] Regressão na lógica de filtro + busca combinados**: Adicionar busca de texto ao modelo de filtro por tipo pode introduzir bugs na contagem dos chips. → **Mitigação**: A lógica de filtragem deve ser separada: `busca` filtra antes, `filtro` (tipo) filtra depois; chips contam sobre `comunicadosPorBusca` (não sobre o total).

- **[Trade-off] Inline styles vs. manutenção**: Inline styles são mais verbosos que Tailwind. → Aceito, pois é o padrão estabelecido nos componentes-referência.
