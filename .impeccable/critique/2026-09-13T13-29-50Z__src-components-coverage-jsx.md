---
target: src/components/Coverage.jsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Coverage.jsx"
target_fingerprint: "sha256:369c9ad1dc7d8f51a7e59e033bde2c88bad1746202b051cc4e131c0916bad8c1"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Coverage.jsx"
timestamp: 2026-09-13T13-29-50Z
slug: src-components-coverage-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | "80% cobertura média" não comunica que vem de n=3, não n=319 |
| 2 | Match System / Real World | 3 | Vocabulário do domínio correto; nada admite que 99% das regiões não têm classificação |
| 3 | User Control and Freedom | 3 | Busca filtra a lista mas não o mapa — o mapa ainda mostra as 319 regiões |
| 4 | Consistency and Standards | 2 | O bug de `text-[var(--accent)]` sobre `bg-[var(--accent-soft)]` (já corrigido em `ChipButton`/`SectorsToolbar`) recorre sem correção em 2 lugares desta página |
| 5 | Error Prevention | 1 | `OverrideModal` pré-preenche região sem dado com FTTH/Ativo/100% — um admin pode salvar dado fabricado sem perceber |
| 6 | Recognition Rather Than Recall | 3 | Ícone + texto na maioria dos controles; 15+ botões "Configurar cobertura de CENTRO" com o mesmo nome acessível, sem cidade |
| 7 | Flexibility and Efficiency | 2 | Sem ação em lote para classificar 316 regiões pendentes uma a uma |
| 8 | Aesthetic and Minimalist Design | 3 | Hero denso mas organizado; duplicação de status já removida |
| 9 | Error Recovery | 3 | Estados de erro de IXC e de lista vazia bem diferenciados, com retry |
| 10 | Help and Documentation | 2 | Nenhuma explicação do que "sem tecnologia"/"sem status" significa para quem usa a tela |
| **Total** | | **25/40** | **Aceitável** |

## Design Specificity Verdict

O cromo geral (copy, KPIs, vocabulário IXC) é claramente autoral. Mas a metade centrada no mapa — a parte que mais diferenciaria Cobertura das outras telas-irmãs — é competente porém genérica, e pior: o sistema de cor-por-tecnologia/status que DEVERIA carregar identidade do produto está, na prática, decorativo, porque 316 de 319 regiões reais (99%) têm `tecnologia`, `status` e `percentual_cobertura` nulos. As 4 regiões com mais contratos no ordenamento padrão aparecem todas como "Sem tecnologia".

## Deterministic Scan (CLI `impeccable detect`)

31 achados (30 `design-system-font-size` + 1 `design-system-color`), todos advisory, exit 0. 14 falsos-positivos de ícone confirmados; 3 do padrão de hero compartilhado (kicker/KPI/subtítulo, mesmo já visto em 5+ telas irmãs). 13 achados reais e locais de tipografia, espalhados por `Coverage.jsx`, `CoverageFilters.jsx`, `CoverageHero.jsx`, `CoverageMap.jsx`, `OverrideModal.jsx` e `RegionPanel.jsx`.

## Browser Evidence — Falsos Positivos Confirmados

- 4× `text-occlusion` no viewport de 375px: strings sintéticas do próprio detector ("✦ glowing shadow accents" etc.) reportadas como "cobertas" por elementos reais — artefato do injetor, não da aplicação.
- `ai-color-palette` "roxo/violeta neon" rastreado até a cor real do ícone FTTH (`#7C3AED`, `constants.js:24`) sobre seu próprio tint translúcido — cor legítima do sistema, não um erro de detecção; mede ~3,03:1 no AMOLED, que passa o piso de 3:1 para elemento gráfico não-textual (não precisa de 4,5:1, que é só para texto).

## Genuine Findings (Not Dismissed)

