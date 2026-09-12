## Context

Escopo P0+P1 dos relatórios de crítica (`.impeccable/critique/2026-09-12T00-49-08Z__src-components-schedule-jsx.md`, 23/40) e audit (9/20, Ruim) da Fase 4 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. Revalidação de sobreposição ao trocar a data (P0)

`openNewPlantao` hoje só verifica `plantoes` uma vez, na abertura. A correção reaproveita a mesma lógica de busca já usada em `openManagement` (`plantoes.find(p => toIsoDay(p?.data) === dateStr)`), chamando-a também no `onDateChange` do `Schedule.jsx` sempre que `dateEditable` for `true`. Isso atualiza `existingPlantao`/`formData` a cada troca de data, fazendo o aviso "Já existe um plantão — salvar irá substituir" e o `formData` pré-preenchido reagirem à nova data, exatamente como já acontece ao abrir via calendário.

### 2. Trap de foco no `ManagePlantaoModal` (P0)

O chrome (Fase 1, `harden`) e o `TiSupportModal` (Fase 3) já resolveram o mesmo problema com um hook compartilhado de captura de foco + Escape. Reaproveitar esse padrão aqui: um `useEffect` que localiza os elementos focáveis dentro do modal, prende `Tab`/`Shift+Tab` no primeiro/último, e foca o primeiro campo ao abrir. Sem introduzir um hook novo se um já existir reutilizável (`useDismissable` é citado no DESIGN.md para Escape/scroll-lock, mas não cobre trap de foco — verificar durante a implementação se o `TiSupportModal` extraiu algo reaproveitável ou se cada modal implementa o próprio trap).

### 3. Contraste crítico em `PlantaoHistorico.jsx` (P0)

Trocar os 3 usos de `bg-white`/`text-[#0B1B2E]`/`hover:bg-[#F7FAFD]`/`border-[#E4ECF5]` fixos (linhas 107, 118, 197) pelos tokens já em uso no resto da superfície (`bg-surface`, `text-foreground`, `hover:bg-surface-raised`, `border-border`). Não é um redesenho — é trocar literais por tokens equivalentes, mantendo o layout.

### 4. Microtipografia fora da rampa (P1)

64 achados do detector, 12 arquivos. Cada `text-[Npx]` fora da rampa (8/9/10/12/15/16/17/22/40px) sobe para o degrau documentado mais próximo (`label` 13px `text-[13px]`, `overline` 11px `text-[11px]`, ou as classes Tailwind padrão `text-xs`/`text-sm` quando o valor já bate com uma delas). Ajuste mecânico, revisando visualmente cada arquivo depois para confirmar que nada quebrou o layout (line-height, truncamento).

### 5. "Não atribuído" da Supervisão sem tratamento fantasma (P1)

Causa raiz: `mapIdsToPessoas('')` em `Schedule.jsx` sintetiza `{ name: 'Não atribuído', initials: '??' }` em vez de sinalizar ausência — diferente de `n2`, que já é passado como `null` quando `p.n2_id` é falsy (`n2={p.n2_id ? mapIdsToPessoas(p.n2_id) : null}`). Correção: aplicar a mesma condicional a `mgr` (`mgr={p.gerente_id ? mapIdsToPessoas(p.gerente_id) : null}`) nas duas chamadas (`ScheduleRow`/`ScheduleMobileCard`), e atualizar o bloco de renderização de Supervisão em `ScheduleRow.jsx` (linhas 40-54) e `ScheduleMobileCard.jsx` (linhas 80-97) para tratar `mgr === null` com `<UserAvatar user={null} allowEmpty hideName size="size-8" />` dentro do mesmo chip, em vez de assumir `mgr.name` sempre existe.

## Fora de escopo (P2/P3, registrados no audit)

- z-index do `ManagePlantaoModal` (`z-50` vs. os `z-[1100]` documentados) e semântica de diálogo do confirm de exclusão.
- 107 ocorrências de hex remanescentes em `HistoricoPreviewModal.jsx`/`SelectEmployee.jsx` (fora do P0 já corrigido em `PlantaoHistorico.jsx`).
- Touch targets do mini-calendário (28-37px) e altura dos botões do Hero (38px).
- Badge "X selecionado(s)" aplicado à seção de Histórico do modal.
- Bug de capitalização "Setembro De 2026".
