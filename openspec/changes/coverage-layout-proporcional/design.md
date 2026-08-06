# Design — Layout proporcional da Central de Cobertura

## Decisão 0 — O `<main>` precisa ser um flex item que cresce

Descoberto ao inspecionar a página com o navegador em zoom 80%, onde uma faixa morta de ~482px apareceu à direita e o conteúdo ficou colado na sidebar.

O container do shell é um **flex row**:

```jsx
// App.jsx:157
<div className="flex-1 flex overflow-hidden pb-[64px] lg:pb-0">
```

E o `<main>` do Coverage é o único da aplicação sem `flex-1`:

```
Coverage.jsx:94            <main className="flex h-full min-h-0 flex-col ...">   ← sem flex-1
Processos.jsx:383          <main className="flex-1 flex flex-col ...">           ✓
Dashboard.jsx:1269         <main className="flex-1 overflow-y-auto ...">         ✓
ServicesDirectory.jsx:457  <main className="flex-1 overflow-y-auto ...">         ✓
```

Com o `flex: 0 1 auto` padrão, a largura do item é `min(max-content, disponível)`. O `max-content` desta página é ~1188px, então acima disso o `<main>` congela e fica alinhado ao início da linha:

```
VIEWPORT 1918 — HOJE
 0    248                                    1436              1918
 ├─────┼──────────────────────────────────────┼─────────────────┤
 │ SB  │  main = max-content ≈ 1188px         │   482px MORTOS  │
 └─────┴──────────────────────────────────────┴─────────────────┘
        ↑ colado na sidebar

VIEWPORT 1918 — COM flex-1
 0    248        383                          1783        1918
 ├─────┼──────────┼────────────────────────────┼───────────┤
 │ SB  │   111    │  conteúdo contido, centrado│    111    │
 └─────┴──────────┴────────────────────────────┴───────────┘
                   ↑ simétrico
```

Duas consequências que reordenam o resto deste documento:

1. **`mx-auto` e `max-w-[1400px]` são hoje inertes.** O `mx-auto` só distribui espaço livre *dentro* do `<main>`, e não há espaço livre. A cap nunca é atingida porque o congelamento em ~1188px acontece antes. Não é que a cap esteja mal calibrada: ela nunca chega a valer, em largura nenhuma.

2. **Qualquer ajuste de largura máxima depende deste movimento.** Mexer na cap sem antes fazer o `<main>` crescer não produziria efeito observável.

Por que o defeito passa despercebido: em zoom 100% e viewports de notebook, o espaço disponível é aproximadamente igual ao `max-content`, então o `<main>` enche por acidente e o layout parece correto. Ele só se revela ao reduzir o zoom do navegador, que aumenta a viewport CSS sem que o `<main>` acompanhe.

## Decisão 2 — Adotar o sistema de espaçamento da Central de Vendas

### A evidência que reverteu a direção anterior

A primeira versão deste design concluiu, a partir do pedido "quero aproveitar tudo o possível", que a cap de 1400px devia ser **removida** — hero full-bleed, grid lista+mapa sem teto, espaço em branco tendendo a zero.

O usuário então apontou a Central de Vendas como referência de espaçamento correto. Ela usa `max-w-[1200px]` — **mais estreita** que a Cobertura, portanto com *mais* margem lateral:

```
zoom 80% (viewport CSS ~1920, monitor ~1536 físicos)

  Central de Vendas    392px de branco, simétrico       ← apontada como correta
  Cobertura hoje       484px de branco, todo à direita  ← apontada como defeito
```

A diferença de quantidade é de 92px. A diferença de **simetria** é total. Isso refuta a leitura anterior: o incômodo não é a existência de espaço em branco, é a assimetria. Remover a cap teria resolvido o sintoma pelo motivo errado, e afastado a Cobertura do padrão visual da aplicação.

**Decisão:** em vez de remover a cap, alinhar a Cobertura ao sistema da Central de Vendas.

### O sistema a copiar

| | Central de Vendas | Cobertura hoje | alvo |
|---|---|---|---|
| `<main>` cresce | `flex-1` | — | `flex-1` |
| padding lateral | `px-4 md:px-10` | `px-4 md:px-6` | `px-4 md:px-10` |
| largura máxima | `max-w-[1200px]` | `max-w-[1400px]` | `max-w-[1200px]` |
| raio do hero | `rounded-[24px]` | `rounded-2xl` | `rounded-[24px]` |
| padding do hero | `p-6 sm:p-8` | `p-5 sm:p-6` | `p-6 sm:p-8` |
| h1 | 26 / 30 / 34 | 22 / 26 / 29 | 26 / 30 / 34 |
| subtítulo | `text-sm sm:text-[15px]` `leading-relaxed` | `text-[13px] sm:text-sm` `leading-snug` | igual a CdV |
| busca | 560px | 420px | 560px |
| padding vertical | `py-8` | `py-4` | **calibrar** |
| gap entre blocos | `gap-8` | `gap-3` | **calibrar** |

