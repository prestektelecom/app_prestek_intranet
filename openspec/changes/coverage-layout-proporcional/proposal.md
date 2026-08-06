## Why

A Central de Cobertura de Rede tem desproporção de layout em três eixos independentes. O sintoma que motivou a change é o espaço em branco: com o navegador em zoom 80%, sobram ~484px vazios — **todos do lado direito**, com o conteúdo colado na sidebar.

**1. O `<main>` do Coverage nunca cresce.** O container do shell é um flex row ([App.jsx:157](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/App.jsx)), e o `<main>` do Coverage é o único da aplicação sem `flex-1`:

```
Coverage.jsx:94            <main className="flex h-full min-h-0 flex-col ...">   ← sem flex-1
Processos.jsx:383          <main className="flex-1 flex flex-col ...">           ✓
Dashboard.jsx:1269         <main className="flex-1 overflow-y-auto ...">         ✓
ServicesDirectory.jsx:457  <main className="flex-1 overflow-y-auto ...">         ✓
```

Com `flex: 0 1 auto`, o `<main>` encolhe até o `max-content` do conteúdo (~1188px) e para, alinhado ao início da linha. Todo o espaço restante vira faixa morta à direita.

Consequência: `mx-auto` e `max-w-[1400px]` são ambos **inertes**. O `mx-auto` só centraliza se sobrar espaço dentro do `<main>`, e o `<main>` já tem o tamanho do conteúdo; a cap de 1400 nunca é atingida porque o congelamento acontece antes. O defeito se esconde em zoom 100%, onde o espaço disponível é ≈ o `max-content` e o `<main>` enche por acidente — só aparece ao reduzir o zoom, quando a viewport CSS cresce e o `<main>` não acompanha.

**2. O espaçamento diverge do padrão que já funciona na aplicação.** A Central de Vendas ([ServicesDirectory.jsx:457](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/ServicesDirectory.jsx) + [ServicesHero.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/services/ServicesHero.jsx)) resolve o mesmo problema de hero + busca + instrumentação com um sistema mais generoso, e **todas** as medidas da Cobertura são mais apertadas:

| | Central de Vendas | Cobertura |
|---|---|---|
| `<main>` cresce | `flex-1` ✓ | — ✗ |
| padding lateral | `md:px-10` (80px) | `md:px-6` (48px) |
| padding vertical | `py-8` (64px) | `py-4` (32px) |
| gap entre blocos | `gap-8` (32px) | `gap-3` (12px) |
| largura máxima | 1200px | 1400px |
| raio do hero | `rounded-[24px]` | `rounded-2xl` (16px) |
| padding do hero | `p-6 sm:p-8` | `p-5 sm:p-6` |
| h1 | 26 / 30 / 34 | 22 / 26 / 29 |
| subtítulo | `text-sm` `leading-relaxed` | `text-[13px]` `leading-snug` |
| busca | 560px | 420px |
| split do hero | 6/6 | 5/7 |

Note a linha da largura máxima: a Central de Vendas é **mais estreita** (1200 vs 1400) e portanto tem *mais* margem lateral — 392px em zoom 80%, contra os 484px da Cobertura. Ainda assim é a que o usuário aponta como correta. O que incomoda não é a quantidade de espaço em branco, é a **assimetria**: 392px distribuídos igualmente leem como respiro; 484px empilhados de um lado leem como defeito.

**3. Os breakpoints são cegos à sidebar.** Todas as decisões de layout da página usam breakpoints de **viewport**, enquanto o conteúdo vive num container ~300px mais estreito (sidebar de 248px expandida / 72px colapsada). O `lg` (1024) faz duas coisas simultâneas — revela a sidebar (−248px) e divide a página em duas colunas (−332px) — e o resultado é que aumentar a janela em 1px *encolhe* o mapa em 60%:

```
viewport 1023 → conteúdo 975 → 1 coluna  → mapa 975px
viewport 1024 → conteúdo 728 → 2 colunas → mapa 396px   (−60%)
```

O mesmo padrão se repete no hero em `xl` (1280): o conteúdo tem 984px e o hero divide em 5/7, deixando 396px para uma coluna que precisa de ~578px (h1 + busca de 420px + botão Sincronizar).

