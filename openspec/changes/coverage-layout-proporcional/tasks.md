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

- [ ] 1.1 Registrar o espaço em branco total nos zooms de 100%, 80%, 67% e 50% — é a métrica que o usuário está observando. Referência medida num monitor de ~1536px físicos: 100 / 484 / 857 / 1.636 px, **todos do lado direito**.
- [ ] 1.2 Medir a largura do `<main>` em cada zoom e comparar com o espaço disponível na linha. A diferença é a faixa morta que o Movimento 0 elimina.
- [ ] 1.3 Medir a largura × altura renderizada do mapa em 1024, 1280, 1440 e 1920px de viewport, com a sidebar expandida e depois colapsada (72px).
- [ ] 1.4 Medir a altura de cada bloco do cromo vertical (hero, alerta, filtros, gaps, padding do `<main>`) e anotar o total. Referência estimada: **397px**. Este número é o teto que o Movimento 2 não pode ultrapassar.
- [ ] 1.5 Abrir a Central de Vendas no mesmo zoom e capturar as duas telas lado a lado — é o critério de aceitação visual da Leva 1.

---

# LEVA 1 — Espaço em branco e alinhamento com a Central de Vendas

## 2. Movimento 0 — Fazer o `<main>` ocupar a linha

- [x] 2.1 Em `src/components/Coverage.jsx:94`, adicionar `flex-1` e `w-full` ao `<main>`, alinhando-o ao padrão de `ServicesDirectory.jsx:457`, `Processos.jsx:383` e `Dashboard.jsx:1269` — hoje é o único `<main>` da aplicação sem crescimento, e por isso congela no `max-content` (~1188px) e fica colado na sidebar.
- [x] 2.2 Confirmar que a faixa morta à direita desapareceu e que o conteúdo está simetricamente centralizado. — aceito visualmente pelo usuário ("ficou top"), no zoom em que o defeito havia sido relatado.
- [x] 2.3 Confirmar que `mx-auto` e a largura máxima passaram a ter efeito observável: acima do limite, o conteúdo deve parar e o espaço remanescente deve ficar igual dos dois lados. — aceito visualmente pelo usuário.
- [ ] 2.4 Verificar que o `flex-1` não quebrou a cadeia de altura (`h-full min-h-0` + `lg:overflow-hidden`) que faz o mapa receber a altura restante.

## 3. Movimento 3 — Cortar a duplicação do hero (libera o orçamento vertical)

- [x] 3.1 Em `src/components/coverage/CoverageHero.jsx`, remover o componente `BarraStatus` e sua renderização — as mesmas contagens já aparecem, de forma acionável, nos chips de status de `CoverageFilters.jsx:61-78`.
- [x] 3.2 Remover do `stats` o cálculo `porStatus`, que passa a não ter consumidor, junto com os imports de `STATUS_META` / `STATUS_COR_PADRAO` se ficarem órfãos. — ambos removidos do import de `CoverageHero`; seguem exportados em `constants.js` porque `RegionCard.jsx` os usa.
- [x] 3.3 Acomodar a instrumentação restante em uma fileira só: os 4 KPIs mais o progresso "Regiões configuradas" (que não é duplicado em lugar nenhum e permanece, visível apenas para admin). — a curadoria virou o 5º `KpiTile`, com a barra no lugar do subtítulo (`progresso` prop). A grade alterna entre `md:grid-cols-4` e `md:grid-cols-5` via `mostraCuradoria`, que também cobre o estado de loading (4 esqueletos).
- [ ] 3.4 Medir a altura do hero e do cromo total. Anotar quanto foi liberado em relação à linha de base de 1.4 — esperado ~85px. **Este número é o orçamento do Movimento 2.**

## 4. Movimento 2 — Adotar o sistema de espaçamento da Central de Vendas

Eixo horizontal — copiar sem calibragem:

