## Why

O portal já passou por várias reformas visuais pontuais (dashboard bento, glowing cards, accent laranja, cards de colaboradores), mas nunca por uma avaliação sistemática e completa de UX e qualidade técnica. O skill `/impeccable` (v4.2.1, instalado em `.claude/skills/impeccable`) oferece exatamente isso: crítica heurística com placar (Nielsen, /40), auditoria técnica com placar (/20), e comandos de correção que leem o backlog gerado. Hoje ele foi usado apenas no Dashboard, em duas rodadas (13/40 → 15/40), e a segunda rodada mostrou dois problemas de método que este programa precisa resolver antes de escalar:

1. O `harden` corrigiu 3 fetches e introduziu uma regressão real (resposta `sucesso: false, sem_dados: true` tratada como erro permanente para quem não é técnico de campo). Sem um portão de verificação por página, "meticuloso" vira "rápido com mais passos".
2. Toda crítica rodou sem navegador ("overlay pulado, sem ferramenta de navegador nesta sessão"). A doc do skill exige inspeção visual quando disponível. Sem isso, a Avaliação B fica degradada em todas as páginas.

Além disso, a régua contra a qual tudo é medido está torta: `impeccable doctor` reporta que `DESIGN.md` não tem seções de cores e componentes no esquema lido pelo skill, e o documento ainda descreve bordas bege (`#eaddcd`) e inputs bege (`#f4eee6`) que não existem em nenhum arquivo de `src/`.

## What Changes

Este é um programa de execução, não uma feature. Ele estabelece:

- **Fundação (uma vez):** navegador acessível ao skill e dev server no ar durante as sessões; `doctor` + `document` para reescrever `DESIGN.md` a partir do código atual e gerar o sidecar `.impeccable/design.json`; criação de `.impeccable/critique/ignore.md` para exceções aceitas com motivo.
- **Ritual por superfície:** para cada página e cada aba, a sequência `critique` → `audit` → consolidação do backlog (incluindo passagem manual nos dois papéis, em claro e Default Dark, desktop e celular) → `polish` → comandos direcionados recomendados pelo audit → verificação (build, diff contra contrato do backend, finish-reviewer, `critique` e `audit` de novo para registrar tendência) → portão de qualidade → commit.
- **Inventário e ordem:** 16 superfícies em ordem fixa (fundação → chrome global → Login → Dashboard → páginas de uso diário → Configurações → áreas admin → encerramento). Uma superfície por sessão.
- **Encerramento (uma vez):** `extract` dos padrões que se repetiram em 3+ páginas, `document` final, `audit src` global, `doctor`.

Cada superfície, ao chegar na fila, gera sua própria change OpenSpec (`impeccable-<pagina>`) a partir do backlog consolidado. Esta change é o programa e o checklist; as correções de código vivem nas changes filhas.

Fora de escopo: `bolder`, `overdrive`, `delight` e qualquer redesign de mundo visual. O programa é refinamento do mundo incumbente (laranja Prestek sobre azul-gelo, 4 temas escuros, Manual da Marca vinculante). Redesign só com decisão explícita do usuário, em change separada.

## Capabilities

### New Capabilities
- `impeccable-quality-gate`: critérios objetivos que uma superfície precisa cumprir antes de o programa avançar para a próxima, e a forma de registrar exceções aceitas.

### Modified Capabilities
(nenhuma)

## Impact

- `DESIGN.md` e `.impeccable/design.json`: reescritos pelo `document` na Fase 0.
- `.impeccable/critique/`: um snapshot por rodada de crítica, por página (já versionado).
- `.impeccable/critique/ignore.md`: novo, exceções aceitas.
- `openspec/changes/impeccable-<pagina>/`: uma change filha por superfície, criada quando a superfície chega na fila.
- Changes OpenSpec em andamento que tocam a mesma página (ex.: `colaboradores-reformulacao-visual` 55/63, `coverage-layout-proporcional`, `tickets-pivot-para-os`, `tickets-theme-cores-adaptativas`, `escala-botao-criar-plantao`, `dashboard-hero-slideshow`) precisam ser finalizadas, arquivadas ou abandonadas explicitamente antes de a página entrar no ritual.
- Nenhuma mudança de backend está prevista por este programa; quando uma crítica apontar defeito de contrato (ex.: `/api/plantoes/meu-proximo` sem `horario_inicio`), a correção entra na change filha da página com escopo declarado.

## Decisões tomadas (Felix, 2026-09-07)

1. **Navegador:** Playwright MCP (`@playwright/mcp`) adicionado ao `.mcp.json` do projeto, reaproveitando o Chromium já instalado em `ms-playwright`. O tool só aparece depois de reiniciar a sessão; até lá, qualquer crítica roda degradada e diz isso no cabeçalho.
2. **Changes abertas:** cada uma é resolvida quando a página dela chegar na fila (já listadas como tarefa de pré-condição em cada fase). As 18 specs antigas que falham no `openspec validate --all` por falta de `## Purpose`/`## Requirements` ficam para o encerramento.
3. **Temas:** claro e Default Dark completos em toda página; Cyber-Obsidian, Deep-Space Aurora e AMOLED por amostragem no portão, com audit global de tema no encerramento.
4. **Rastreio:** uma change filha `impeccable-<pagina>` por superfície, criada a partir do backlog consolidado.
5. **DESIGN.md:** mesclado, não sobrescrito. Reescrito no esquema canônico do Impeccable a partir do código atual, carregando a convenção de z-index e a tabela dos temas escuros do arquivo antigo. Resíduos bege removidos.
6. **Cor da marca:** o manual registra `#D97738`/`#384C9C`; o código usa `#EC7D23` (pixels do `Logo.webp`). Mantido `#EC7D23` para accent e logo renderizado coincidirem; divergência documentada no DESIGN.md (The Manual Divergence Rule) e em `.impeccable/critique/ignore.md`, com revisão prevista para a Fase 16.
7. **Linguagem do sistema:** North Star "Sinal Quente sobre Gelo"; accent chamado "Laranja Prestek" (variantes Brasa e Aurora nos temas escuros); filosofia "plano por padrão, profundidade só como resposta".

## Decisões da Fase 1 — Chrome global (Felix, 2026-09-07, após a crítica 19/40)

8. **Header desktop:** passa a carregar contexto (título da view atual, ações da página, sino); a busca do chrome fica restrita a Serviços, com placeholder honesto ("Buscar planos por nome, valor ou ID"). Busca global fica fora do programa.
9. **Chrome mobile:** barra inferior reordenada por frequência de uso (Início, Plantão, Comunicados, Chamados, Mais); avatar no header mobile abre um sheet de perfil (nome, setor, tema, Sair); `MobileDrawer` removido por ser código morto.
10. **Default Dark:** exposto como quarta variante escura no seletor (o bloco `.dark` do `index.css` já existe) e vira o escuro padrão; Cyber-Obsidian passa a ser opcional. PRODUCT.md e DESIGN.md continuam corretos.
11. **Escopo da change filha `impeccable-chrome`:** P0 + P1 + P2 da crítica; observações menores só se couberem no mesmo commit sem alargar o diff.
