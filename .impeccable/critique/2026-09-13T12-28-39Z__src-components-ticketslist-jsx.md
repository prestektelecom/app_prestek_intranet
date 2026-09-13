---
target: src/components/TicketsList.jsx
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\TicketsList.jsx"
target_fingerprint: "sha256:e761e4c5d6750b6742c1836b9faddb2e83ee2690af800c1e43f17815f0f61c6c"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\TicketsList.jsx"
timestamp: 2026-09-13T12-28-39Z
slug: src-components-ticketslist-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Sem timestamp de última sincronização nem refresh manual |
| 2 | Match System / Real World | 1 | Copy fala "meus chamados abertos por mim", mas o dado real é a fila de atendimento do técnico (1000 registros, tarefas internas) |
| 3 | User Control and Freedom | 2 | Filtro fácil de trocar, mas nenhuma saída para mais detalhe (sem drawer/modal) |
| 4 | Consistency and Standards | 3 | `StatusBadge` reusa corretamente o par Soft/Deep; prejudicado pelo bug de contraste do pill ativo |
| 5 | Error Prevention | 3 | Página só-leitura, nada destrutivo a prevenir |
| 6 | Recognition Rather Than Recall | 3 | Ícones dos KPIs com rótulo de texto; filtros sempre visíveis |
| 7 | Flexibility and Efficiency | 1 | 1000 registros, só 5 filtros grosseiros — sem busca, ordenação ou intervalo de data |
| 8 | Aesthetic and Minimalist Design | 3 | Composição limpa, sem ruído |
| 9 | Error Recovery | 3 | Mensagem em linguagem simples + retry de um clique |
| 10 | Help and Documentation | 1 | Nenhuma explicação do que os status significam operacionalmente |
| **Total** | | **22/40** | **Aceitável (55%)** |

## Design Specificity Verdict

O hero segue fielmente o padrão das telas irmãs (Ti/Cobertura/Serviços/Colaboradores/Setores). Além do hero, a página vira uma tabela genérica de tickets — nada na composição comunica que são chamados de telecom/IXC além do texto cru dentro das linhas. Mais grave: a cópia ("Acompanhe o status de todos os seus chamados... abertos") descreve chamados pessoais, mas o dado real é a fila de atendimento inteira do técnico (1000 registros, tarefas administrativas internas). Não é um problema de "template genérico" — é um público errado dentro de um template corretamente reaproveitado.

## Deterministic Scan (CLI `impeccable detect`)

3 achados, todos `design-system-font-size` (advisory), exit 0. Todos os 3 confirmados como o mesmo padrão compartilhado do hero (10/17/15px) já usado verbatim em `TiHero`/`CoverageHero`/`ServicesHero`/`DirectoryHero`/`SectorsHero` — não acionável localmente (mesma decisão da Fase 6/7).

## Browser Evidence — Falsos Positivos Confirmados

- **`low-contrast` "branco sobre #f97316" no hero**: o detector lê só `backgroundColor` (transparente, já que o fundo real é `background: <gradiente>`); o texto do hero fica sobre a ponta ESCURA do gradiente (`accentDeep`), não a ponta clara amostrada — confirmado visualmente, o texto é legível.
- **184× `nested-cards` e 3× `text-occlusion` a 360px**: o overlay do próprio detector sobrepõe seus rótulos aos cards reais — são artefatos do injetor, não da aplicação.
- **`undersized-ui-text` nos rótulos do hero**: mesmo padrão compartilhado de 10px já documentado.

## Genuine Findings (Not Dismissed)

