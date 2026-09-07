## Context

O `/impeccable` é um conjunto de comandos com papéis distintos. O programa só funciona se cada comando for usado no papel que a documentação dele define:

| Comando | Papel | Produz | Lê |
|---|---|---|---|
| `doctor` | manutenção dos artefatos | relatório de drift | PRODUCT.md, DESIGN.md, sidecar, config, hook |
| `document` | reescreve DESIGN.md a partir do código | DESIGN.md + `.impeccable/design.json` | tokens, CSS, componentes |
| `critique <arquivo>` | avaliação de UX, 2 sub-agentes isolados, 10 heurísticas /40 | snapshot em `.impeccable/critique/` com tendência | código + navegador (quando há) |
| `audit <pasta>` | avaliação técnica /20 (a11y, perf, tema, responsivo, integridade) | relatório P0..P3 com comandos recomendados | código + detector |
| `polish <alvo>` | refinamento que preserva o mundo visual | correções, fecha o snapshot quando limpa os prioritários | snapshot da crítica |
| `harden` `clarify` `adapt` `layout` `typeset` `quieter` `animate` `optimize` `onboard` | correções direcionadas | correções | recomendação do audit |
| `extract` | promove padrões repetidos a tokens/componentes | design system | 3+ ocorrências |

Comandos proibidos neste programa: `bolder`, `overdrive`, `delight` (redesign disfarçado), `craft`/`shape` (trabalho novo).

## Decisões de método

### 1. Alvo da crítica é sempre o arquivo raiz da página

O snapshot é indexado por slug do alvo e a tendência (13 → 15) só existe quando o mesmo alvo é criticado de novo. Criticar `src/components/Schedule.jsx` numa rodada e `src/components/schedule/` na outra quebra o histórico. Regra: `critique` no arquivo raiz; `audit` na pasta inteira (pega sub-componentes).

### 2. Uma superfície por sessão

Dashboard (62KB), Processos (67KB) e Comunicados (57KB) somados a dois sub-agentes de crítica e a um audit não cabem em duas páginas por sessão sem perda de rigor. Sessão termina no commit da página, não antes.

### 3. Chrome global antes das páginas

Header, Sidebar, MobileBottomNav, MobileMoreSheet, MobileDrawer, NotificationBell, ThemeSwitcher e PageShell aparecem em toda página. Corrigi-los depois das páginas obriga a reabrir cada página. Por isso são a Fase 1.

### 4. Backlog consolidado inclui passagem manual

Os dois relatórios pegam o que é lido no código e no detector. O que só uma pessoa usando percebe (ordem de foco real, sensação de latência, texto truncado com nome longo real do IXC, o que um não-técnico vê no dashboard) entra na consolidação, feita nos dois papéis (colaborador comum e admin), em claro e Default Dark, desktop e celular. Ideias de melhoria são registradas separadas dos defeitos, com etiqueta `[ideia]`, e não bloqueiam o portão.

### 5. Verificação obrigatória após corrigir

Lição da rodada 2 do Dashboard. Antes de reavaliar:

1. `npx vite build` limpo.
2. Diff revisado contra o contrato do backend de cada endpoint tocado (formato de sucesso, formato de "sem dados", formato de erro). Um `sucesso: false` não é necessariamente erro.
3. Agente `impeccable-finish-reviewer` sobre o diff.
4. `critique` de novo: registra a tendência e detecta regressão.
5. `audit` de novo: registra o score.

### 6. Portão de qualidade (ver spec `impeccable-quality-gate`)

A superfície só é dada como concluída e o programa só avança quando todos os critérios do spec são cumpridos. Exceção aceita vai para `.impeccable/critique/ignore.md` com motivo e data, nunca silenciosa.

### 7. Aprendizado transversal

Padrão que aparece em 3 superfícies é problema de sistema. É registrado em `tasks.md` desta change (seção "Transversal") e resolvido no encerramento via `extract`, não repetido página a página.

### 8. Changes OpenSpec abertas

Antes de uma página entrar no ritual, cada change em andamento que a toca é finalizada, arquivada ou abandonada com nota. Rodar `polish` sobre trabalho pela metade produz conflitos e esconde qual mudança causou o quê.

## Inventário de superfícies

