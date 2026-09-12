---
target: src/components/Schedule.jsx
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Schedule.jsx"
target_fingerprint: "sha256:30ed1e6c13286dfbc6cfd9f823054db3d0b8faeeb26f2399728abf281b9f7c5c"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Schedule.jsx"
timestamp: 2026-09-12T00-49-08Z
slug: src-components-schedule-jsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons, toasts e estados de "Salvando…"/"Excluindo…" sólidos; gaps menores |
| 2 | Match System / Real World | 3 | Vocabulário N1/N2/Supervisão/NOC fluente; `(FÉRIAS)` cru sem explicação |
| 3 | User Control and Freedom | 2 | Cancelar/Escape/limpar filtros presentes, mas o campo de data em "Novo Plantão" é uma armadilha sem rede de segurança |
| 4 | Consistency and Standards | 2 | Tratamento de "não atribuído" inconsistente, `z-50` contradiz a camada de modal documentada (1100), dois "Cancelar" indistinguíveis |
| 5 | Error Prevention | 2 | Confirmação de exclusão é boa, mas minada por um P0 confirmado (troca de data não revalida sobreposição) |
| 6 | Recognition Rather Than Recall | 3 | Ícones rotulados, opções visíveis, formulário pré-populado |
| 7 | Flexibility and Efficiency | 2 | Boas seleções em lote no multi-select, mas zero atalhos de teclado e Tab quebrado |
| 8 | Aesthetic and Minimalist Design | 3 | Composição limpa, mas contagem duplicada na tela e micro-labels em caixa alta em excesso |
| 9 | Error Recovery | 3 | Toasts em linguagem simples, ErrorState com retry e copy tranquilizadora |
| 10 | Help and Documentation | 0 | Nenhum tooltip além do title nativo; jargão nunca explicado |
| **Total** | | **23/40** | **Aceitável** |

## Veredito de Especificidade de Design

LLM (A): misto, pendendo para "forma genérica com vocabulário específico". Vocabulário do domínio real e consistente (N1/N2/Supervisão, NOC, IXC, iCal/CSV, trilha de auditoria sob medida), mas a forma de interação (bento + sidebar de filtro + tabela com hover-edit + modal-acordeão) é intercambiável com qualquer ferramenta de escala genérica. O tratamento inconsistente de "não atribuído" entre N2 e Supervisão é indício de acréscimo ao longo do tempo.

Varredura determinística (B): 64 achados via CLI, todos design-system-font-size (advisory), em 12 arquivos de src/components/schedule/. Overlay ao vivo: 28 anti-padrões — undersized-ui-text x14, nested-cards x7, layout-transition x2, clipped-overflow-container x2, low-contrast x3 (FALSO POSITIVO confirmado: detector só lê background-color e ignorou o background-image do gradiente do hero), all-caps-body x1, gpt-thin-border-wide-shadow x1, overused-font x1 (Plus Jakarta Sans 72%, dentro do esperado).

## Impressão Geral

A tela cumpre a tarefa e tem um momento de cuidado autoral real (diff de histórico), mas um bug de sobreposição silenciosa de dados e a ausência de trap de foco no modal principal colocam em risco a confiança que a ferramenta precisa inspirar. "Novo Plantão" foi implementado corretamente na camada de UI (confirmado por B) mas sem revalidar a lógica de negócio por trás (confirmado por A, ao vivo).

## Pontos Fortes

1. Diff de histórico (HistoricoList.jsx) — chips de antes/depois por campo, pill de status, atribuição do admin.
2. Fluxo de confirmação de exclusão — pré-visualização de dados antes da ação destrutiva.
3. Trio de estados em ScheduleStates.jsx — skeletons no formato real, EmptyState compartilhado, ErrorState com retry.

## Problemas Prioritários