As linhas horizontais copiam sem conflito. As duas últimas não — ver abaixo.

### Por que 1200 e não um meio-termo

O pedido foi "igual ou próximo". 1200 é o valor literal e faz as duas telas coincidirem exatamente quando colocadas lado a lado. O custo é que o mapa fica mais estreito do que ficaria com 1400:

```
largura do mapa (lista 320 + gap 12)
  hoje, main congelado    ~808px
  com flex-1 e cap 1400   ~1008px
  com flex-1 e cap 1200    ~868px   ← alvo
```

Ou seja, o alvo ainda ganha ~60px em relação a hoje, mas abre mão de ~140px em relação ao que a cap de 1400 daria. É uma troca deliberada de área de mapa por coerência visual entre telas, e foi o que o usuário pediu ao apontar a referência.

Se depois de ver em tela real o mapa parecer apertado, `1280` ou `1320` são meios-termos que preservam a maior parte do respiro lateral. Registrado como ajuste possível, não como plano.

## Decisão 3 — O corte da duplicação financia o arejamento vertical

Aqui está o conflito real. A Central de Vendas é um **documento rolável**; a Cobertura tem **altura travada** (`lg:overflow-hidden`), e nela cada pixel acima do mapa sai da altura do mapa. Copiar `py-8` e `gap-8` cegamente custaria:

```
py-4 → py-8              +32px
gap-3 → gap-8  (3 gaps)  +60px
p-6 → p-8 no hero        +16px
h1 29 → 34               ~+7px
─────────────────────────────────
                        ~+115px   saindo direto do mapa
```

O que o Movimento 3 devolve, ao remover a `BarraStatus` duplicada:

```
HERO (painel preto)                JÁ EXISTE EM OUTRO LUGAR DA TELA
──────────────────────────────────────────────────────────────────────
BarraStatus                    →   CoverageFilters — chips de Status
  Ativo 3 / Sem config. 193          [Ativo 3] [Expansão 0] [Inativo 0]
KPI "Regiões 196"              →   RegionPanel — header "Regiões 196"
"2 de 196 no mapa"             →   RegionCard — badge "sem mapa" por região
```

`BarraStatus` ([CoverageHero.jsx:200-207](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/coverage/CoverageHero.jsx)) e os chips ([CoverageFilters.jsx:61-78](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/coverage/CoverageFilters.jsx)) computam a mesma contagem a 60px de distância vertical. Os chips vencem o desempate: são acionáveis. Remover a fileira devolve **~85px**.

`+115` contra `−85` não fecha. Daí a decisão de calibrar em vez de copiar:

**Restrição de verificação: o cromo vertical não pode crescer em relação a hoje.** O orçamento de arejamento vertical é exatamente o que o Movimento 3 liberar. Na prática isso significa adotar `gap-6` em vez de `gap-8` e manter `py-4` ou subir no máximo para `py-6`, ajustando até o total fechar:

```
cromo vertical hoje    hero 245 + alerta 34 + filtros 50 + gaps 36 + py 32 = 397px
alvo                                                                       ≤ 397px
```

Os valores exatos saem da medição em tela, não deste documento. A restrição é o que importa: **o mapa não pode perder altura para o respiro.**

### Consequência de escopo

Este raciocínio torna o Movimento 3 **pré-requisito** do arejamento vertical do Movimento 2, não uma melhoria opcional posterior. Por isso os dois entram na mesma leva.

## Decisão 1 — Subir os limiares em vez de adotar container queries

Eixo independente dos anteriores, e o único defeito da lista que o usuário **não** relatou — por isso vai na Leva 2.

### O problema

O shell entrega à página um container que não é a viewport:

| peça | largura | fonte |
|---|---|---|
| sidebar | 248px expandida / 72px colapsada | [Sidebar.jsx:294](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/Sidebar.jsx) |
| padding do `<main>` | 32px (`px-4`) / 80px (`md:px-10`, após o Mov. 2) | `Coverage.jsx` |

Como as classes `lg:` / `xl:` medem a **viewport**, cada decisão de layout dispara ~300px antes de o espaço existir:

```
viewport   sidebar   conteúdo   bp ativo   o que o layout FAZ hoje
──────────────────────────────────────────────────────────────────────
   1023      ─          975      md        1 coluna · mapa 975px      ✓
   1024     248         728      lg        2 colunas · mapa 396px     ✗✗✗
   1280     248         984      xl        hero divide 5/7 · esq 396  ✗
   1440     248        1144      xl
```

A coincidência que torna o bug invisível na leitura do código: o conteúdo em `md` (720px) e em `lg` (728px) é praticamente idêntico. O `lg` não ganha espaço — só gasta.

### As alternativas

