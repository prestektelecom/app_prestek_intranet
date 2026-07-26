# Design: GlowingEffect Card Integration

## Context

A Intranet da Prestek utiliza React 18, Vite e Tailwind CSS 3.4. Atualmente, os componentes de Card utilizam a classe `.bento-hover-border` em CSS puro para desenhar bordas e transições em hover.

Para integrar o componente `GlowingEffect` (escrito em TypeScript/React utilizando `motion/react`), precisamos estruturar a aplicação de acordo com o padrão Shadcn UI (`/components/ui/`), garantindo resiliência em navegadores desktop e performance suave em dispositivos móveis.

## Goals / Non-Goals

**Goals:**
- Configurar o alias `@/` no Vite e no editor para direcionar a `./src`.
- Criar a estrutura Shadcn UI em `src/components/ui/glowing-effect.tsx` e o utilitário `src/lib/utils.ts`.
- Integrar o `GlowingEffect` ao `BentoCard` e aos cards do `Dashboard.jsx`.
- Integrar com a regra de responsividade do projeto ([AGENTS.md](file:///f:/Projetos%20em%20Dev/prestek_intranet/AGENTS.md)) garantindo que em touchscreens o rastreamento via `pointermove` seja desativado mantendo a área de toque mínima de 44x44px.

**Non-Goals:**
- Substituir todos os cards de listas extensas ou tabelas por `GlowingEffect` (o foco são os Bento Cards principais e KPIs para evitar fadiga visual).

## Decisions

### D1 — Estrutura de Pastas e Alias `@/`

**Decisão:** Adicionar `resolve.alias` no `vite.config.js` apontando `@` para `src/` e criar `jsconfig.json`. Manter componentes reutilizáveis estilo Shadcn em `src/components/ui/`.

**Alternativas consideradas:**
- Usar caminhos relativos (ex: `../../lib/utils`). *(Rejeitado por violar o padrão Shadcn UI enviado no componente original)*.

### D2 — Animação e Performance em Dispositivos Móveis

**Decisão:** Passar `disabled={isTouchOnly}` para o `GlowingEffect` ao utilizar em dispositivos primariamente touchscreen.

**Rationale:** Rastrear `pointermove` em telas mobile causa consumo desnecessário de bateria e CPU durante a rolagem. O hook `useTouchOnly` ([useTouchOnly.js](file:///f:/Projetos%20em%20Dev/prestek_intranet/src/hooks/useTouchOnly.js)) já detecta se a entrada é touch.

## Architecture Sketch

```
┌────────────────────────────────────────────────────────┐
│                        BentoCard                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ GlowingEffect (position: absolute inset-0)       │  │
│  │ ┌──────────────────────────────────────────────┐ │  │
│  │ │ CSS Vars: --start, --active, --gradient, etc │ │  │
│  │ └──────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Card Content (relative z-10)                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- **Dependência do `motion`**: A inclusão do pacote `motion` aumenta levemente o bundle. *Mitigação*: Importar apenas `animate` sub-módulo.
- **Sobreposição de z-index**: Se o conteúdo do card não tiver `relative z-10`, o efeito de borda pode cobrir botões clicáveis. *Mitigação*: Aplicar `relative z-10` nos filhos do card.
