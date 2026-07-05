## Nota

Esta change é uma correção de bug pontual. Não introduz novas capabilities nem altera requisitos funcionais existentes, portanto não há especificações de comportamento adicionais a documentar.

A única alteração técnica está descrita em `design.md`: adicionar `const C = useBentoTheme();` ao componente `ScheduleHero` para que as referências a `C.accentDeep`, `C.accentDark`, `C.accent`, `C.surface` e `C.cyan` sejam resolvidas corretamente.
