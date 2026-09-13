---
target: Serviços (ServicesDirectory)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\ServicesDirectory.jsx"
target_fingerprint: "sha256:6f2f75af876ded303064a5e81b94cccdfbd77b07aeaebb1cd1e63e8cd16ff817"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\ServicesDirectory.jsx"
timestamp: 2026-09-13T15-03-32Z
slug: src-components-servicesdirectory-jsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Tech/Streaming tabs never show a loading state — fallback/seed data renders with full visual confidence, indistinguishable from live IXC data |
| 2 | Match System / Real World | 3 | Boa linguagem de negócio (PF/PJ/Link, "Sincronizado via IXC"); distinção "contratos" vs "planos" só documentada em comentário, não na UI |
| 3 | User Control and Freedom | 1 | 3 modais de edição admin (`ModalShell`) e o diálogo de exclusão sem Escape/backdrop-dismiss/trap; cards inteiros sem escape de teclado para a ação primária |
| 4 | Consistency and Standards | 2 | Rankings (`RankingsSection`/`RankingPodium`) usa hex cru em vez do sistema de tokens que o resto da tela já adota |
| 5 | Error Prevention | 3 | Exclusão com confirmação; comparador limita a 3 planos com toast em vez de falhar silenciosamente |
| 6 | Recognition Rather Than Recall | 3 | Truncamento com `title`/`+N` em vez de esconder dado; linhas idênticas do comparador colapsam em `<details>` |
| 7 | Flexibility and Efficiency | 2 | Sort ausente em 2 das 5 abas; o comparador (feature mais avançada da tela) está desligado por flag |
| 8 | Aesthetic and Minimalist Design | 3 | Sistema de bento-card é coeso; Rankings quebra o padrão com uma linguagem visual mais carregada |
| 9 | Error Recovery | 4 | Zero `alert()` cru nesta superfície — toasts específicos e banner contextual de fallback |
| 10 | Help and Documentation | 3 | Hints inline nos campos dos modais admin são um padrão de baixo atrito bem executado |
| **Total** | | **26/40** | **Aceitável (65%)** |

*Nota: heurística 3 rebaixada de 2→1 na síntese em relação à avaliação isolada da Assessment A, por causa do achado estrutural da Assessment B (cards sem nenhuma via de teclado) — mais grave do que "modais sem Escape" isoladamente.*

## Design Specificity Verdict

**LLM assessment**: Não é UI genérica — o sistema de gradient-card, o hero com sparkline e toggle velocidade/dia, e o comparador com gerador de argumento de venda mostram iteração real contra dado de produção (descrições IXC de até 70 caracteres, taxas de instalação em texto livre). A fraqueza não é genericidade, é que o subsistema de Rankings foi construído em um padrão visual/técnico anterior e nunca foi migrado — a tela discorda de si mesma estilisticamente.

**Deterministic scan**: `impeccable detect --json` sobre `ServicesDirectory.jsx` + `services/` retornou 39 achados, todos severidade "advisory" (exit 0, não 2 — divergência da documentação da ferramenta, não um bug do app). Filtrando falsos positivos conhecidos: 9 de tamanho de glifo de ícone, 2 de cópia verbatim de Hero já catalogada como transversal (kicker 10px, subtítulo 15px). Sobram 28 achados reais de tamanho de fonte fora da rampa, concentrados em `PlanoComparador.jsx` (9 ocorrências — a maior concentração de todas as fases até aqui) e `RankingPodium.jsx`/`RankingsSection.jsx`. Dois achados quebram o padrão "cópia compartilhada, não é bug local": `ServicesHero.jsx:60` usa 15px onde as 4 Heroes irmãs usam 17px no mesmo slot de KPI (drift de cópia, não cópia fiel) e o selo "Ao vivo" (`ServicesHero.jsx:185`) não existe em nenhuma Hero irmã — ambos achados genuinamente locais.

## Overall Impression

A tela tem disciplina técnica real (tokens de tema, tratamento cuidadoso de dado irregular do IXC, zero `alert()`) mas dois buracos estruturais de teclado tornam a navegação por teclado quase inviável: nenhum card abre por teclado, e a maioria dos modais não fecha por Escape. A maior oportunidade é extrair o padrão de diálogo que `ServiceDetailModal.jsx` já implementa corretamente e generalizá-lo para o resto da tela, em vez de repeti-lo pontualmente a cada fase.

