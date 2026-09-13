## Context

Fase 10 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 10). Crítica dual-agent isolada 26/40 + audit técnico 13/20, ambos "Aceitável". Escopo aprovado pelo Felix: P0 + P1.

## Decisões técnicas

### 1. Teclado no `GradientCard` sem quebrar os botões aninhados

O card inteiro é um `motion.div` com `onClick`. Editar/comparar são `<button>` reais dentro de `topRightContent`/`footerRight`, já protegidos com `e.stopPropagation()` no clique. Adicionar `onKeyDown` no `motion.div` para Enter/Espaço exige uma guarda equivalente: `if (e.target !== e.currentTarget) return;` — Enter/Espaço num botão aninhado dispara o `onClick` nativo do próprio botão, mas o evento de teclado ainda borbulha até o `motion.div`; sem a guarda, o card abriria o modal de detalhe AO MESMO TEMPO que o botão aninhado executa sua própria ação. A guarda usa `target !== currentTarget` (só reage quando o próprio card, não um filho, está com foco), o mesmo princípio usado em outros componentes do projeto para distinguir clique no card vs. clique num controle interno.

`role="button"` + `tabIndex={0}` tornam o card focável e anunciável; `e.preventDefault()` no Espaço evita rolar a página (comportamento padrão do navegador para Espaço em elementos focáveis não-nativos).

### 2. Semântica de diálogo: reaproveitar o padrão já estabelecido, não reinventar

`useDismissable` (`src/hooks/useDismissable.js`) já cobre Escape + clique-fora + foco inicial + trava de scroll — é o hook usado por `OrgChartEditor.jsx`, `TiSupportModal.jsx`, `ManagePlantaoModal.jsx`. Este trabalho aplica o mesmo par `useDismissable` + `trapTab` local (idêntico ao de `OrgChartEditor.jsx`) a:
- `ModalShell.jsx` — o `ref` aponta para a caixa do diálogo (não para o backdrop `fixed inset-0`), senão `closeOnOutside` nunca dispara.
- Diálogo de exclusão inline em `ServicesDirectory.jsx` — mesmo padrão; o `onClick` do backdrop existente é mantido (redundante com `closeOnOutside`, mas inofensivo).
- `ServiceDetailModal.jsx` — já tem sua própria lógica de Escape/foco funcionando; só falta o trap de Tab. Em vez de trocar por `useDismissable` (risco de regressão em um componente que já funciona), adiciona-se apenas o `trapTab` local no `onKeyDown` do `motion.div` existente, reaproveitando o mesmo `FOCUSABLE` seletor do `OrgChartEditor.jsx`.

### 3. Alvo de toque dos ícones de editar/excluir: botões adjacentes exigem expansão menor, não a técnica padrão

A técnica usual (`after:-inset-N` generoso) presume um único controle isolado. Em `TechBentoCard.jsx`/`StreamingBentoCard.jsx`, editar e excluir são dois botões lado a lado com `gap-1`/`gap-1.5` (4-6px) — uma expansão de 10-12px por lado se sobreporia entre os dois. A correção aumenta o padding real do botão (`p-1`/`p-1.5` → `p-2`) e o espaçamento entre eles (`gap-1`/`gap-1.5` → `gap-2`), e usa uma expansão por pseudo-elemento menor (`after:-inset-1.5`) calibrada para não ultrapassar o meio do espaço entre os dois botões. Verificado ao vivo com `document.elementFromPoint` no ponto médio entre os dois: deve resolver para o botão mais próximo, nunca para ambos simultaneamente nem para nenhum.

`PlanoBentoCard.jsx` só tem o botão de editar (planos são sincronizados do IXC, sem exclusão local) — sem vizinho a considerar, recebe a expansão generosa padrão.

### 4. Cores do Rankings: só o que fica sobre o fundo da página muda

O pódio (`RANK_STYLES` em `RankingPodium.jsx`) é um cartão OPACO com gradiente laranja fixo — uma identidade de "troféu" deliberadamente independente de tema (ouro é ouro, bronze é bronze, em qualquer tema), e todo o texto dentro dele já é branco/claro contra esse fundo opaco próprio, então o contraste interno não muda por tema. Essa parte fica intocada.

O que muda é o que fica DIRETAMENTE sobre o fundo da página (que varia por tema): o heading "Top 3 Planos" etc. (`text-slate-900 dark:text-white` → `text-foreground`), a legenda de medalhas (`bg-[#FFF7ED]` + cores por posição → `bg-[var(--accent-soft)] text-[var(--accent-dark)]`, unificando as 3 entradas em vez de 3 pares quase-duplicados) e as tabs de navegação do carousel em `RankingsSection.jsx` (mesmo tratamento, removendo o resquício `hover:bg-[#D6E9FF]` da paleta antiga).

### 5. `text-muted` → `text-faint`

Substituição direta nos usos como texto real (rótulos, hints, legendas, subtítulos, texto de estado vazio) em `ModalShell.jsx`, `PlanEditModal.jsx`, `ServiceDetailModal.jsx`, `ServicesFilterBar.jsx`, `ServicesDirectory.jsx`, `PlansGrid.jsx`, `RankingPodium.jsx`, `RankingsSection.jsx`, `PlanoComparador.jsx`. O ícone de fechar do `ModalShell.jsx` (glifo isolado, sem texto ao lado) mantém `text-muted` — a regra do programa é "muted só para ícone inativo/placeholder, nunca texto real abaixo de 14px".

## Verificação

Cada fix verificado ao vivo via Playwright (claro + AMOLED, dado real de produção): teclado (Tab até o card, Enter/Espaço abre o detalhe, sem duplo-disparo quando o foco está num botão aninhado), Escape/clique-fora/trap de Tab nos 4 diálogos, contraste via `getComputedStyle` + luminância relativa, alvo de toque via `getBoundingClientRect` + `elementFromPoint` nos pontos de fronteira entre botões adjacentes.
