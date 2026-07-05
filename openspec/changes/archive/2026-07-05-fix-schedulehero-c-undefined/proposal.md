## Why

O componente `ScheduleHero` em `src/components/Schedule.jsx` está quebrando a página de Escala com `ReferenceError: C is not defined`. Isso acontece porque o componente usa o objeto de cores `C` (ex.: `C.accentDeep`, `C.surface`) sem declarar `const C = useBentoTheme();`, padrão adotado em todo o restante do projeto após o redesign Bento Blue.

## What Changes

- Adicionar `const C = useBentoTheme();` no início do componente `ScheduleHero` (`src/components/Schedule.jsx:20`).
- Garantir que todas as referências a `C.accentDeep`, `C.accentDark`, `C.accent`, `C.surface` e `C.cyan` dentro de `ScheduleHero` passem a resolver corretamente.

## Capabilities

### New Capabilities

Nenhuma. Esta change é uma correção de bug em código existente.

### Modified Capabilities

Nenhuma. Não há mudança de comportamento ou requisito funcional — apenas correção de um erro de runtime.

## Impact

- **Arquivo afetado**: `src/components/Schedule.jsx`
- **Componente afetado**: `ScheduleHero`
- **Hook utilizado**: `useBentoTheme` (já importado no arquivo)
- **Risco**: Baixo — alteração mínima e alinhada ao padrão dos demais componentes.
