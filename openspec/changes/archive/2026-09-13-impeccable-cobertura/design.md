## Context

Escopo P0+P1 dos relatórios de crítica (`.impeccable/critique/2026-09-13T13-29-50Z__src-components-coverage-jsx.md`, 25/40) e audit (12/20, Aceitável) da Fase 9 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. `OverrideModal` não fabrica dado (P0)

O estado inicial do formulário usava `registro.tecnologia || 'FTTH'`, `registro.status || 'Ativo'`, `registro.percentual_cobertura ?? 100` — um fallback para o valor mais comum, não para "sem dado". Como 316 das 319 regiões reais não têm nenhum desses campos, o fallback era o comportamento padrão, não a exceção.

Trocado para `registro.tecnologia ?? null`, `registro.status ?? null`, `registro.percentual_cobertura ?? 0`. `Segmentado` (o componente de tecnologia/status) já trata `valor !== opção` para toda opção quando `valor` é `null` — ou seja, nenhum botão fica marcado, sem precisar de nenhuma mudança nesse componente.

Um novo estado `tocado` (`{ tecnologia, status, percentual }`) rastreia se o admin já interagiu com cada campo — inicializado como `true` só quando a região JÁ tinha aquele dado (edição de uma região existente continua funcionando exatamente como antes). Quando `!tocado.campo`, um rótulo "— ainda não definida/o" aparece ao lado do label do campo, em `text-muted` (uso correto do token — é literalmente um placeholder, a categoria para a qual `muted` existe).

No submit, os campos não tocados são enviados como `null`/`0` — o mesmo shape que o backend já trata como "sem classificação" hoje (é exatamente o dado que a região tinha antes de o admin abrir o modal). Nenhuma mudança de backend foi necessária.

### 2. Contraste do toggle Mapa/Lista e do toggle de ordenação (P1)

Mesmo bug já documentado em `MEMORIA.md`: `text-[var(--accent)]` (tom de marca, ~500) usado como texto sobre `bg-[var(--accent-soft)]`, que só passa por coincidência nos temas escuros (onde `--accent-dark` e o próprio `--accent` seriam ambos aceitáveis) mas falha no claro (2,63:1). Corrigido com `text-[var(--accent-dark)]`, o par CSS-variável já usado com sucesso em `SectorsToolbar.jsx` (Fase 7). Medido ao vivo: 4,88:1 no claro (era 2,63:1), 8,31:1 no AMOLED. `text-muted` do estado inativo também trocado por `text-faint`, mesma correção já aplicada a esse par em outras fases.

### 3. Alvos de toque (P1)

`Coverage.jsx`: toggle Mapa/Lista ganha `min-h-[44px]` (era ~31,6px calculado, medido 36px). `RegionCard.jsx`: o ícone de engrenagem admin (`size-8`, 32px) ganha `after:-inset-1.5 after:content-['']` — mesma técnica de expansão de área de clique por pseudo-elemento já usada em `Pilula` (Diretório, Fase 6) e no botão "Ver mais" (`SectorCard.jsx`, Fase 7) — confirmado ao vivo com `elementFromPoint` a 4px da caixa visual, resolve para o mesmo botão.

## Fora de escopo (P2/P3, registrados em MEMORIA.md)

- KPI "Cobertura méd." e os chips de tecnologia/status não sinalizam que cobrem ~1% do dado real (316 de 319 regiões sem classificação) — falta um banner equivalente ao já existente para "sem localização".
- Link de atribuição do Leaflet herdando a cor de link global do app (2,92:1).
- `aria-label` ambíguo em 15+ botões "Configurar cobertura de CENTRO" (sem a cidade para diferenciar).
- Sem clusterização de marcadores no mapa (~290 pontos, sobreposição visível em zoom padrão) — mudança de comportamento maior, não polish.
- Busca filtra a lista mas não o mapa, que continua mostrando todas as regiões — mudança de comportamento maior.
- 13 tamanhos de fonte fora da rampa, locais, espalhados por 6 arquivos.
