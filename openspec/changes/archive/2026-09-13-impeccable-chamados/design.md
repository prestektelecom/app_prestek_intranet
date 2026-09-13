## Context

Escopo P1 dos relatórios de crítica (`.impeccable/critique/2026-09-13T12-28-39Z__src-components-ticketslist-jsx.md`, 22/40) e audit (11/20, Aceitável) da Fase 8 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. KPI "Pendentes" reconciliado com o filtro (P1)

`getStatusCategory` já retorna quatro categorias (`aberto`/`finalizado`/`cancelado`/`pendente`), e o filtro "Pendentes" já filtrava por `cat === 'pendente'` estritamente. Só o cálculo do KPI do hero usava `cat !== 'aberto' && cat !== 'finalizado'`, que também soma `cancelado`. Com a base atual (0 chamados cancelados) os dois números coincidem hoje, mas divergiriam assim que existisse um. Corrigido para `cat === 'pendente'`, igual ao filtro — mesmo princípio já aplicado em Comunicados e Colaboradores: hero e filtro precisam vir da mesma fonte de verdade.

### 2. Contraste do pill ativo (P1)

`color: isActive ? C.surface : C.ink2` → `color: isActive ? C.onAccent : C.ink2`. `C.surface` e `C.onAccent` têm o MESMO valor nos 4 temas escuros (por isso o bug não aparecia lá), mas divergem no claro (branco vs. navy) — daí a falha só se manifestar num tema. Medido ao vivo: 6,22:1 no claro (antes 2,79:1), 7,06:1 no AMOLED (sem mudança, já passava).

### 3. Acessibilidade dos pills de filtro (P1)

Mesmo padrão já estabelecido em `DirectoryToolbar.jsx`/`SectorsToolbar.jsx`: `type="button"` (evita submit acidental se algum dia entrar num `<form>`), `aria-pressed={isActive}`, `focus-visible:ring-2` e `min-h-[44px]`. O link "Limpar filtros"/"Limpar" em `FilterBar.jsx` (componente compartilhado, não exclusivo desta página) ganhou a técnica de expansão por pseudo-elemento (`after:-inset-y-[14px] after:-inset-x-2`) já usada na `Pilula` do Diretório (Fase 6) e no "Ver mais" de `SectorCard.jsx` (Fase 7) — leva o alvo de ~16px para 44px sem alterar o tamanho visual do texto sublinhado.

### 4. Achado no caminho: mesmo bug no badge de contagem do `FilterBar.jsx` (P1, mesma classe)

O badge numérico do botão "Filtros" mobile (`{activeFilters.length}`) também usava `color: C.surface` sobre `background: C.accent` — o mesmo bug do item 2, no mesmo arquivo já sendo tocado para o alvo de toque. Corrigido para `C.onAccent` junto.

## Fora de escopo (P2/P3, registrados em MEMORIA.md)

- Card mobile de `ResponsiveTable` duplica o texto do "Assunto" como título do card e nunca exibe o ID do chamado (a coluna `id`, índice 0, é pulada).
- Mismatch entre a copy da página ("meus chamados abertos por mim") e o dado real (a fila de atendimento completa do técnico, incluindo tarefas administrativas internas) — decisão de produto, não um fix de polish.
- Linhas da tabela totalmente inertes, sem drill-down/detalhe por chamado — sugestão da crítica, mas é uma feature nova (modal/drawer com histórico), fora do escopo de uma correção de polish desta fase.
- Sem busca, ordenação ou paginação para os 1000 registros carregados de uma vez.
- `parseTicketMessage` só limpa o template para tickets com o delimitador `====...====`; textos sem esse padrão passam quase crus.
