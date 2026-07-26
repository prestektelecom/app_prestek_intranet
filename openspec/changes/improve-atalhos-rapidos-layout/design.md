## Context

O card "Atalhos Rápidos" em `src/components/Dashboard.jsx` (`AtalhosRapidosCard`) renderiza uma lista de botões onde cada item exibe ícone, label (nome do atalho) e hint (descrição curta) **em uma única linha horizontal**. Com larguras menores ou labels mais longos, o hint é cortado pelo `truncate` ou empurra o label para um espaço insuficiente, resultando em texto espremido.

Layout atual:
```
[ícone 36px] [label bold — flex-1 truncate] [hint shrink-0 truncate → direita]
```

## Goals / Non-Goals

**Goals:**
- Empilhar label e hint verticalmente dentro de cada botão
- Garantir que o hint nunca trunca em condições normais de uso
- Manter área de toque mínima de 44px de altura (regra de responsividade do projeto)
- Preservar o comportamento funcional (links, callbacks) sem nenhuma alteração

**Non-Goals:**
- Alterar ícones, cores ou tema
- Adicionar animações ou novos estados
- Mudar a estrutura do card container (altura, grid position)
- Alterar outros cards do Dashboard

## Decisions

### D1 — Estrutura flex-col para o bloco de texto

**Decisão:** Substituir o bloco de texto de `flex-1 truncate` (label única linha) por um `div` com `flex flex-col min-w-0`, contendo dois filhos: label (`text-[13px] font-semibold`) e hint (`text-[11px] text-muted`).

**Alternativas consideradas:**
- Manter horizontal e só aumentar font-size → hint continua competindo por espaço
- Remover hint → perde informação contextual útil ("Tempo médio: ~12 min", "Portal do colaborador")

**Rationale:** Empilhar verticalmente resolve o espremimento sem sacrificar informação.

### D2 — Remoção do `truncate` no hint

**Decisão:** O hint não recebe `truncate` pois agora ocupa sua própria linha. Se o texto for muito longo (improvável nos dados atuais), ele pode quebrar em duas linhas — comportamento aceitável.

**Rationale:** Manter `truncate` no hint vertical seria um anti-pattern; o ponto da mudança é exatamente exibir o texto completo.

### D3 — Ajuste de padding vertical

**Decisão:** Manter `py-2` mas remover o `min-h-[44px]` fixo do botão, pois a altura natural com o label+hint empilhado já supera 44px (dois textos + padding). A área de toque será satisfeita pela altura real do elemento.

> Se em testes a altura cair abaixo de 44px, adicionar `min-h-[52px]` no botão.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Altura dos botões aumenta, gerando scroll no card com muitos atalhos | O card já tem `overflow-y-auto` com `custom-scrollbar` — funciona normalmente |
| Hint longo quebra em 2 linhas e aumenta demais a altura | Os hints atuais são curtos (≤ 25 chars); se necessário aplicar `line-clamp-1` |
| Regressão em mobile (card fica muito alto) | Card vive num grid responsivo; a coluna pode se adaptar. Testar no breakpoint `sm` |
