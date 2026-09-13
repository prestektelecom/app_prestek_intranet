## Context

O projeto usa o hook `useBentoTheme()` como design system centralizado de cores. Ele retorna um objeto `C` com tokens semânticos (`C.surface`, `C.ink`, `C.accent`, etc.) que variam conforme o tema ativo (`light`, `dark-cyber`, `dark-aurora`, `dark-amoled`).

O componente `TicketsList.jsx` já usa `useBentoTheme` corretamente no `TicketsHero` e no `StatusBadge`. No entanto, o bloco de renderização principal (linhas 226–268) usa classes Tailwind arbitrárias com valores hex fixos, criando inconsistência visual nos temas dark.

**Tokens afetados no `BENTO_LIGHT` vs temas dark:**

| Token | Light | Cyber Dark | Aurora Dark |
|-------|-------|-----------|-------------|
| `surface` | `#FFFFFF` | `rgba(17,28,44,0.85)` | `#161233` |
| `line` | `#E4ECF5` | `#1E2E4A` | `#2E2254` |
| `ink` | `#0B1B2E` | `#F5F9FF` | `#F5F9FF` |
| `ink2` | `#475467` | `#8896A8` | `#A398CD` |
| `muted` | `#8896A8` | `#8896A8` | `#8896A8` |
| `accent` | `#4A9EF5` | `#00F2FE` | `#8A2BE2` |
| `accentDeep` | `#1F5BA8` | `#1F5BA8` | `#521193` |
| `danger` | `#E84545` | `#FF2A54` | `#FF007A` |
| `accentSoft` | `#EAF4FF` | `rgba(0,242,254,0.12)` | `rgba(138,43,226,0.15)` |

## Goals / Non-Goals

**Goals:**
- Todos os estados do `TicketsList` (loading, erro, vazio, dados) usam exclusivamente tokens do `useBentoTheme`
- A aparência visual é consistente e correta em todos os 4 temas disponíveis
- Nenhuma regressão na aparência do tema light

**Non-Goals:**
- Alterar lógica de negócio, API calls ou estrutura de dados
- Modificar o `useBentoTheme` ou adicionar novos tokens
- Modificar outros componentes além de `TicketsList.jsx`
- Adicionar novos recursos visuais além da correção de cores

## Decisions

### Decisão 1: `style` inline em vez de classes Tailwind dinâmicas
**Escolha**: Converter as classes de cor para `style={{ color: C.ink }}` etc.

**Motivo**: Classes Tailwind arbitrárias com valores dinâmicos (`text-[${C.ink}]`) não funcionam em Tailwind padrão sem JIT e configuração de safelist. O padrão já adotado no projeto (visto em `TicketsHero`, `TiSupportModal`, etc.) é usar `style` inline para cores do design system.

**Alternativa descartada**: CSS variables — exigiria refatoração maior e não é o padrão adotado no projeto.

### Decisão 2: Manter estrutura JSX; mudar apenas atributos de cor
**Escolha**: Não reorganizar o JSX — apenas trocar `className` de cor por `style`.

**Motivo**: Minimiza risco de regressão. A mudança é cirúrgica e fácil de revisar.

### Decisão 3: Gradiente do botão via `style` com `C.accentDeep` e `C.accent`
**Escolha**: `background: \`linear-gradient(to right, ${C.accentDeep}, ${C.accent})\``

**Motivo**: Mantém o gradiente consistente com o hero e outros botões primários do projeto.

## Risks / Trade-offs

- **[Risco baixo] Inline styles aumentam verbosidade** → Aceito como trade-off, é o padrão do projeto
- **[Risco mínimo] Classe `bg-white` do container principal pode ser sobrescrita por Tailwind reset** → Migrar para `style={{ backgroundColor: C.surface }}` resolve completamente
- **[Sem risco] Nenhuma mudança em lógica** → Apenas substituição de atributos visuais

## Migration Plan

1. Ler o arquivo completo de `TicketsList.jsx`
2. Garantir que `const C = useBentoTheme()` está disponível no componente `TicketsList` (já existe)
3. Substituir as 14 ocorrências de cores hardcoded identificadas na exploração
4. Verificar visualmente em light e em pelo menos um tema dark
