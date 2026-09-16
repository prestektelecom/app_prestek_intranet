# Placar do Programa Impeccable — Fases 1-15

Consolidado na Fase 16 (Encerramento), tarefa 16.5. Fonte: `openspec/changes/programa-impeccable/tasks.md` e `git log`. Números citados exatamente como registrados durante cada fase.

**Sobre "antes/depois":** só as Fases 1-3 tiveram uma segunda rodada de crítica/audit *rescoreada* depois das correções (metodologia ainda em formação). A partir da Fase 4, o padrão que se firmou foi verificar cada P0/P1 corrigido **ao vivo no navegador** (Playwright, nos 5 temas relevantes) em vez de rodar uma nova crítica dual-agent completa — mais barato e mais preciso por item do que uma repontuação inteira. Por isso a coluna "depois" fica em branco (`—`) para a maioria das fases: não é dado ausente, é uma escolha de método.

## Placar

| Fase | Superfície | Crítica (antes) | Crítica (depois) | Audit | P0 | P1 | Change filha | Commit(s) | Achado principal |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Chrome global | 19/40 | 27/40 (3 rodadas) | 9→15/20 | 1 | 3-7 | `impeccable-chrome` | `de5733d`, `6ddbe72` | Painel Admin visível/roteável para não-admin |
| 2 | Login + NotFound | 16/40 | 31/40 | 6→15/20 | 1 | 4-5 | `impeccable-login` | `cebf56f` | E-mail inexistente devolvia exceção crua (`erro.message`) |
| 3 | Dashboard | 26/40 | 35/40 | 12/20 (—) | 1 | 4 | `impeccable-dashboard` | `83a059e` | Botão "Gerenciar Meus Chamados" branco sobre branco (1,0:1) |
| 4 | Plantão | 23/40 (Aceitável) | — | 9/20 (Ruim) | 3 | 2 | `impeccable-plantao` | `4e4f330` | Sobrescrita silenciosa de data em "Novo Plantão" |
| 5 | Comunicados | 17/36¹ (Ruim, 47%) | — | 9/20 (Ruim) | 2 | 2 | `impeccable-comunicados` | `62868e0` | Nenhum modal tinha `role="dialog"`/foco/Escape |
| 6 | Colaboradores | 25/40 (Aceitável) — **0 P0** | — | 14/20 (Bom) | 0 | 4 | `impeccable-colaboradores` | `475b1c9` | KPI "Ativos" divergindo do chip de situação |
| 7 | Setores + Organograma | 22/40 (Aceitável) | — | 9/20 (Ruim, 45%) | 2 | 5 | `impeccable-setores` | `46ea9e3` | `OrgChartEditor.jsx` sem nenhuma semântica de diálogo |
| 8 | Meus Chamados | 22/40 (Aceitável) — **0 P0** | — | 11/20 (Aceitável, 55%) | 0 | 3 | `impeccable-chamados` | `357ec0d` | Pill de filtro ativo a 2,79:1 (`C.surface` sobre `C.accent`) |
| 9 | Cobertura | 25/40 (Aceitável) | — | 12/20 (Aceitável, 60%) | 1 | 2 | `impeccable-cobertura` | `11a8860` | `OverrideModal.jsx` fabricava classificação padrão (FTTH/Ativo/100%) |
| 10 | Serviços | 26/40 (Aceitável) | — | 13/20 (Aceitável, 65%) | 2 | 3 | `impeccable-servicos` | `2351102` | `ui/gradient-card.jsx` sem via de teclado — ação primária inacessível |
| 11 | Escritórios | 18/40 (Ruim, 45%)² | — | 11/20 (Aceitável, 55%) | 3 | 4 | `impeccable-escritorios` | `baa94e7` | Mapa ignorava filtro/busca; tela nunca mudava de tema abaixo do hero |
| 12 | Processos | 24/40 (Aceitável, 60%) | — | 10/20 (Aceitável, 50%)³ | 3 | 3 | `impeccable-processos` | `8e2f4cb` | CRUD inteiro sem persistência real (array estático, sem API) |
| 13 | Configurações | 22/40 (Aceitável, 55%) | — | 12/20 (Aceitável, 60%) | 2 | 5 | `impeccable-configuracoes` | `8213b2f` | Popover de avatar sem nenhuma semântica de diálogo |
| 14 | TI | A: 23/40 (Aceitável, 58%)⁴ | — | 10/20 (Aceitável)³ | 2 | 7 | `impeccable-ti` | `b3e00cb`, `e60c50b` | Zero regiões `aria-live` — toast e dry-run mudos para leitor de tela |
| 15 | Painel Admin | A: 17/40 (Ruim, 42,5%)⁴ | — | **5/20 (Crítico, 25%)**⁵ | 5 | 7 | `impeccable-admin` | `2b9eeec` | Conceder/revogar admin sem confirmação — pior achado do programa |

