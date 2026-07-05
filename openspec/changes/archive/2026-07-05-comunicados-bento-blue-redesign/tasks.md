## 1. Preparação e Tokens de Estilo

- [x] 1.1 Adicionar objeto `C` (paleta Bento Blue) e helper `tone()` no topo de `Comunicados.jsx`
- [x] 1.2 Adicionar helper `relativeTime()` para formatação de datas relativas (ex: "há 2h", "3d")
- [x] 1.3 Adicionar mapeamento `TYPE_META` para mapear tipo → { cor, badge, ícone }
- [x] 1.4 Adicionar novo estado `busca` (string) para controle do campo de busca do hero

## 2. Hero Banner

- [x] 2.1 Substituir bloco `<div className="mb-10 ...">` pelo componente `HeroBanner` com gradiente azul, grid SVG e blur orbs
- [x] 2.2 Implementar KPI pills glassmorphism: Total, Urgentes, Importantes, Gerais (com contagens calculadas de `comunicados`)
- [x] 2.3 Implementar campo de busca inline glassmorphism com ícone de lupa, placeholder e botão ✕ para limpar
- [x] 2.4 Mover botão "Novo Comunicado" (admin) para o hero, com estilo glassmorphism branco translúcido no canto superior direito
- [x] 2.5 Adicionar `<style>` com `@keyframes card-in` e `@keyframes pulse` para animações do feed

## 3. Lógica de Filtragem Atualizada

- [x] 3.1 Criar derivada `comunicadosPorBusca` filtrando por `busca` (sobre título + descrição, case-insensitive)
- [x] 3.2 Atualizar `comunicadosFiltrados` para filtrar `comunicadosPorBusca` por tipo (`filtro`)
- [x] 3.3 Calcular contagens por tipo (`countUrgente`, `countImportante`, `countGeral`) a partir de `comunicadosPorBusca`

## 4. Barra de Filtros e Ordenação

- [x] 4.1 Substituir a `<div>` de filtros atual pelo componente `FilterBar` com inline styles Bento Blue
- [x] 4.2 Implementar `ChipButton` com tokens `C`, estado ativo (border + background tinted), badge de contagem e hover suave
- [x] 4.3 Atualizar chips: "Todas", "Urgente" (`C.danger`), "Importante" (`C.warning`), "Geral" (`C.success`)
- [x] 4.4 Estilizar select de ordenação: `border: 1px solid C.line`, `borderRadius: 10`, `color: C.ink`, ícone `filter_list` em `C.accent`

## 5. Feed de Cards

- [x] 5.1 Substituir a `<div>` de timeline (com `before:`) pelo grid responsivo de cards: `gridTemplateColumns: repeat(auto-fill, minmax(340px, 1fr))`
- [x] 5.2 Implementar `ComunicadoCard` com: `borderRadius: 18`, `border: 1px solid C.line`, `borderLeft: 4px solid <cor>`, `background: C.surface`
- [x] 5.3 Implementar hover: `transform: translateY(-4px)`, `boxShadow` contextual com cor do tipo, transição `0.22s cubic-bezier`
- [x] 5.4 Adicionar badge de tipo com JetBrains Mono em uppercase e background `<tipo>Soft`
- [x] 5.5 Renderizar título com `fontWeight: 800`, `color: C.ink`, `fontSize: 17`, `letterSpacing: '-0.015em'`
- [x] 5.6 Renderizar descrição com `color: C.ink2`, `fontSize: 14`, `lineHeight: 1.6`, `whiteSpace: 'pre-wrap'`
- [x] 5.7 Renderizar data (relativeTime) e departamento com JetBrains Mono em `C.muted`
- [x] 5.8 Renderizar ações de admin (editar/excluir) no canto superior direito do card com hover colorido
- [x] 5.9 Renderizar link opcional no rodapé com divisória, `color: C.accent` e animação `arrow_forward`

## 6. Estados de Loading e Vazio

- [x] 6.1 Implementar `SkeletonCard` com pulse animado em `C.line`/`C.surfaceSoft` nas mesmas dimensões do card real
- [x] 6.2 Renderizar 6 skeletons durante `loading === true` no grid
- [x] 6.3 Implementar `EmptyState` centralizado com ícone em `C.accentSoft`, título, subtexto e botão "Limpar filtros"
- [x] 6.4 O botão "Limpar filtros" SHALL resetar `setBusca('')` e `setFiltro('Todas')`

## 7. Modal CRUD (Criar/Editar)

- [x] 7.1 Substituir overlay por `background: rgba(11,27,46,0.6)` + `backdropFilter: blur(8px)`
- [x] 7.2 Implementar header do modal com `background: linear-gradient(120deg, C.accentDeep, C.accent)`, ícone branco e título branco
- [x] 7.3 Estilizar inputs: `border: 1px solid C.line`, `borderRadius: 10`, `background: C.surfaceSoft`, focus com `borderColor: C.accent` + ring `0 0 0 3px rgba(accent, 0.15)`
- [x] 7.4 Estilizar select de tipo: mesma aparência dos inputs, com opções descritivas
- [x] 7.5 Estilizar botão "Cancelar": `background: C.surface`, `border: 1px solid C.line`, hover `C.surfaceSoft`
- [x] 7.6 Estilizar botão "Publicar/Salvar": `background: C.accent`, loading state com spinner e `opacity: 0.7`

## 8. Modal de Exclusão

- [x] 8.1 Substituir overlay por `background: rgba(11,27,46,0.6)` + `backdropFilter: blur(8px)`
- [x] 8.2 Estilizar modal com `border: 1px solid rgba(232,69,69,0.3)` e ícone centralizado em `C.dangerSoft`
- [x] 8.3 Estilizar botão "Cancelar": `C.surface`, `border: C.line`, hover `C.surfaceSoft`
- [x] 8.4 Estilizar botão "Sim, excluir!": `background: C.danger`, hover `rgba(danger, 0.85)`, `borderRadius: 10`

## 9. Verificação Final

- [x] 9.1 Verificar que toda lógica de negócio original está preservada (fetch, POST, PUT, DELETE, filtro por tipo, ordenação)
- [x] 9.2 Verificar que não há classes Tailwind com tokens âmbar remanescentes (`#a17745`, `#1d150c`, `#fcfaf8`, `#eaddcd`, `orange-`, `amber-`)
- [x] 9.3 Verificar responsividade: hero, grid de cards e filtros em viewport mobile (< 768px)
- [x] 9.4 Verificar que a página funciona com e sem itens (estado vazio), e durante loading (skeletons)
- [x] 9.5 Verificar que ações de admin (editar, excluir, criar) funcionam corretamente com usuário admin mockado