- [x] 4.1 Em `src/components/Coverage.jsx`, trocar `md:px-6` por `md:px-10` no `<main>`.
- [x] 4.2 Em `src/components/Coverage.jsx:95`, trocar `max-w-[1400px]` por `max-w-[1200px]`.
- [x] 4.3 Em `src/components/coverage/CoverageHero.jsx:102`, trocar `rounded-2xl p-5 sm:p-6` por `rounded-[24px] p-6 sm:p-8`.
- [x] 4.4 Subir a escala tipográfica do hero para a de `ServicesHero.jsx:175-180`: h1 em `text-[26px] sm:text-[30px] lg:text-[34px]`, subtítulo em `mt-2 text-sm leading-relaxed sm:text-[15px]`.
- [x] 4.5 Aumentar a busca de `maxWidth={420}` para o padrão de 560px. — fixado em 560 sem risco de estouro: `HeroSearchInput` aplica `width: 100%` com `maxWidth` como **teto**, não piso, então o campo encolhe normalmente quando divide a linha com o botão "Sincronizar". O aperto real da coluna esquerda é o breakpoint cego à sidebar, que é o Movimento 1 (Leva 2).

Eixo vertical — calibrar contra o orçamento:

- [x] 4.6 Aumentar `gap-3` e `py-4` no container da página em direção ao padrão de CdV (`gap-8`, `py-8`), **parando no limite do orçamento medido em 3.4**. — adotado `gap-6` + `py-4`. `gap-8` foi descartado por estimativa: 3 gaps × 20px de acréscimo = +60px, contra ~74px liberados pela `BarraStatus` e ~+25px consumidos pelo hero maior (padding, h1, subtítulo). Confirmar em 4.7.
- [ ] 4.7 Verificar a restrição dura: o cromo vertical total SHALL ser ≤ o valor da linha de base 1.4 (~397px). Se não fechar, cortar do arejamento — nunca da altura do mapa.

Verificação do movimento:

- [x] 4.8 Comparar lado a lado com as capturas de 1.5. As duas telas devem ler como o mesmo produto: mesma margem lateral, mesmo raio, mesma escala de título, mesmo ritmo vertical. — aceito pelo usuário, que havia apontado a Central de Vendas como referência.
- [ ] 4.9 Verificar ausência de rolagem horizontal em todos os zooms e larguras testados, nos dois estados da sidebar.
- [ ] 4.10 Verificar o enquadramento do Leaflet em `src/components/CoverageMap.jsx` com a nova proporção do mapa. Como só 2 de 196 regiões têm coordenadas, confirmar que o `fitBounds` não produz zoom extremo nem centraliza fora da área de cobertura.

## 5. Checkpoint da Leva 1

- [ ] 5.1 Repetir a medição de 1.1 nos quatro zooms. Alvo: espaço em branco **simétrico** e em linha com o da Central de Vendas (~392px em zoom 80%) — não zero.
- [ ] 5.2 Confirmar que o mapa não perdeu largura nem altura em relação à linha de base 1.3/1.4.
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
- [ ] 6.6 Verificar a invariante central: varrer a largura da janela de 900px até o máximo disponível e confirmar que a largura do mapa **nunca** diminui. Conferir com atenção a transição 1023 → 1024, que hoje causa queda de 60%.
- [ ] 6.7 Conferir que em 1024–1279px o alternador mapa/lista está visível e descobrível — nessa faixa ele deixa de ser "controle de mobile" e passa a ser o único acesso à lista em notebook.

## 7. Verificação final

- [ ] 7.1 Comparar as medições finais com a linha de base de 1.1–1.4.
- [ ] 7.2 Verificar os dois temas (claro e escuro) nas três faixas — vistas alternadas, duas colunas com hero empilhado, e duas colunas com hero dividido.
- [ ] 7.3 Verificar mobile (360–768px) para confirmar que nenhum movimento regrediu o comportamento de rolagem ou o drawer da lista.
- [ ] 7.4 Rodar `openspec validate coverage-layout-proporcional --strict`.
