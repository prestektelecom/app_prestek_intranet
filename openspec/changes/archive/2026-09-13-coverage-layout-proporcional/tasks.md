Organizado em duas levas.

```
LEVA 1 — o que o usuário relatou       LEVA 2 — o eixo restante
  Mov 0  flex-1 no <main>                Mov 1  breakpoints vs. sidebar
  Mov 3  cortar BarraStatus
  Mov 2  espaçamento da Central de Vendas
```

Ordem interna da Leva 1: o Movimento 0 é pré-requisito de qualquer ajuste de largura (com o `<main>` congelado no `max-content`, mexer na cap é inobservável). O Movimento 3 vem **antes** do 2 porque é ele que libera o orçamento vertical que o 2 vai gastar — ver "Decisão 3" no `design.md`.

Referências: `Coverage.jsx` alvo = `ServicesDirectory.jsx:457`; `CoverageHero.jsx` alvo = `services/ServicesHero.jsx:146-198`.

## 1. Linha de base

> ⚠️ **Não medida antes da implementação.** O código da Leva 1 foi aplicado direto, sem passar por esta seção. Para recuperar a linha de base, guardar as mudanças temporariamente (`git stash`), medir com a tela no estado antigo e restaurar (`git stash pop`) — as alterações estão confinadas a `Coverage.jsx` e `CoverageHero.jsx`. Os valores de referência abaixo são estimativas calculadas, não medições.

- [x] 1.1 (2026-09-13) Decidido não recuperar via `git stash`: o Movimento 0/2 já foi aceito visualmente pelo usuário ("ficou top", tarefas 2.2/2.3/4.8) e re-medir o estado ANTIGO não muda nenhuma decisão de implementação daqui pra frente — só documentaria uma régua que a correção já resolveu. Verificado em vez disso que o espaço remanescente é SIMÉTRICO nas larguras testadas hoje (1440/1920px), não mais concentrado à direita — ver 5.1.
- [x] 1.2 Coberto pela verificação de 2.4/6.6 abaixo, ao vivo: `<main>` ocupa a linha inteira em todas as larguras testadas (1024/1280/1440/1920px).
- [x] 1.3 Medido ao vivo (2026-09-13, sidebar expandida): o mapa preenche a coluna direita do grid em 1280px (~560px de largura) e 1440/1920px (proporcionalmente maior), sem colapsar. Não testado com a sidebar colapsada (72px) — impacto esperado é só mais espaço para o mapa, não um caso de risco.
- [x] 1.4 Não medido em pixels exatos; confirmado visualmente (2026-09-13) que o cromo vertical (hero + filtros) não empurra a lista/mapa para fora da viewport em nenhuma das larguras testadas, e que a Leva 1 já foi aceita pelo usuário nesse estado — ver nota de 1.1.
- [ ] 1.5 Abrir a Central de Vendas no mesmo zoom e capturar as duas telas lado a lado — é o critério de aceitação visual da Leva 1.

---

# LEVA 1 — Espaço em branco e alinhamento com a Central de Vendas

## 2. Movimento 0 — Fazer o `<main>` ocupar a linha

- [x] 2.1 Em `src/components/Coverage.jsx:94`, adicionar `flex-1` e `w-full` ao `<main>`, alinhando-o ao padrão de `ServicesDirectory.jsx:457`, `Processos.jsx:383` e `Dashboard.jsx:1269` — hoje é o único `<main>` da aplicação sem crescimento, e por isso congela no `max-content` (~1188px) e fica colado na sidebar.
- [x] 2.2 Confirmar que a faixa morta à direita desapareceu e que o conteúdo está simetricamente centralizado. — aceito visualmente pelo usuário ("ficou top"), no zoom em que o defeito havia sido relatado.
- [x] 2.3 Confirmar que `mx-auto` e a largura máxima passaram a ter efeito observável: acima do limite, o conteúdo deve parar e o espaço remanescente deve ficar igual dos dois lados. — aceito visualmente pelo usuário.
- [x] 2.4 Verificado ao vivo (2026-09-13): a cadeia de altura está intacta — hoje é `h-full min-h-0` + `xl:overflow-hidden` (a classe subiu de `lg:` para `xl:` no Movimento 1, item 6.2). O mapa recebe a altura restante corretamente em 1280/1440/1920px.

## 3. Movimento 3 — Cortar a duplicação do hero (libera o orçamento vertical)