- **`OverrideModal.jsx` pré-preenche região sem dado com valores fabricados** (`tecnologia: 'FTTH'`, `status: 'Ativo'`, `percentual_cobertura: 100`) mesmo quando a região não tem NENHUM desses campos — confirmado ao vivo, reproduzível em qualquer uma das 316 regiões não configuradas.
- **Bug de contraste recorrente, confirmado por ambos os assessments com números batendo**: `RegionPanel.jsx:61-65` (toggle "Contratos"/"A-Z") e `Coverage.jsx:171-176` (toggle Mapa/Lista) usam `text-[var(--accent)]` sobre `bg-[var(--accent-soft)]` — 2,63:1 no claro (reprova), 5,00:1 no AMOLED (passa raspando). Mesmo padrão já corrigido em `ChipButton.jsx`/`SectorsToolbar.jsx` e ainda pendente em `DirectoryToolbar.jsx` (registrado em MEMORIA.md).
- **Alvos de toque reais, confirmados como não-artefato de medição**: toggle Mapa/Lista em 36px (sem técnica de expansão por pseudo-elemento no código-fonte), ícone de engrenagem admin do `RegionCard.jsx` em 32px (idem). Os controles de zoom do Leaflet (30×30px) são o padrão nativo da biblioteca, não customizado pelo app.
- **KPI "Cobertura méd. 80%" e os chips de tecnologia/status cobrem ~1% do dado real** — 316 de 319 regiões sem classificação, sem nenhuma sinalização equivalente ao banner âmbar já existente para "sem localização".
- **Link de atribuição do Leaflet herda a cor de link global do app** (`rgb(249,115,22)` sobre o fundo cinza padrão do Leaflet) — 2,92:1, abaixo do piso de texto.
- **`aria-label` ambíguo**: 15+ botões "Configurar cobertura de CENTRO" com o mesmo nome acessível, sem a cidade para diferenciar — um usuário de leitor de tela não consegue saber qual "CENTRO" está ativando.
- Sem clusterização de marcadores num mapa com ~290 pontos — no zoom padrão, a região de Arapiraca vira uma massa sólida de ícones sobrepostos.
- A busca filtra a lista mas não o mapa, que continua mostrando as 319 regiões.

## Priority Issues

**[P0] `OverrideModal` fabrica dado de classificação por padrão** — ao abrir o modal para uma região sem dado (316 de 319), os campos já vêm preenchidos com "FTTH", "Ativo" e "100%" em vez de vazios/neutros. Um admin trabalhando na fila de curadoria (o próprio "3/319 configuradas" convida a isso) pode salvar sem tocar em nada e gravar uma classificação inventada como se fosse verificada — e um vendedor depois confia nesse "Ativo" para prometer serviço a um cliente.

**[P1] Bug de contraste de marca-como-texto recorrente, 2 instâncias nesta página** — `RegionPanel.jsx` (toggle de ordenação) e `Coverage.jsx` (toggle Mapa/Lista), 2,63:1 no claro. Mesma classe de bug já documentada e corrigida em outras 2 superfícies neste programa.

**[P1] Alvos de toque abaixo de 44px em 2 controles reais** — toggle Mapa/Lista (36px) e ícone de engrenagem do `RegionCard.jsx` (32px), confirmados como falha real (sem técnica de expansão de área de clique).

**[P2] KPI e filtros de tecnologia/status não sinalizam que cobrem ~1% do dado real** — sem um equivalente ao banner de "sem localização" já existente para "sem classificação".

**[P2] Link de atribuição do Leaflet com contraste de 2,92:1** — herda o azul/laranja de link global do app.

**[P2] `aria-label` ambíguo em 15+ botões "Configurar cobertura de CENTRO"** — falta a cidade para diferenciar.

**[P2/feature maior, não polish]** Sem clusterização de marcadores (mapa denso e sobreposto) e busca não sincronizada com o mapa — ambos exigiriam mudança de comportamento, não só um ajuste visual.

**[P3]** 13 tamanhos de fonte fora da rampa, locais, espalhados por 6 arquivos.

## Persona Red Flags

- **Alex (vendedor conferindo cobertura antes de prometer ao cliente)**: busca um bairro, clica na região com mais contratos do banco real — popup diz "sem status". Não há como saber se é "sem cobertura" ou "nunca auditado". O KPI "80%" no hero passa confiança falsa para a rede como um todo.
- **Riley (admin fazendo curadoria em lote)**: abre o modal de uma região intocada e encontra "FTTH/Ativo/100%" pré-preenchidos — o exato padrão de falha que expõe dado inventado como se fosse real. Sem ação em lote, classificar 316 regiões uma a uma é impraticável.
- **Sam (leitor de tela)**: 15+ "Configurar cobertura de CENTRO" idênticos; o toggle de ordenação e o de Mapa/Lista falham contraste no claro, afetando quem usa zoom/baixa visão.

## Minor Observations

- `MapaPicker.jsx` e `CoverageMap.jsx` duplicam quase todo o boilerplate de inicialização do Leaflet — custo de manutenção, não bug visível.
- O banner âmbar de "sem localização" já é o padrão certo para reaproveitar no problema de "sem classificação" (P2 acima).
- `RegionPanel.jsx`'s "Carregar mais N de M" é uma alternativa honesta ao scroll infinito.
- `OverrideModal` já normaliza corretamente entrada de coordenada com vírgula decimal (pt-BR).