| Fase | Superfície | Alvo do `critique` | Alvo do `audit` | Abas / sub-superfícies |
|---|---|---|---|---|
| 0 | Fundação | - | - | doctor, document, ignore.md, navegador, dev server |
| 1 | Chrome global | `src/App.jsx` | `Header.jsx`, `Sidebar.jsx`, `MobileBottomNav.jsx`, `MobileMoreSheet.jsx`, `responsive/`, `notifications/`, `ThemeSwitcher.tsx` | sidebar colapsada/expandida, sheet "Mais", sino, troca de tema |
| 2 | Login + NotFound | `src/components/Login.jsx` | `Login/`, `NotFound.jsx` | formulário, ilustração, lembrar-me, erro de credencial |
| 3 | Dashboard | `src/components/Dashboard.jsx` | `Dashboard.jsx`, `TiSupportModal.jsx`, `common/` | 7 widgets, banner de comunicados, modal de suporte TI |
| 4 | Plantão | `src/components/Schedule.jsx` | `schedule/` | aba Escala, aba Histórico, ManagePlantaoModal, HistoricoPreviewModal, versão mobile em cards |
| 5 | Comunicados | `src/components/Comunicados.jsx` | `Comunicados.jsx` | lista, leitura, filtro de urgentes |
| 6 | Colaboradores | `src/components/Directory.jsx` | `directory/` | hero, toolbar, cards vs linhas, grupos, estados vazio/erro |
| 7 | Setores + Organograma | `src/components/Sectors.jsx` | `sectors/`, `OrgChartEditor.jsx` | hero, toolbar, cards, OrgChart, editor (abas ceo, áreas, json) |
| 8 | Meus Chamados | `src/components/TicketsList.jsx` | `TicketsList.jsx` | lista, protocolo, estados |
| 9 | Cobertura | `src/components/Coverage.jsx` | `coverage/`, `CoverageMap.jsx` | hero, filtros, mapa Leaflet, legenda, RegionPanel, OverrideModal, MapaPicker |
| 10 | Serviços | `src/components/ServicesDirectory.jsx` | `services/` | hero, filtros, grid de planos, rankings, comparador, 4 modais |
| 11 | Escritórios | `src/components/Offices.jsx` | `Offices.jsx` | lista, modo editar |
| 12 | Processos | `src/components/Processos.jsx` | `Processos.jsx` | categorias, modo novo, modo editar |
| 13 | Configurações | `src/components/Configuracoes.jsx` | `Configuracoes.jsx` | Informações Pessoais, Setor e Função, Preferências |
| 14 | TI | `src/components/Ti.jsx` | `ti/`, `ti/cadastro/` | hero, Cadastro de Colaborador (seções, upload de ficha, dry-run, painel lateral, combobox de cidade) |
| 15 | Painel Admin | `src/components/AdminDashboard.jsx` | `admin/`, `ResponsaveisManual.jsx`, `schedule/PlantaoHistorico.jsx` | abas Painel, Usuários, Responsáveis, Comunicados, Auditoria, Plantões |
| 16 | Encerramento | - | `src` | extract, document, audit global, doctor |

Critério de ordem: o que todo mundo vê antes do que só admin vê; o que já tem backlog aberto (Dashboard) antes do que ainda não foi tocado; superfícies pequenas (Login) cedo, para calibrar o ritual antes das grandes.

## Ritual por superfície (referência rápida)

```
1. Pré-condições    dev server + navegador + login nos 2 papéis + changes abertas resolvidas
2. critique         /impeccable critique <arquivo raiz>        → responder a pergunta final
3. audit            /impeccable audit <pasta>
4. consolidar       backlog P0..P3 + passagem manual (2 papéis × 2 temas × 2 viewports) + [ideia]s
                    → criar change filha impeccable-<pagina> com o backlog como tasks
5. corrigir         /impeccable polish <alvo>  →  comandos direcionados do audit
6. verificar        build → diff vs contrato backend → finish-reviewer → critique → audit
7. portão           spec impeccable-quality-gate; exceções em ignore.md
8. commit           uma superfície = um commit (ou um por change filha)
9. transversal      padrão visto 3× → anotar em tasks.md desta change, seção Transversal
```

## Riscos

- **Sem navegador, o programa inteiro roda degradado.** Aceitável só se o usuário decidir isso conscientemente; o cabeçalho de cada crítica vai registrar `DEGRADED`.
- **Regressões por correção mecânica** (caso `sem_dados`). Mitigado pelo passo 6 e pelo spec do portão.
- **Fadiga de P3.** O audit avisa: excesso de P3 é ruído. P3 entra na change filha só se couber no mesmo commit; senão fica anotado e não bloqueia.
- **DESIGN.md reescrito pelo `document` pode contradizer o Manual da Marca.** O `document` deriva do código; o Manual é vinculante (PRODUCT.md). Na Fase 0, conferir o resultado contra o PDF antes de aceitar.
