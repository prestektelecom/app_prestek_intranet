## Context

O projeto Prestek Intranet é uma SPA React/Vite com Design System Bento Blue. Os cards do dashboard usam duas abordagens de estilo:

1. **BentoCard** (`src/components/common/BentoCard.jsx`) — componente base com inline styles via objeto `C` do hook `useBentoTheme`. Usado no Dashboard principal.
2. **Cards Tailwind diretos** (`TechBentoCard`, `PlanoBentoCard`, `StreamingBentoCard`) — usam `className` com classes Tailwind e CSS vars.

Existem 4 paletas de tema (Light, Cyber, Aurora, AMOLED), cada uma com cores de `accent`, `accentDark`, `accentDeep` distintas. O sistema de tema funciona via classes CSS no `<html>` (`.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled`) e via hook `useBentoTheme()` que retorna um objeto `C` com as cores JS.

**Limitação técnica central**: `border-color` CSS não aceita gradiente. Para criar uma borda com gradiente animada, a técnica padrão é usar um `::before` pseudo-element posicionado absolutamente como fundo do card, com o gradiente aplicado como `background`, enquanto o `::after` ou o elemento interno tem o fundo sólido do card — criando a ilusão de borda gradiente.

Porém, dado que os `BentoCard` usam `overflow: hidden`, o `::before` ficaria clipado. A solução mais robusta e sem breaking change é usar **`box-shadow` multicamada** para o glow/borda luminosa no hover, combinado com transição suave de `border-color`.

## Goals / Non-Goals

**Goals:**
- Criar efeito de hover que "dê vida" aos cards com glow + borda luminosa
- Respeitar automaticamente as 4 paletas de tema sem JavaScript adicional
- Implementar via CSS utilitário reutilizável (uma classe, múltiplos cards)
- Não introduzir novas dependências externas
- Manter compatibilidade com `overflow: hidden` do BentoCard
- Preservar comportamento dos cards existentes (sem breaking changes)
- Garantir área de toque mínima de 44×44px (regra responsiva do projeto)

**Non-Goals:**
- Efeito de borda *girando* (conic-gradient spin) — incompatível com `border-radius` sem markup extra
- Animações contínuas (pulsing) em todos os cards — reservado para casos de destaque específicos como tratamento futuro
- Modificar cards que já têm animação própria (HeroCard, Login card)
- Alterar o comportamento de `react-grid-layout` no modo de edição do dashboard

## Decisions

### D1: `box-shadow` multicamada ao invés de `::before` pseudo-element

**Escolhido**: `box-shadow` com múltiplas camadas (borda 0px spread + glow externo).

**Alternativas consideradas**:
- `::before` com `background: gradient + padding:1px` → exigiria mudar o markup de cada card (adicionar wrapper) e conflita com `overflow: hidden`
- `border-image: linear-gradient(...)` → não suporta `border-radius`, quebra o visual arredondado do Bento Blue
- `outline` → não suporta `border-radius` adequadamente em todos browsers

**Rationale**: O `box-shadow` funciona com `border-radius`, não é afetado por `overflow: hidden`, suporta múltiplas camadas simultaneamente (borda sólida + glow externo) e é 100% performático via GPU (não causa reflow). Animado via `transition: box-shadow`, é suave e eficiente.

**Implementação**:
```css
/* Camada 1: borda "sólida" interna (0px blur, spread 1px) */
/* Camada 2: glow externo suave (blur 20px, spread -2px) */
.bento-hover-border:hover {
  box-shadow:
    0 0 0 2px var(--hover-border-from),
    0 0 24px 0px var(--hover-border-glow) !important;
}
```

### D2: CSS custom properties por tema para as cores do efeito

**Escolhido**: Adicionar `--hover-border-from`, `--hover-border-to`, `--hover-border-glow` como tokens em cada bloco de tema (`:root`, `.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled`).

**Rationale**: Isso mantém o princípio do Design System — as cores do efeito se adaptam automaticamente ao tema ativo sem nenhum JS adicional. Segue o mesmo padrão dos tokens existentes (`--primary`, `--accent`, `--ring`).

**Valores por tema**:
| Tema | `--hover-border-from` | `--hover-border-to` | `--hover-border-glow` |
|---|---|---|---|
| Light | `#4A9EF5` | `#2D7BD4` | `rgba(74,158,245,0.40)` |
| Dark (Cyber) | `#00F2FE` | `#4A9EF5` | `rgba(0,242,254,0.45)` |
| Aurora | `#8A2BE2` | `#A04DF0` | `rgba(138,43,226,0.50)` |
| AMOLED | `#4A9EF5` | `#7AB8F8` | `rgba(74,158,245,0.50)` |

### D3: Classe utilitária `.bento-hover-border` global

**Escolhido**: Uma classe CSS utilitária no `index.css`, aplicável a qualquer `div`.

**Rationale**: Permite aplicar o efeito em ambas as famílias de cards (BentoCard via prop + Tailwind cards via `className`) sem duplicar lógica. Alinha-se com o padrão já usado no projeto (ex: `.glass`, `.animate-glow-gold`, `.login-btn`).

### D4: `border-color` com transição no estado base

Para garantir que o efeito prevaleça sobre estilos inline (`BentoCard`/`KpiCard`) e sobre classes utilitárias Tailwind de mesmo peso específico (ex: `hover:shadow-lg`), a declaração `box-shadow` do estado `:hover` usa `!important`. A transição será feita via `box-shadow` zero → preenchido, mantendo a borda existente intacta.

## Risks / Trade-offs

- **[Performance em listas densas]** → Cards de diretório podem ter 50+ itens visíveis. `box-shadow` com `transition` é GPU-accelerated, risco mínimo. **Mitigação**: Usar `will-change: box-shadow` apenas no hover via CSS.
- **[Conflito com `.widget-editable:hover`]** → Dashboard em modo edição já tem `transform: scale(1.01) + box-shadow` no hover. **Mitigação**: A classe `.bento-hover-border` não define `transform` próprio, e o efeito de `box-shadow` é suprimido dentro de `.layout.is-editing` via override CSS, evitando conflito visual.
- **[`overflow: hidden` nos BentoCards]** → Resolvido pela escolha do `box-shadow` (D1), que não é clipado por overflow.
- **[Temas com múltiplas classes]** → O seletor de tema usa classes no `<html>`. Se um elemento herda múltiplos temas, o mais específico prevalece (cascata CSS normal). Não há problema conhecido.

## Migration Plan

1. Adicionar tokens CSS em `index.css` (seguro, sem breaking change)
2. Adicionar classe `.bento-hover-border` em `index.css`
3. Atualizar `BentoCard.jsx` com prop `hoverBorder`
4. Aplicar classe em `TechBentoCard`, `PlanoBentoCard`, `StreamingBentoCard`
5. Aplicar classe no `KpiCard` dentro de `Dashboard.jsx`
6. **Rollback**: Remover a classe dos divs e reverter `index.css` — zero side effects

## Open Questions

- Deseja aplicar a classe também em cards de `Offices.jsx`, `Directory.jsx` e `Sectors.jsx` (cards de colaboradores)? Ficou de fora do escopo inicial por serem mais densos, mas é trivialmente extensível.
- ✅ Confirmado: `KpiCard` do Dashboard receberá a classe `.bento-hover-border` diretamente em seu `div` raiz, preservando seus estilos inline existentes.