## What's Working

1. **`useCardGradient.js` resolve o problema do gradiente em 5 temas de forma genuinamente reaproveitável** — mapeia cada variante nomeada para um token semântico com alfas diferentes por tema, e cada card se beneficia sem resolver o problema de novo.
2. **Zero `alert()` cru em ~2000 linhas** — todo caminho de erro (salvar, excluir, buscar) usa toast especificado ou banner contextual. Dado que esse antipadrão recorreu em Login e Comunicados, a ausência total aqui é uma conquista real e verificável.
3. **`ServiceDetailModal.jsx` acerta a semântica de diálogo (role, aria-modal, aria-labelledby, Escape, foco inicial) na primeira tentativa** — prova que o padrão é conhecido, o que torna a inconsistência com os outros 3 modais da mesma tela mais visível, não menos importante.

## Priority Issues

**[P0] Todo card de Plano/Serviço Técnico/Streaming é inacessível por teclado para sua ação primária**
- **What**: `ui/gradient-card.jsx` (`GradientCard`, base de `PlanoBentoCard`/`TechBentoCard`/`StreamingBentoCard`) renderiza a superfície clicável como um `<motion.div onClick={handleClick}>` sem `role="button"`, sem `tabIndex` e sem `onKeyDown` para Enter/Space. Só os botões pequenos aninhados (editar/comparar) são focáveis.
- **Why it matters**: Um usuário de teclado pode tabular pelos botões de editar/excluir de um card, mas nunca consegue abrir o `ServiceDetailModal` do card em si — a ação primária da tela inteira (ver detalhes de um plano/serviço) não existe para quem não usa mouse.
- **Fix**: Adicionar `role="button"`, `tabIndex={0}` e um `onKeyDown` que dispara `handleClick` em Enter/Espaço ao `motion.div` externo do `GradientCard`.
- **Suggested command**: `/impeccable harden`

**[P0] Modais de edição admin e diálogo de exclusão sem nenhuma semântica de diálogo**
- **What**: `modals/ModalShell.jsx` (usado por `PlanEditModal`, `TechServiceModal`, `StreamingServiceModal`) e o diálogo de exclusão inline em `ServicesDirectory.jsx` (linhas 617-648) não têm `role="dialog"`, `aria-modal`, handler de Escape nem trap de foco; o `ModalShell` também não fecha ao clicar no backdrop. `ServiceDetailModal.jsx` já resolve isso corretamente no mesmo arquivo-irmão — a inconsistência mostra que o padrão é conhecido mas não aplicado sistematicamente.
- **Why it matters**: Mesmo antipadrão já corrigido como P0 nas Fases 5 (Comunicados) e 7 (Setores) — recorre aqui pela 3ª vez, agora em 4 modais de uma vez via um shell compartilhado.
- **Fix**: Extrair a lógica de Escape + `role="dialog"`/`aria-modal` + foco inicial que `ServiceDetailModal.jsx` já implementa para um hook compartilhado; aplicar em `ModalShell.jsx` e no diálogo de exclusão inline.
- **Suggested command**: `/impeccable harden`

**[P1] `RankingsSection`/`RankingPodium` usa cores hardcoded em vez do sistema de tokens**
- **What**: Enquanto todo o resto da tela roteia cor por `useBentoTheme()`/`var(--accent-*)`, `RankingsSection.jsx` e `RankingPodium.jsx` usam Tailwind cru (`text-slate-900 dark:text-white`, `bg-[#FFF7ED]`, `text-[#9A3412]`) — inclusive um resquício de hover azul (`hover:bg-[#D6E9FF]`) da paleta "Bento Blue" já abandonada antes desta sessão.
- **Why it matters**: O módulo mais visualmente carregado da tela é também o único que não vai acompanhar futuros ajustes de paleta — um design de uma geração anterior colado numa tela recém-tokenizada.
- **Fix**: Rotear `RANK_STYLES`/cores das tabs por `useBentoTheme()`, seguindo o padrão que `PlanoComparador.jsx`'s `TOM` map já usa na mesma pasta.
- **Suggested command**: /impeccable harden