- **Contraste do pill de filtro ativo, confirmado por ambos os assessments com medição independente**: `color: isActive ? C.surface : C.ink2` sobre `background: C.accent`. Claro: `rgb(255,255,255)` sobre `rgb(236,125,35)` = **2,79:1** (reprova). AMOLED: `rgb(10,10,10)` sobre `rgb(249,115,22)` = **7,07:1** (passa, por coincidência de `C.surface` == `C.onAccent` nos 4 temas escuros).
- **Alvo de toque dos 5 pills de filtro**: 253×30px, abaixo do mínimo de 44px. "Limpar" mede 39,8×16px.
- **Nenhum `aria-pressed` nos pills de filtro** — ausente nos 5 botões, ao contrário do padrão já estabelecido em Directory/Sectors.
- **Nenhum anel de foco visível** nos pills ao navegar por Tab.
- **Linhas da tabela totalmente inertes** (sem `onClick`/`tabindex`/`role`) — o "Assunto" trunca em 150 caracteres sem nenhuma forma de expandir ou ver detalhe.
- **Divergência latente entre o KPI "Pendentes" e o filtro "Pendentes"**: o KPI soma tudo que não é aberto/finalizado (inclui cancelados), o filtro mostra só status estritamente pendente — hoje concordam (0 cancelados na base), mas é o mesmo padrão de divergência já visto em Comunicados/Colaboradores.
- **Card mobile duplica o assunto e nunca mostra o ID do chamado** — `cardTitle` usa o mesmo texto de `Assunto`, e a coluna `id` (índice 0) é pulada pelo `ResponsiveTable` no card.
- Nenhum controle de busca, ordenação ou paginação para 1000 registros carregados de uma vez (~4-6s de spinner observado ao vivo).

## Priority Issues

**[P1] Pill de filtro ativo reprova contraste no tema claro** — `color: isActive ? C.surface : C.ink2` deveria ser `C.onAccent`, o par que o próprio `useBentoTheme.js` já documenta para texto sobre laranja. É o estado padrão ao abrir a página ("Abertos" já vem selecionado).

**[P1] Alvos de toque dos pills de filtro e do link "Limpar" abaixo de 44px, sem `aria-pressed` e sem anel de foco visível** — os 3 problemas juntos tornam o controle mais usado da página praticamente inacessível por teclado/toque.

**[P1] KPI "Pendentes" pode divergir do filtro "Pendentes"** — mesmo padrão de bug já corrigido em Comunicados (Fase 5) e Colaboradores (Fase 6): a base de cálculo do hero precisa ser a mesma do filtro.

**[P2] Card mobile duplica o assunto e omite o ID do chamado** — o dado que um usuário precisaria citar numa ligação de suporte é justamente o que some no mobile.

**[P2/P3 — acompanha decisão do usuário, não é um "fix" no sentido usual]** Mismatch de público: a cópia da página fala de chamados pessoais, mas o dado é a fila de atendimento do técnico. Corrigir a COPY é simples (P2); decidir se a página deveria ter dois modos (solicitante vs. técnico) ou uma tela de detalhe por chamado é uma decisão de produto maior, fora do escopo de uma correção de polish.

## Persona Red Flags

- **Alex (técnico com centenas de chamados)**: sem busca/ordenação em 1000 registros; linhas sem nenhuma interação; sem indicador de idade do chamado (um "Aberto" de 6 semanas atrás parece igual a um de hoje).
- **Jordan (colega não-T.I. com um chamado)**: status nunca explicados; texto de erro ("avise a TI") soa estranho na própria tela da TI; se o filtro por `colaborador_id` não bater com o técnico responsável, pode ver "Nenhum chamado encontrado" e concluir errado que o pedido não foi registrado.
- **Casey (mobile, distraído)**: pill de filtro a 30px de altura; ID do chamado ausente no card mobile — não dá pra citar o número numa ligação.

## Minor Observations

- `parseTicketMessage` só limpa o template para tickets que realmente têm o delimitador `====...====`; textos sem o padrão passam quase crus (maiúsculas, números colados).
- "Limpar filtros" aparece por padrão porque o filtro inicial já é "aberto", não "todos".
- Sessão desloga em reload simples sem "Manter conectado" marcado — atrito extra numa página cujo uso natural é "conferir de novo depois".