[P0] Sobrescrita silenciosa ao trocar a data em "Novo Plantão"
Por quê importa: openNewPlantao define existingPlantao só na abertura; o onChange do campo de data em ManagePlantaoModal.jsx nunca revalida contra plantoes para a nova data. Confirmado ao vivo: trocar para um dia com N1 já atribuído não mostra o aviso de substituição, e o toast mentiria "cadastrado" quando substituiria dados reais.
Fix: reexecutar a busca de existingPlantao sempre que a data mudar em modo editável.
Comando sugerido: /impeccable harden

[P0] ManagePlantaoModal sem trap de foco real apesar de aria-modal="true"
Por quê importa: confirmado ao vivo — Tab escapa para botões do hero atrás do backdrop. Só existe listener de Escape.
Fix: aplicar o mesmo padrão de trap de foco já usado no chrome (harden da Fase 1).
Comando sugerido: /impeccable harden

[P1] Microtipografia fora da rampa, generalizada
Por quê importa: convergência A+B — 64 achados CLI + 14 confirmados ao vivo, 12 arquivos, 8px a 40px fora da escala do DESIGN.md.
Fix: normalizar para label 13px/overline 11px documentados.
Comando sugerido: /impeccable typeset

[P1] Tratamento inconsistente de "não atribuído" entre N2 e Supervisão
Por quê importa: N2 vazio é fantasma discreto; Supervisão vazio cai no fallback genérico e renderiza como chip sólido indistinguível de um nome real.
Fix: aplicar o mesmo tratamento fantasma do N2 à Supervisão.
Comando sugerido: /impeccable clarify

[P2] Débito de z-index e semântica de diálogo
Por quê importa: ManagePlantaoModal usa z-50, contrariando a camada 1100 documentada (Sidebar fica em zIndex 1000, acima do modal). Diálogo de exclusão sem role="dialog"/aria-modal e com "Cancelar" ambíguo.
Fix: mover para z-[1100]; adicionar semântica de diálogo e nome acessível distinto.
Comando sugerido: /impeccable harden

[P2] Bug de capitalização em português — "Setembro De 2026"
Por quê importa: a classe capitalize do Tailwind maiusculiza toda palavra, inclusive a preposição "de". Reproduzível sempre.
Locais: Schedule.jsx:547, ScheduleHistoricoTab.jsx:49 e :84.
Fix: capitalizar só a primeira letra manualmente.
Comando sugerido: /impeccable clarify

## Red Flags por Persona

Alex: Tab escapa do modal; zero atalhos de teclado; acordeão de uma seção por vez mesmo com modal max-w-md fixo a 1440px; filtros não refletem na URL.
Sam: trap de foco ausente; diálogo de exclusão sem role/aria-labelledby e "Cancelar" ambíguo; fallback de Supervisão só por texto; z-index do modal abaixo da Sidebar quebra a promessa de aria-modal.
Riley: o P0 de sobrescrita; campo de data sem min/max; colaborador em férias aparece na lista de N1 sem distinção.

## Observações Menores

- Contagem de plantões filtrados duplicada (hero KPI + card "Status do Filtro").
- Legenda do mini-calendário usa pontos do mesmo tamanho para "Hoje"/"Plantão", mas "hoje" real é uma pílula preenchida.
- "Exportar iCal" estilizado como primário (fundo branco sólido) enquanto "Novo Plantão" usa estilo ghost.
- Badge "X selecionado(s)" aplicado também à seção de Histórico, sem sentido para registros de log.
- Cabeçalho "SUPERVISÃO" é text-right sm:text-left, único fora do padrão.
- Rodapé de PlantaoHistorico.jsx repete o padrão de links mortos já apontado na crítica do Dashboard.
- nested-cards x7, layout-transition x2, clipped-overflow-container x2 (detector, candidatos a polish futuro).

## Perguntas para Refletir

1. Se um admin pode sobrescrever silenciosamente a cobertura de outro dia só editando uma data, o que isso diz sobre a confiança na escala como fonte da verdade?
2. O diff de histórico é a tela mais bem cuidada da feature — como seria a Plantão inteira com esse mesmo cuidado?
3. Uma vaga descoberta deveria algum dia parecer idêntica a uma preenchida, como "Não atribuído" hoje parece?
