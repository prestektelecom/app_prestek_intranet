# Convenções de Responsividade — Prestek Intranet

Este documento registra as convenções de estilo responsivo adotadas no projeto.

## Breakpoints

Usamos os breakpoints padrão do Tailwind CSS:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Princípios

1. **Mobile-first**: escreva o estilo base para mobile e use `md:`, `lg:` etc. para telas maiores.
2. **Evite valores fixos em pixels** em `style={{ ... }}` para layout responsivo. Prefira classes Tailwind (`w-full`, `flex-1`, `grid-cols-*`, `gap-*`).
3. **Tabelas**: use `ResponsiveTable` para tabelas de dados. Abaixo de `md` ela vira cards; entre `md` e `lg` mantém tabela com scroll controlado; acima de `lg` exibe a tabela completa.
4. **Ações em cards**: não esconda ações apenas no hover. Em telas touchscreen, as ações devem estar sempre visíveis ou acessíveis por um botão de menu. Use `TouchFriendlyActions` ou o hook `useTouchOnly`.
5. **Área de toque**: botões e ações clicáveis devem ter área mínima de 44×44px.
6. **Navegação mobile**: abaixo de `lg`, a `Sidebar` fixa é substituída por `MobileBottomNav` + `MobileDrawer`.
7. **Fonte de ícones**: Material Symbols é carregada com `display=block` e fallback CSS para evitar que ícones apareçam como texto.

## Componentes responsivos reutilizáveis

Localizados em `src/components/responsive/`:

- `ResponsiveBreadcrumb` — breadcrumb que trunca em telas pequenas
- `ResponsiveTable` — tabela adaptativa (tabela / cards)
- `FilterBar` — barra de filtros colapsável em mobile
- `MobileDrawer` — drawer lateral para navegação
- `PageShell` — estrutura comum de página responsiva
- `TouchFriendlyActions` — container de ações acessíveis por toque

## Hook útil

- `useTouchOnly` — detecta se o dispositivo primário é touchscreen (`(hover: none) and (pointer: coarse)`).

## Dashboard

O `react-grid-layout` gerencia layouts por breakpoint (`lg`, `md`, `sm`, `xs`, `xxs`). Os layouts são salvos no backend no formato objeto; o formato legado (array único) ainda é suportado para compatibilidade.

## Quando criar uma change de responsividade

Se uma nova página ou feature envolver:
- Tabelas densas
- Layouts de múltiplas colunas
- Ações em cards
- Formulários complexos

Verifique se os padrões acima foram aplicados antes de finalizar.
