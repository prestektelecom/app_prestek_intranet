## Context

O Prestek Intranet é uma aplicação React 18 + Vite que usa Tailwind CSS como sistema de estilos principal, mas convive com uma grande quantidade de componentes legados escritos com `style={{ ... }}` e valores fixos em pixels. A navegação já possui `MobileBottomNav` e `MobileMoreSheet`, o que mostra que houve esforço anterior de adaptação mobile, mas ele não foi estendido às páginas internas nem aos componentes compartilhados.

As screenshots anexadas ao projeto mostram problemas reais: breadcrumbs sobrepostos, ícones renderizados como texto (`chevron_left`, `tune`, `location_off`) e a página de Cobertura com layout fixo quebrado. A mudança precisa ser cross-cutting porque envolve componentes compartilhados (`Header`, `Sidebar`), padrões de página e várias telas com tabelas densas.

## Goals / Non-Goals

**Goals:**
- Garantir que ícones renderizem corretamente em todas as condições de rede.
- Criar componentes reutilizáveis que encapsulem padrões responsivos (tabela, drawer, breadcrumb, filtros, shell de página).
- Refatorar os componentes compartilhados `Header` e `Sidebar` para usar Tailwind com breakpoints.
- Adaptar as páginas de maior impacto (Dashboard, Cobertura, Diretório, Agenda, Tickets, Processos, Escritórios, Admin) para mobile/tablet.
- Substituir interações hover-only por estados acessíveis no toque.
- Estabelecer convenções para evitar novos inline styles fixos em pixels.

**Non-Goals:**
- Não reescrever o sistema de rotas (continua baseado em `currentView`).
- Não substituir `react-grid-layout` no Dashboard; apenas ajustar widgets internos.
- Não criar versão nativa/PWA; foco em web responsivo.
- Não alterar a paleta de cores, tipografia ou identidade visual.

## Decisions

### 1. Tailwind como fonte única de estilos responsivos
**Decision:** Todos os ajustes de layout responsivo serão feitos com classes Tailwind (`sm:`, `md:`, `lg:`, `xl:`). Inline styles com valores fixos serão migrados gradualmente, começando pelos componentes compartilhados.
**Rationale:** Tailwind já está configurado e é usado nas páginas mais novas. Padronizar reduz inconsistência e facilita manutenção.
**Alternatives considered:** Manter inline styles e adicionar media queries manualmente — rejeitado porque aumentaria a fragmentação.

### 2. Componentes reutilizáveis em `src/components/responsive/`
**Decision:** Criar uma pasta dedicada para componentes responsivos compartilhados: `ResponsiveTable`, `ResponsiveBreadcrumb`, `FilterBar`, `MobileDrawer`, `PageShell`.
**Rationale:** Centraliza a lógica responsiva e evita repetição em cada página.
**Alternatives considered:** Colocar componentes espalhados em `src/components/common/` — rejeitado para manter clareza do escopo responsivo.

### 3. Tabelas: scroll horizontal em tablet, cards em mobile
**Decision:** Em telas abaixo de `md` (768px), tabelas de alta densidade serão convertidas para listas de cards. Entre `md` e `lg`, mantém-se a tabela com `overflow-x-auto` e colunas prioritárias visíveis.
**Rationale:** Cards são mais legíveis em telas muito estreitas; scroll horizontal excessivo prejudica usabilidade.
**Alternatives considered:** Apenas scroll horizontal em todos os breakpoints — rejeitado por ser péssimo em smartphones.

### 4. Sidebar fixa vira drawer em telas pequenas
**Decision:** Abaixo de `lg` (1024px), a `Sidebar` deixa de ser fixa e vira um drawer acionado por um botão no `Header`. A navegação primária continua sendo a `MobileBottomNav`.
**Rationale:** Preserva acesso rápido a itens secundários sem competir com a bottom nav.
**Alternatives considered:** Manter bottom nav + more sheet como única navegação — rejeitado porque alguns itens da sidebar não cabem no sheet.

### 5. Carregamento síncrono da fonte de ícones
**Decision:** Carregar a fonte Material Symbols de forma síncrona no `<head>` de `index.html` e adicionar fallback com SVG ou classe de estado enquanto a fonte não carrega.
**Rationale:** Ícones como texto destroem a interface; pré-carregar a fonte elimina o problema na maioria dos casos.
**Alternatives considered:** Substituir todos os ícones por SVG inline — rejeitado por ser trabalhoso demais para esta change.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Regressão visual no `Header`/`Sidebar` ao migrar inline styles | Testar nos breakpoints `sm`, `md`, `lg`, `xl` e comparar pixel a pixel com a versão anterior. |
| Tabelas como cards podem esconder colunas importantes | Definir colunas prioritárias por página e expandir card ao toque para mostrar detalhes. |
| `react-grid-layout` pode não respeitar breakpoints internos dos widgets | Ajustar `cols`/`breakpoints` do grid e garantir que widgets internos usem grids responsivos. |
| Aumento de complexidade com muitos componentes novos | Manter componentes pequenos e bem documentados; não criar abstração prematura. |
| Tempo de implementação alto por abranger muitas páginas | Dividir em fases: fase 1 (fundacional), fase 2 (páginas críticas), fase 3 (restantes). |

## Migration Plan

1. **Fase 1 — Fundação**: ícones, `Header`, `Sidebar`, componentes reutilizáveis responsivos.
2. **Fase 2 — Páginas críticas**: Dashboard, Cobertura, Diretório.
3. **Fase 3 — Tabelas**: Agenda, Tickets, Processos, Escritórios, Admin.
4. **Fase 4 — Polimento**: ajustes finos, testes visuais, padronização de convenções.

Rollback: como são alterações de frontend, o rollback é por `git revert` do conjunto de commits da change. Recomenda-se fazer commits pequenos por fase.

## Open Questions

- Qual o breakpoint mínimo oficialmente suportado? (320px ou 360px?)
- A tabela de Admin deve ter ações de edição inline nos cards mobile?
- O mapa da Cobertura deve ocupar tela cheia em mobile ou manter proporção fixa?
