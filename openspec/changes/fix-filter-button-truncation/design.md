## Context

O componente `ServicesDirectory.jsx` exibe uma barra horizontal com botões de filtro. Em telas menores, a quebra de linha interna nos botões de filtro resulta no truncamento e ocultamento de palavras (ex: "Internet PF" vira "Internet\nPF" ou corta texto).

## Goals / Non-Goals

**Goals:**
- Impedir quebra de texto dentro dos botões de filtro na barra superior de `ServicesDirectory.jsx`.
- Garantir alinhamento visual premium e legibilidade em todas as resoluções de tela.

**Non-Goals:**
- Alterar as funcionalidades ou a lógica de filtragem dos botões.
- Modificar os botões de ordenação (que já funcionam corretamente com `whitespace-nowrap`).

## Decisions

### 1. Adicionar classe Tailwind `whitespace-nowrap` nos botões de filtro
- **Decisão:** Adicionar a classe utilitária `whitespace-nowrap` no template da renderização dos botões de filtro (no `.map` da lista de filtros).
- **Racional:** Os botões de ordenação adjacentes já usam essa abordagem. A quebra de linha interna é evitada, fazendo o container pai (`overflow-x-auto`) gerenciar o scroll horizontal perfeitamente.

## Risks / Trade-offs

Nenhum risco relevante. O comportamento de scroll horizontal é nativo do navegador e já está configurado no container pai.