¹ Denominador 36, não 40: um heurístico (H10) foi marcado n/a para esta superfície.
² Pior nota de crítica do programa até a Fase 11 (superada pela Fase 15 no audit).
³ "No limite inferior" da faixa Aceitável (50%).
⁴ Dual-agent com detector "quase cego" no arquivo (Assessment B sem cor literal para capturar via regex — estilo 100% via `useBentoTheme()`/variável CSS); P0/P1 consolidados incluem achados ao vivo da própria Assessment B além da nota numérica da A.
⁵ Pior nota do programa inteiro, em qualquer métrica.

## Leitura do placar

- **Trajetória de audit não é monotônica** — não deveria ser: cada fase mede uma superfície *diferente* que nunca tinha sido tocada, não a mesma superfície evoluindo. A Fase 15 (5/20) é pior que a Fase 1 (9/20 antes de qualquer correção) porque o Painel Admin, por ser renderizado fora do shell principal (decisão registrada desde 2026-09-08), nunca recebeu nenhuma correção incidental das 14 fases anteriores.
- **Duas fases sem nenhum P0** (6 e 8) — ambas telas de LEITURA de dado real do IXC (Colaboradores, Chamados), sem nenhuma ação administrativa de consequência. As piores notas (11, 15) são exatamente o oposto: telas com ações administrativas de escrita real (Escritórios exclui, Processos "cria", Admin concede privilégio).
- **A pior nota de audit do programa (Fase 15, 5/20) e o achado mais grave de integridade (elevação de privilégio sem confirmação) caem na MESMA fase** — reforça que Implementation Integrity 0/4 correlaciona com o resto da tela, não é um dimensão isolada.
- **9 das 15 fases encontraram e corrigiram a mesma instância de `C.muted`/`text-muted` como texto real** — o antipadrão mais repetido do programa, fechado transversalmente na Fase 16 (ver `openspec/changes/programa-impeccable/tasks.md`, seção Transversal).
- **7 ocorrências do bug "branco/`C.surface` sobre laranja como texto pequeno"** em 5 fases distintas (chrome, Setores, Setores de novo, Chamados, Admin) — 2ª maior recorrência do programa, também fechada na Fase 16.

## O que este placar não mostra

- **Trabalho de reconciliação de changes órfãs/em-andamento**, que precedeu a crítica em 8 das 15 fases (5, 6, 8, 9, 10, 12, 13, 14) — não pontuado, mas frequentemente maior em volume que a própria fase de crítica (ex.: Fase 9 verificou ~7 regiões de `server.js` linha a linha).
- **Achados P2/P3** registrados em `MEMORIA.md` § Pendências — dezenas de itens de polish conscientemente deixados de fora do escopo aprovado pelo Felix em cada fase, não porque sejam menos reais, mas porque o escopo (sempre P0+P1, por decisão dele) precisava de um corte.
- **As duas maiores extrações da Fase 16** (`ui/HeroShell.jsx`, `makeTrapTab`) e o code-splitting de `React.lazy` — não pontuados por fase porque são trabalho transversal, documentado em `tasks.md` § 16.1.