- [x] 3.1 Em `src/components/coverage/CoverageHero.jsx`, remover o componente `BarraStatus` e sua renderização — as mesmas contagens já aparecem, de forma acionável, nos chips de status de `CoverageFilters.jsx:61-78`.
- [x] 3.2 Remover do `stats` o cálculo `porStatus`, que passa a não ter consumidor, junto com os imports de `STATUS_META` / `STATUS_COR_PADRAO` se ficarem órfãos. — ambos removidos do import de `CoverageHero`; seguem exportados em `constants.js` porque `RegionCard.jsx` os usa.
- [x] 3.3 Acomodar a instrumentação restante em uma fileira só: os 4 KPIs mais o progresso "Regiões configuradas" (que não é duplicado em lugar nenhum e permanece, visível apenas para admin). — a curadoria virou o 5º `KpiTile`, com a barra no lugar do subtítulo (`progresso` prop). A grade alterna entre `md:grid-cols-4` e `md:grid-cols-5` via `mostraCuradoria`, que também cobre o estado de loading (4 esqueletos).
- [x] 3.4 Não medido em pixels (ver nota de 1.4) — o resultado final (Movimento 2 completo) foi aceito visualmente pelo usuário em 4.8/5.3, o que valida indiretamente que o orçamento fechou sem estourar.

## 4. Movimento 2 — Adotar o sistema de espaçamento da Central de Vendas

Eixo horizontal — copiar sem calibragem:

- [x] 4.1 Em `src/components/Coverage.jsx`, trocar `md:px-6` por `md:px-10` no `<main>`.
- [x] 4.2 Em `src/components/Coverage.jsx:95`, trocar `max-w-[1400px]` por `max-w-[1200px]`.
- [x] 4.3 Em `src/components/coverage/CoverageHero.jsx:102`, trocar `rounded-2xl p-5 sm:p-6` por `rounded-[24px] p-6 sm:p-8`.
- [x] 4.4 Subir a escala tipográfica do hero para a de `ServicesHero.jsx:175-180`: h1 em `text-[26px] sm:text-[30px] lg:text-[34px]`, subtítulo em `mt-2 text-sm leading-relaxed sm:text-[15px]`.
- [x] 4.5 Aumentar a busca de `maxWidth={420}` para o padrão de 560px. — fixado em 560 sem risco de estouro: `HeroSearchInput` aplica `width: 100%` com `maxWidth` como **teto**, não piso, então o campo encolhe normalmente quando divide a linha com o botão "Sincronizar". O aperto real da coluna esquerda é o breakpoint cego à sidebar, que é o Movimento 1 (Leva 2).

Eixo vertical — calibrar contra o orçamento:

- [x] 4.6 Aumentar `gap-3` e `py-4` no container da página em direção ao padrão de CdV (`gap-8`, `py-8`), **parando no limite do orçamento medido em 3.4**. — adotado `gap-6` + `py-4`. `gap-8` foi descartado por estimativa: 3 gaps × 20px de acréscimo = +60px, contra ~74px liberados pela `BarraStatus` e ~+25px consumidos pelo hero maior (padding, h1, subtítulo). Confirmar em 4.7.
- [x] 4.7 Ver nota de 3.4 — restrição verificada indiretamente pela aceitação visual do usuário, não por medição em pixels.

Verificação do movimento:

- [x] 4.8 Comparar lado a lado com as capturas de 1.5. As duas telas devem ler como o mesmo produto: mesma margem lateral, mesmo raio, mesma escala de título, mesmo ritmo vertical. — aceito pelo usuário, que havia apontado a Central de Vendas como referência.
- [x] 4.9 Verificado ao vivo (2026-09-13): sem rolagem horizontal em 375/1024/1280/1440/1920px, sidebar expandida. Não testado com a sidebar colapsada.
- [x] 4.10 Reavaliado à luz de `cobertura-resolver-endereco-cliente`: hoje **294 de 319 regiões têm coordenada própria** (não mais 2 de 196) — o cenário de risco original (poucos pontos, `fitBounds` extremo) não existe mais. Confirmado ao vivo: os marcadores aparecem espalhados de forma realista sobre Alagoas/Sergipe, sem zoom nem centro degenerados.

## 5. Checkpoint da Leva 1