| | Abordagem | Corrige? | Custo | Veredito |
|---|---|---|---|---|
| A | `screens` customizados no `tailwind.config.js` | parcial | baixo | **Descartado.** O offset não é constante: 248px expandida vs 72px colapsada. Um número fixo erra num dos dois estados. |
| B | Container queries (`@container` + plugin) | sim, por construção | médio | **Descartado por ora.** Correto de verdade e imune ao colapso da sidebar, mas exige dependência nova (o projeto está em Tailwind 3.4.14 sem o plugin) e faria o Coverage divergir do resto da app, que é toda viewport-based. Vale reabrir se o padrão for adotado globalmente. |
| C | **Subir os limiares um degrau** | sim, na prática | trivial | **Escolhido.** |

O que cada layout realmente precisa de largura de conteúdo:

- **Split lista+mapa:** lista mín. 288px + gap + mapa utilizável ~560px = **~860px** → viewport ≈ 1190px
- **Split interno do hero:** coluna esquerda ~700px (h1 maior + busca de 560px) + gap + painel de KPIs ~552px = **~1280px** → viewport ≈ 1610px

Os breakpoints padrão `xl` (1280) e `2xl` (1536) caem próximos desses pisos, sem precisar inventar números:

```
viewport   conteúdo   lista+mapa (split @ xl)      hero (split @ 2xl)
──────────────────────────────────────────────────────────────────────
  1024       696      1 col · mapa 696 (cheia) ✓   empilhado ✓
  1280       952      lista 320 + mapa 620     ✓   empilhado ✓
  1440      1112      lista 320 + mapa 780     ✓   empilhado ✓
  1536      1200      lista 320 + mapa 868     ✓   6/6 → 584 / 584 ✓
  1920      1200      lista 320 + mapa 868     ✓   6/6 → 584 / 584 ✓
```

A invariante que o requisito passa a exigir: **o mapa nunca encolhe quando a janela cresce.**

**Trade-off aceito:** os limiares ficam corretos para a sidebar expandida (248px) e *conservadores* para a colapsada (72px). Preferimos errar para o lado de "uma coluna larga" a repetir o penhasco. Container queries (opção B) removeriam esse compromisso.

## Decisão de escopo — manter a altura travada

A Central de Vendas é um documento rolável. Uma leitura possível de "deixar igual" seria adotar também esse modelo: página rola, mapa com altura fixa.

**Decisão: manter a altura travada** (`lg:overflow-hidden`, mapa recebendo a altura restante).

Justificativa: a queixa foi sobre espaço horizontal, não sobre rolagem; e o valor desta tela é o mapa preencher a viewport. Virar documento rolável empurraria o mapa para baixo da dobra e desfaria o ganho vertical que o Movimento 3 produz. Adotar o *espaçamento* da Central de Vendas não exige adotar seu *modelo de rolagem*.

Esta decisão foi tomada sem confirmação explícita do usuário — a pergunta foi feita e a resposta foi "pode fazer". Se o comportamento não agradar ao ver em tela, é o primeiro ponto a revisitar.

## Decisão em aberto — a lista de regiões em telas muito largas

Com a cap de 1200 a questão perde urgência (a lista fica em 320px e o mapa em 868px, proporção saudável). Fica registrada caso a cap suba depois:

| opção | quando faz sentido |
|---|---|
| manter estreita (`minmax(288px, 320px)`) | a lista é **navegação** — buscar, clicar, voltar ao mapa |
| deixar crescer (`minmax(320px, 420px)`) | meio-termo |
| 2 colunas de cards acima de ~2000px de conteúdo | a lista é **leitura** — comparar regiões entre si |

Adotar a opção conservadora e revisitar com o usuário depois de ver o resultado.

## Riscos

- **O arejamento vertical competindo com o mapa.** Coberto pela restrição "o cromo vertical não pode crescer". Se a medição mostrar que não fecha, cortar do arejamento, não da altura do mapa.
- **Enquadramento do Leaflet.** O mapa muda de proporção. Como apenas 2 de 196 regiões têm coordenadas cadastradas, o `fitBounds` opera sobre um conjunto degenerado e pode enquadrar de forma estranha. Verificar em [CoverageMap.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/CoverageMap.jsx).
- **Faixa 1024–1279 (Leva 2).** Ali a página passa a usar o alternador mapa/lista em vez das duas colunas. É intencional (mapa com 696px em vez de 396px), mas é mudança de comportamento perceptível em notebook — conferir se o alternador está descobrível o bastante nesse tamanho, já que deixa de ser "controle de mobile".
- **A busca de 560px dentro do hero.** Na Cobertura a busca divide a linha com o botão "Sincronizar", que a Central de Vendas não tem. Em 560px + botão a linha pode não caber na coluna do hero antes do split — verificar e, se necessário, manter a busca menor que o padrão de CdV.