**[P1] Texto real com `text-muted`/`--foreground-muted` reprova contraste no tema claro**
- **What**: Medido ao vivo — rótulo "Ordenar por:" (`ServicesFilterBar.jsx:50`) em 2,85:1 no tema claro (passa em AMOLED, 5,92:1). Mesmo padrão usado como hint em `ModalShell.jsx`, especificações em `ServiceDetailModal.jsx`, legendas em `PlanoComparador.jsx`.
- **Why it matters**: 6ª+ recorrência do antipadrão "token passa nos 4 temas escuros, falha só no claro" já catalogado no programa.
- **Fix**: Trocar `text-muted`/`C.muted` por `text-faint`/`C.ink2` nos usos como texto real (não ícone/placeholder).
- **Suggested command**: /impeccable harden

**[P1] Alvos de toque abaixo de 44px em 4 pontos da tela**
- **What**: Medido ao vivo — botões de ordenação (`ServicesFilterBar.jsx`) em 32px de altura; toggle Velocidade/Dia do hero (`ServicesHero.jsx`) em 24,5px; ícones de editar/excluir nos 3 tipos de card em 22×32px; botão de fechar do `ModalShell.jsx` sem nenhuma classe de tamanho/expansão.
- **Why it matters**: Consistente com o padrão já corrigido em Cobertura/Setores/Colaboradores nesta mesma jornada do programa.
- **Fix**: `min-h-[44px]` nos botões de ordenação e no toggle do hero; expansão por pseudo-elemento (`after:-inset-N`) nos ícones de editar/excluir e no fechar do `ModalShell`.
- **Suggested command**: /impeccable harden

**[P2] Carousel de Rankings avança sozinho a cada 3s sem pausa por teclado/toque**
- **What**: `RankingsSection.jsx:40-44` só pausa em `onMouseEnter`/`onMouseLeave` — não pausa em foco nem para permanentemente quando o usuário clica numa tab.
- **Why it matters**: Usuário de teclado ou toque não tem como parar a rotação (WCAG 2.2.2); clicar numa tab não impede o auto-avanço 3s depois, contradizendo a própria semântica de `aria-pressed`.
- **Fix**: Pausar em `onFocus`/`onBlur` além de mouse; parar de vez o auto-avanço após seleção explícita de tab.
- **Suggested command**: /impeccable polish

## Persona Red Flags

**Alex (Power User)**: A feature mais sofisticada da tela para o trabalho de Alex — o comparador com gerador de argumento de venda e botão de copiar — está desligada por flag (`COMPARADOR_PLANOS_ATIVO = false`), inacessível hoje independente de habilidade. Alex também não consegue ordenar Serviços Técnicos por preço (sort escondido nessa aba).

**Sam (Accessibility)**: Não consegue abrir nenhum card por teclado (P0 acima) — o fluxo primário da tela inteira está fechado para Sam. Não consegue fechar "Editar Plano"/"Novo Serviço"/"Novo Pacote" com Escape. Não tem como pausar o carousel de Rankings.

**Casey (Mobile)**: Mesmo problema de pausa do carousel que Sam, por razão oposta (sem `:hover` em touch, o intervalo nunca pausa). Buscar em "Serviços Técnicos" sem resultado deixa a tela em branco sem nenhuma mensagem (diferente da aba Planos, que trata esse caso).

## Minor Observations

- Fallback/seed data de Tech e Streaming renderiza com a mesma confiança visual do dado real do IXC durante a janela normal de carregamento (só o caminho de erro mostra aviso) — mesma família de risco do antipadrão "formulário assume valor como se fosse verificado" já catalogado na Fase 9, aqui em versão somente-leitura.
- 3 botões "Novo X"/"Editar" duplicam o mesmo gradiente hardcoded (`from-[#9A3412] to-[#EC7D23]`) inline em vez de uma constante compartilhada.
- `ServiceDetailModal.jsx` tem Escape + foco inicial mas nenhum trap de Tab completo — Tab/Shift+Tab escapam para elementos de fundo.
- Detector `impeccable detect` retornou exit 0 mesmo com 39 achados (todos "advisory") — divergência de comportamento da própria ferramenta em relação à documentação (exit 2 esperado), não um bug do app.

## Questions to Consider

- Se o comparador é a feature mais pensada da tela, por que está desligado — e é uma decisão ainda válida ou foi só esquecida, como 3 outras changes "órfãs mas completas" já achadas nesta jornada?
- Um carousel que avança sozinho a cada 3s serve mesmo o caso de uso de "consulta rápida durante uma ligação de venda", ou 3 mini-pódios estáticos simultâneos serviriam melhor?
