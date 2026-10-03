## Context

O `Dashboard.jsx` usa o token CSS `CARD` para estilizar a maioria dos cards do bento grid. Esse token inclui `overflow-hidden`, que é necessário para clipar o conteúdo interno do card (ex: texto longo, listas com scroll). Porém, o `GlowingEffect` posiciona seus elementos com `position: absolute` e `inset: -1px` — ou seja, **ligeiramente fora** do card pai. O `overflow-hidden` no pai corta esses elementos antes que se tornem visíveis, tornando o efeito de borda interativa inativo visualmente.

```
Estado atual (quebrado):
┌─ div.CARD (overflow: hidden) ─────┐
│ ┌─ GlowingEffect (inset: -1px) ─┐ │
│ │ ← cortado pelo overflow!      │ │
│ └───────────────────────────────┘ │
│ ┌─ conteúdo ─────────────────────┐ │
│ │  título, dados, ações          │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘

Estado desejado (corrigido):
┌─ div.CARD (overflow: visible / default) ┐
│ ┌─ GlowingEffect (inset: -1px) ────────────────┐
│ │ ← visível ao hover ✅                         │
│ └───────────────────────────────────────────────┘
│ ┌─ div.conteúdo (overflow: hidden) ──────────┐  │
│ │  título, dados, ações — clipping OK ✅      │  │
│ └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Goals / Non-Goals

**Goals:**
- Remover `overflow-hidden` do token `CARD` (wrapper externo).
- Garantir que o clipping de conteúdo interno seja preservado com `overflow-hidden` no div filho de cada card.
- O `GlowingEffect` deve se tornar visível durante o hover em todos os 6 cards afetados.

**Non-Goals:**
- Alterar o comportamento visual dos cards fora do contexto do GlowingEffect.
- Modificar cards em outras páginas fora do `Dashboard.jsx`.

## Decisions

### D1 — Remover `overflow-hidden` do token `CARD` e mover para o conteúdo filho

**Decisão:** O token `CARD` perde o `overflow-hidden`. Cada card que use `CARD` e que tenha conteúdo que precise ser clipado recebe um `<div className="... overflow-hidden">` envolvendo apenas o conteúdo.

**Alternativas consideradas:**
- *Usar `overflow: clip` no pai*: Diferente de `overflow: hidden`, `clip` não cria um contexto de formatação de bloco — mas tem suporte limitado em alguns browsers mais antigos. Rejeitado por cautela.
- *Adicionar `z-index: -1` ao GlowingEffect*: Não resolve, o stacking context ainda seria afetado pelo `overflow: hidden` do pai.
- *Mover o GlowingEffect para fora do card*: Quebraria a estrutura de posicionamento relativo. Rejeitado.

### D2 — Estratégia de aplicação por card

Cada card afetado já foi atualizado para ter a estrutura:
```jsx
<div className={`${CARD} relative`}>           // ← wrapper externo
  <GlowingEffect ... />
  <div className="relative z-10 ...">          // ← wrapper de conteúdo
    {/* conteúdo */}
  </div>
</div>
```

A mudança é: adicionar `overflow-hidden` ao wrapper de conteúdo interno (`relative z-10`) para cada card onde o conteúdo possa transbordar.

## Risks / Trade-offs

- **Conteúdo vaza fora do card**: Se o `overflow-hidden` não for aplicado no wrapper filho correto, conteúdo pode "vazar". *Mitigação*: verificar visualmente cada card após a mudança.
- **Compatibilidade com `bento-hover-border`**: O `ComunicadosCard` usa `bento-hover-border` em vez de `CARD`. Já tem `overflow-hidden` na classe do wrapper externo — precisa ser removido especificamente. *Mitigação*: tratamento individual para esse card.
- **Rollback simples**: A mudança é cirúrgica e de baixo risco — reverter é adicionar `overflow-hidden` de volta ao `CARD`.
