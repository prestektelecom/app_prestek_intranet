## Why

A Fase 9 (Cobertura) do programa Impeccable rodou uma crítica dual-agent (`.impeccable/critique/2026-09-13T13-29-50Z__src-components-coverage-jsx.md`, 25/40, Aceitável) e um audit técnico (12/20, Aceitável, 60%) sobre `src/components/Coverage.jsx` e `src/components/coverage/*`. Antes disso, 3 changes pendentes (`coverage-layout-proporcional`, `cobertura-resolver-endereco-cliente`, `cobertura-warmup-swr-cache`) foram verificadas contra o código atual e arquivadas — todas já implementadas.

A crítica encontrou **1 P0**:

- **P0** — `OverrideModal.jsx` pré-preenche uma região sem NENHUM dado com `tecnologia: 'FTTH'`, `status: 'Ativo'` e `percentual_cobertura: 100` — indistinguível de uma classificação real. Confirmado ao vivo: 316 das 319 regiões reais (99%) não têm nenhum desses campos preenchidos. Um admin trabalhando na fila de curadoria (o próprio progresso "3/319 configuradas" convida a isso) pode abrir o modal e salvar sem tocar em nada, gravando dado inventado como se fosse verificado — e um vendedor depois confia nesse "Ativo" para prometer serviço a um cliente.

E 2 P1:

- **P1** — o mesmo bug de tom-de-marca-como-texto já corrigido em `ui/ChipButton.jsx` (Fase 6) e `SectorsToolbar.jsx` (Fase 7), e ainda pendente em `DirectoryToolbar.jsx`, recorre sem correção em 2 lugares desta página: o toggle Mapa/Lista (`Coverage.jsx`) e o toggle de ordenação (`RegionPanel.jsx`), ambos usando `text-[var(--accent)]` sobre `bg-[var(--accent-soft)]` — medido 2,63:1 no tema claro.
- **P1** — 2 alvos de toque abaixo de 44px, confirmados como falha real (não artefato de medição, sem técnica de expansão no código-fonte): o toggle Mapa/Lista (36px) e o ícone de engrenagem admin do `RegionCard.jsx` (32px).

Por decisão do Felix (2026-09-13), o escopo desta change é P0 + P1. Os P2 (KPI/filtros de tecnologia sem sinalizar que cobrem ~1% do dado real; link de atribuição do Leaflet com contraste baixo; `aria-label` ambíguo em botões "Configurar cobertura de CENTRO"; falta de clusterização de marcadores; busca não sincronizada com o mapa) ficam registrados em `MEMORIA.md`.

## What Changes

- `OverrideModal.jsx`: o estado inicial do formulário para uma região sem dado passa a ser "sem seleção" (`tecnologia`/`status` como `null`, `percentual_cobertura` como `0`) em vez de assumir os valores mais comuns. Um rótulo "— ainda não definida/o" aparece ao lado de cada campo até o admin escolher algo, rastreado por um novo estado `tocado`.
- `Coverage.jsx`: o toggle Mapa/Lista troca `text-[var(--accent)]` por `text-[var(--accent-dark)]` no estado ativo e `text-muted` por `text-faint` no inativo; ganha `min-h-[44px]`.
- `RegionPanel.jsx`: o toggle de ordenação (Contratos/A-Z) recebe a mesma correção de cor.
- `RegionCard.jsx`: o ícone de engrenagem admin ganha expansão de área de clique por pseudo-elemento (`after:-inset-1.5`), levando o alvo de 32px para 44px sem crescer visualmente.

## Capabilities

### Modified Capabilities

- `cobertura-ui-redesign`: adiciona requisito de que o formulário de configuração de região não assuma valores como já definidos, e de contraste/área de toque dos controles de alternância da página.

## Impact

- **`src/components/coverage/OverrideModal.jsx`**: estado inicial do formulário, rótulos de campo.
- **`src/components/Coverage.jsx`**: toggle Mapa/Lista.
- **`src/components/coverage/RegionPanel.jsx`**: toggle de ordenação.
- **`src/components/coverage/RegionCard.jsx`**: ícone de engrenagem admin.
- Nenhuma alteração de API ou banco de dados — o shape do POST para `/api/cobertura-ixc/override` não muda, só o que o formulário envia por padrão quando o admin não toca em um campo (antes: valor assumido; agora: `null`/`0`, que já é o estado que o backend trata como "sem classificação").
