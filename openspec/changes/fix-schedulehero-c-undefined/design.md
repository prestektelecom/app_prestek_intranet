## Context

O componente `ScheduleHero` faz parte da tela de Escala (`src/components/Schedule.jsx`). Durante o redesign Bento Blue, o componente foi estilizado com referências ao objeto de cores `C` — por exemplo, `C.accentDeep`, `C.accentDark`, `C.accent`, `C.surface` e `C.cyan` — mas a declaração de `C` via `useBentoTheme()` não foi incluída na função `ScheduleHero`.

O componente principal `Schedule` declara `const C = useBentoTheme();` em seu escopo, mas `ScheduleHero` é definido como uma função separada no topo do arquivo e, portanto, não tem acesso a essa variável. O resultado é `ReferenceError: C is not defined` no carregamento da página de Escala.

## Goals / Non-Goals

**Goals:**
- Eliminar o erro de runtime na página de Escala.
- Manter a consistência visual do hero com os demais componentes do redesign.
- Seguir o padrão já estabelecido no projeto (`const C = useBentoTheme();` dentro do componente).

**Non-Goals:**
- Refatorar a arquitetura do tema.
- Alterar comportamento, layout ou aparência do `ScheduleHero`.
- Criar novos componentes ou capabilities.

## Decisions

**Adicionar `const C = useBentoTheme();` dentro de `ScheduleHero` (Opção A).**

Essa é a solução mais simples e alinhada com o restante da base de código. Outros componentes — como `Dashboard`, `Comunicados`, `Header`, `Sidebar` e os próprios subcomponentes de `schedule/` — declaram `const C = useBentoTheme();` localmente.

Alternativas consideradas:
- **Passar `C` como prop**: Funcionaria, mas introduziria prop drilling desnecessário para um único nível.
- **Extrair `ScheduleHero` para arquivo próprio**: Seria uma reorganização maior, fora do escopo de um bug fix mínimo.

## Risks / Trade-offs

- **[Risco] Chamada de hook condicional ou fora de ordem.** → A declaração será colocada no início do componente, antes de qualquer retorno condicional, respeitando as Regras dos Hooks do React.
- **[Risco] `useBentoTheme` não retornar as chaves esperadas.** → O hook já está em uso em dezenas de componentes e retorna `accentDeep`, `accentDark`, `accent`, `surface`, `cyan`, entre outras. Nenhuma nova chave será usada.

## Migration Plan

Não aplicável. A correção é um patch em tempo de build; não há deploy, migração de dados ou rollback necessário.

## Open Questions

Nenhuma.