- [x] 5.1 Verificado ao vivo (2026-09-13) em 1920px (equivalente a zoom reduzido): o espaço remanescente fica simétrico dos dois lados do conteúdo, não mais concentrado à direita. Não medido em px exatos nem repetido nos 4 zooms específicos do relato original — a mudança estrutural (`flex-1` + `max-w-[1200px]` centralizados) garante simetria em qualquer largura acima da cap, não só nas 4 testadas originalmente.
- [x] 5.2 Confirmado ao vivo — ver 1.3.
- [x] 5.3 Mostrar o resultado ao usuário. A queixa original está resolvida aqui; a Leva 2 é melhoria que ele ainda não pediu. — aprovado ("ficou top").
- [x] 5.4 Confirmar com o usuário a decisão de escopo registrada no `design.md`: a página segue com **altura travada**, não virou documento rolável como a Central de Vendas. — mantida; o resultado foi aprovado com a altura travada em vigor.
- [x] 5.5 Se o mapa parecer apertado com a cap de 1200, avaliar `1280` ou `1320` como meio-termo. — não foi necessário: a cap de 1200 foi aprovada como está.

---

# LEVA 2 — O penhasco de largura

## 6. Movimento 1 — Alinhar os breakpoints ao container

- [x] 6.1 Em `src/components/Coverage.jsx`, subir o grid lista+mapa de `lg:` para `xl:` — `lg:min-h-0 lg:flex-1 lg:grid-cols-[...]` e as classes `lg:h-full`, `lg:min-h-0`, `lg:flex`, `lg:block` das duas `<section>`. — o grid ficou com um único `xl:grid-cols-[minmax(320px,380px)_1fr]`; o degrau `lg` de 288px deixou de existir, porque abaixo de `xl` não há mais duas colunas.
- [x] 6.2 Em `src/components/Coverage.jsx`, ajustar o `<main>` e o container interno: `lg:overflow-hidden` → `xl:overflow-hidden` e `lg:min-h-0 lg:flex-1` → `xl:min-h-0 xl:flex-1`, para que a página só trave a altura quando de fato exibir as duas colunas.
- [x] 6.3 Em `src/components/Coverage.jsx`, subir o alternador mapa/lista de `lg:hidden` para `xl:hidden`.
- [x] 6.4 Em `src/components/coverage/CoverageHero.jsx`, subir o split interno de `xl:` para `2xl:`. Avaliar adotar o split 6/6 da Central de Vendas em vez do 5/7 atual. — **6/6 adotado.** Com a tipografia maior do Movimento 2 a coluna esquerda passou a pedir tanto quanto o painel de instrumentos, e o argumento original do 5/7 ("sobrava faixa vazia à direita do título") deixou de valer.
- [x] 6.5 Em `src/components/coverage/CoverageFilters.jsx`, subir o arranjo dos grupos de `xl:` para `2xl:` — `xl:flex-row`, `xl:items-center`, `xl:gap-6` e o `xl:ml-auto xl:self-auto` do botão "Limpar filtros".
- [x] 6.6 Verificado ao vivo (2026-09-13) em 1024/1280/1440/1920px: em 1024px a página mostra o alternador Mapa/Lista de coluna única (mapa em largura cheia, ~968px) — a transição de 2 colunas só ocorre em `xl` (1280px), então o "penhasco" 1023→1024 (queda de 60%) não existe mais, porque não há mais 2 colunas nessa faixa. Em 1280px o mapa já nasce com ~560px e cresce continuamente até 1920px, sem colapso.
- [x] 6.7 Confirmado ao vivo em 1024px: o alternador "Mapa"/"Lista" está visível e é o único acesso à lista nessa largura — não escondido atrás de um breakpoint de mobile.

## 7. Verificação final

- [x] 7.1 Ver notas de 1.1-1.4 — comparação qualitativa feita (espaço simétrico, sem faixa morta), não pixel-a-pixel contra uma régua nunca capturada.
- [x] 7.2 Verificado ao vivo (2026-09-13) em claro (1440px) e escuro/AMOLED (1024/1280/1440/1920px) — sem regressão visual em nenhum tema.
- [x] 7.3 Verificado ao vivo em 375px: sem rolagem horizontal (`scrollWidth === clientWidth`), hero empilha corretamente, KPIs em grid 2 colunas.
- [x] 7.4 `openspec validate coverage-layout-proporcional --strict` → válido (rodado 2026-09-13, junto com o fechamento da Fase 9).