**4. O hero duplica instrumentação que já existe abaixo dele.** `BarraStatus` conta exatamente o mesmo que os chips de filtro de status, a 60px de distância vertical — e os chips são melhores, porque são clicáveis. Como a página tem altura travada em `lg+` (`lg:overflow-hidden`), cada pixel do hero sai direto da altura do mapa.

Esta change também torna verificável um requisito que já existe: `cobertura-ui-redesign` § "Layout fluido na Central de Cobertura" já exige que "o mapa ocupa o espaço restante sem ser comprimido por elementos fixos", mas sem limiar mensurável — nada na spec atual proíbe a faixa morta, o penhasco nem a assimetria.

## What Changes

- **Movimento 0 — Fazer o `<main>` ocupar a linha.** Adicionar `flex-1` e `w-full` ao `<main>` de `Coverage.jsx`, alinhando-o ao padrão das demais páginas. Uma classe: acaba a faixa morta à direita e o `mx-auto` volta a centralizar. É pré-requisito de todo o resto — qualquer ajuste de largura máxima é inobservável enquanto o `<main>` estiver congelado no `max-content`.

- **Movimento 2 — Adotar o sistema de espaçamento da Central de Vendas.** Alinhar a Cobertura ao padrão da tabela acima: `md:px-10`, largura máxima de 1200px, gaps e paddings mais generosos, e a escala tipográfica do hero (`rounded-[24px]`, `p-6 sm:p-8`, h1 em 26/30/34, subtítulo `text-sm leading-relaxed`, busca em 560px). Duas telas irmãs passam a ler como o mesmo produto.

- **Movimento 3 — Cortar a duplicação do hero.** Remover `BarraStatus` (os chips de filtro já expõem as mesmas contagens, com a vantagem de serem acionáveis) e acomodar a instrumentação restante — 4 KPIs + progresso de curadoria — em uma fileira só. Libera ~85px de altura, que é o que financia o arejamento vertical do Movimento 2 (ver `design.md`).

- **Movimento 1 — Alinhar breakpoints ao container.** Subir um degrau os limiares: split lista+mapa de `lg` (1024) para `xl` (1280); split interno do hero de `xl` (1280) para `2xl` (1536); alternador mapa/lista acompanha. Elimina o penhasco sem dependência nova e sem tocar em `tailwind.config.js`.

A execução está em duas levas (ver `tasks.md`). A **Leva 1** são os Movimentos 0, 2 e 3, que juntos resolvem o espaço em branco e o alinhamento com a Central de Vendas — é o que o usuário relatou. A **Leva 2** é o Movimento 1, que trata do penhasco de largura, um defeito real mas distinto e não observado por ele.

## Capabilities

### New Capabilities

Nenhuma. A mudança é de layout responsivo sobre funcionalidade já existente.

### Modified Capabilities

- **`cobertura-ui-redesign`** — o requisito "Layout fluido na Central de Cobertura" é reescrito com limiares mensuráveis: exige que o container raiz ocupe a linha disponível, proíbe faixa morta em apenas um dos lados, proíbe que aumento de viewport reduza o mapa, ancora o espaçamento ao padrão da Central de Vendas e proíbe duplicar instrumentação entre hero e filtros.

## Impact

Arquivos afetados:

- [src/components/Coverage.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/Coverage.jsx) — `flex-1` no `<main>`, sistema de espaçamento, largura máxima, breakpoints do grid, alternador mobile
- [src/components/coverage/CoverageHero.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/coverage/CoverageHero.jsx) — escala tipográfica e paddings, remoção de `BarraStatus`, breakpoint do split interno
- [src/components/coverage/CoverageFilters.jsx](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/coverage/CoverageFilters.jsx) — breakpoint do arranjo dos grupos de chips

Sem impacto em API, banco de dados ou dependências. Nenhum pacote novo — container queries foram consideradas e descartadas (ver `design.md`).

Risco a verificar: o arejamento vertical do Movimento 2 compete diretamente com a altura do mapa, porque a página tem altura travada. O `design.md` define o orçamento e a restrição de verificação (o cromo vertical não pode crescer em relação a hoje).
