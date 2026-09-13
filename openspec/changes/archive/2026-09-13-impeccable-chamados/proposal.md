## Why

A Fase 8 (Meus Chamados) do programa Impeccable começou resolvendo 3 changes pendentes (`tickets-pivot-para-os`, `tickets-theme-cores-adaptativas`, `corrigir-overflow-protocolo-suporte`) — todas já implementadas por uma reescrita anterior de `TicketsList.jsx`, verificadas e arquivadas. Em seguida, uma crítica dual-agent (`.impeccable/critique/2026-09-13T12-28-39Z__src-components-ticketslist-jsx.md`, 22/40, Aceitável) e um audit técnico (11/20, Aceitável, 55%) rodaram sobre o arquivo já reescrito. Nenhum achado chegou a P0. 3 P1:

- **P1** — o pill de filtro ativo ("Abertos", pré-selecionado por padrão) usava `color: isActive ? C.surface : C.ink2` sobre `background: C.accent`. No tema claro isso renderiza branco sobre laranja, medido em 2,79:1 — a mesma violação que o DESIGN.md já proíbe ("texto pequeno sobre laranja é onAccent, nunca branco"). Passava por coincidência nos 4 temas escuros, onde `C.surface` tem o mesmo valor de `C.onAccent`.
- **P1** — os 5 pills de filtro não tinham `aria-pressed`, não tinham anel de foco visível ao navegar por Tab, e mediam ~30px de altura (abaixo do mínimo de 44px do AGENTS.md); o link "Limpar filtros"/"Limpar" (componente compartilhado `FilterBar.jsx`) media ~16px.
- **P1** — o KPI "Pendentes" do hero somava qualquer status que não fosse aberto/finalizado (incluindo cancelado), enquanto o filtro "Pendentes" mostrava só status estritamente pendente — mesma classe de divergência KPI-vs-filtro já corrigida em Comunicados (Fase 5) e Colaboradores (Fase 6).

Por decisão do Felix (2026-09-13), o escopo desta change é P1. Os P2 (card mobile duplicando o assunto e omitindo o ID do chamado; mismatch entre a copy "meus chamados" e o dado real, que é a fila de atendimento do técnico) e a sugestão de um drill-down/detalhe por chamado (feature nova, fora do escopo de uma correção de polish) ficam registrados em `MEMORIA.md` para uma rodada futura.

## What Changes

- `TicketsList.jsx`: KPI "Pendentes" passa a contar estritamente `status === 'pendente'`, não mais "qualquer status que não seja aberto/finalizado".
- `TicketsList.jsx`: os 5 pills de filtro de status ganham `type="button"`, `aria-pressed`, anel de foco visível, altura mínima de 44px, e o estado ativo troca `color: C.surface` por `C.onAccent`.
- `FilterBar.jsx` (compartilhado): os links "Limpar filtros"/"Limpar" ganham alvo de toque de 44px via expansão por pseudo-elemento (mesma técnica já usada em `Pilula`/`SectorCard`, Fases 6/7), sem alterar o tamanho visual do texto; o badge de contagem do botão "Filtros" mobile troca `color: C.surface` por `C.onAccent` (mesmo bug, mesma correção).

## Capabilities

### Modified Capabilities

- `tickets-listagem-por-os`: adiciona requisito de consistência do KPI "Pendentes" com o filtro, e de contraste/acessibilidade dos pills de filtro.

## Impact

- **`src/components/TicketsList.jsx`**: cálculo do KPI "Pendentes", pills de filtro de status.
- **`src/components/responsive/FilterBar.jsx`**: links "Limpar filtros"/"Limpar", badge de contagem — componente compartilhado, usado por outras páginas com filtro.
- Nenhuma alteração de API ou banco de dados.
