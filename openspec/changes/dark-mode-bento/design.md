## Context

O hook `useTheme.ts` já gerencia a classe `.dark` no `<html>`. O desafio é fazer com que os componentes Bento — que hoje usam objetos `C` com cores hex fixas — reajam a essa classe.

## Goals / Non-Goals

**Goals:**
- Definir uma paleta dark Bento coerente.
- Fazer os componentes críticos reagirem ao tema escuro.
- Eliminar cores warm/âmbar do `.dark`.

**Non-Goals:**
- Redesenhar fluxos funcionais.
- Migrar páginas que ainda não são Bento.
- Criar animações ou transições complexas de tema.

## Decisions

### 1. Variáveis CSS como fonte de verdade
Os objetos `C` locais serão convertidos para referenciar variáveis CSS (`var(--background)`, `var(--card)`, `var(--accent)`, etc.). Isso permite que o mesmo componente reaja a `.dark` sem re-renderização.

### 2. Manter `tone()` para transparências
Para sombras e transparências que exigem `rgba()`, usaremos os valores hex dos tokens Bento (que não mudam de nome, apenas de valor no `.dark`). A função `tone()` continua funcionando desde que receba o hex correspondente ao tema. Quando necessário, usaremos um hook `useBentoTheme()` para obter o tema atual.

### 3. Componentes críticos primeiro
`Header`, `Sidebar`, `Dashboard`, `Configuracoes` e `AdminDashboard` são vistos em praticamente toda navegação. Migrá-los primeiro garante que o dark mode seja perceptível imediatamente.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Componentes inline permanecem claros | Fases; validar visualmente a cada fase |
| Contraste insuficiente | Testar combinações de fundo/texto no navegador |
| `tone()` com variáveis CSS | Usar hook quando necessário |
| Mudanças de escopo | Limitar a componentes Bento já existentes |
