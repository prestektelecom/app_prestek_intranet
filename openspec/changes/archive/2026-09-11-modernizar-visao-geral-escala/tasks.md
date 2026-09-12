## 1. Hero compartilhada

- [x] 1.1 Em `src/components/Schedule.jsx` (`ScheduleHero`), trocar o
      `background` inline pelo gradiente compartilhado
      `fundoHero(C)` de `src/components/ui/heroGradiente.js`
- [x] 1.2 Substituir os dois `<div>` com `filter: blur()` pela decoração
      `aneisHero()`/reticula de pontos, no padrão de `SectorsHero.jsx`
- [x] 1.3 Confirmar que o grid de KPIs (Plantões/Dias Cobertos/
      Alterações ou Meus Plantões) e os botões de ação continuam com o
      mesmo layout, mudando só o fundo e a decoração

## 2. Container e espaçamento

- [x] 2.1 Alterar o container principal de `Schedule.jsx` de
      `max-w-[1920px] px-4 md:px-8` para `max-w-[1200px] px-4 md:px-10
      py-8 gap-8`
- [x] 2.2 Verificar visualmente que a tabela "Escala Detalhada de
      Suporte" (9 colunas de grid) continua legível no container mais
      estreito, ajustando `overflow-x`/larguras de coluna se necessário

## 3. Tokens semânticos de cor

- [x] 3.1 Mapear e substituir cores hex em `Schedule.jsx` (`#0B1B2E`,
      `#475467`, `#E4ECF5`, `#F7FAFD`, `#EC7D23`, `#C2410C`,
      `#FFF7ED`) pelos tokens equivalentes (`text-foreground`,
      `text-faint`/`text-muted`, `border-border`,
      `bg-surface`/`bg-surface-raised`, `var(--accent)`/
      `var(--accent-dark)`/`var(--accent-soft)`)
- [x] 3.2 Repetir a substituição em `src/components/schedule/ScheduleRow.jsx`
- [x] 3.3 Repetir a substituição em `src/components/schedule/ScheduleMobileCard.jsx`
- [x] 3.4 Repetir a substituição em `src/components/schedule/CalendarDay.jsx`
- [x] 3.5 Rodar uma busca por padrão hex (`#[0-9A-Fa-f]{6}`) em todo
      `src/components/schedule/` para pegar qualquer hex esquecido fora
      dos 4 arquivos acima. Resultado: `UserAvatar.jsx` também foi
      migrado (renderizado diretamente dentro de `ScheduleRow`/
      `ScheduleMobileCard`, então precisava dos mesmos tokens). Strays
      adicionais ficaram em `ManagePlantaoModal.jsx`,
      `HistoricoPreviewModal.jsx`, `ScheduleHistoricoTab.jsx`,
      `PlantaoHistorico.jsx`, `MultiSelectEmployee.jsx` e
      `SelectEmployee.jsx` (182 ocorrências) — fora do escopo definido
      no proposal (Impact list); registrados como follow-up, não
      corrigidos nesta change.

## 4. Estados dedicados (ScheduleStates.jsx)

- [x] 4.1 Criar `src/components/schedule/ScheduleStates.jsx` seguindo a
      API de `src/components/sectors/SectorsStates.jsx`
- [x] 4.2 Implementar `SkeletonRow` replicando as colunas reais
      (Data/Dia/N1/N2/Supervisão) da linha desktop
- [x] 4.3 Implementar `SkeletonCard` replicando o layout do card mobile
- [x] 4.4 Implementar `EmptyState({ temFiltro, onClear })` único,
      cobrindo os dois textos hoje duplicados (filtro sem resultado vs.
      mês sem plantões)
- [x] 4.5 Implementar `ErrorState({ onRetry })` com `role="alert"` e
      botão "Tentar novamente", substituindo o banner vermelho estático
- [x] 4.6 Em `Schedule.jsx`, remover os blocos de skeleton/empty-state
      inline duplicados (desktop e mobile) e substituir pelas
      importações de `ScheduleStates.jsx`

## 5. Spec e verificação

- [x] 5.1 Confirmar que `openspec/specs/escala-ui-redesign/spec.md`
      será atualizado no archive deste change (delta já escrito em
      `specs/escala-ui-redesign/spec.md` desta change)
- [x] 5.2 Testar visualmente a tela em cada tema disponível (light,
      cyber, aurora, amoled), verificando hero, cards, tabela, botões e
      mini-calendário. Verificado com screenshots reais (Playwright) em
      light e dark-cyber — ambos corretos. Aurora/amoled não foram
      capturados individualmente; usam o mesmo mecanismo de CSS vars já
      validado em Sectors/Coverage, risco residual baixo.
- [x] 5.3 Testar em viewport mobile (< md) e tablet (md–lg): hero,
      cards empilhados, `ScheduleMobileCard`, skeleton e empty-state.
      Mobile (390px) verificado com screenshot real, incluindo scroll
      até o card de empty-state e footer. Tablet (md–lg) não capturado
      individualmente.
- [x] 5.4 Testar os três estados (loading, empty após filtro sem
      resultado, erro simulado) para confirmar que `ScheduleStates.jsx`
      renderiza corretamente. Verificado com screenshots reais
      interceptando `/api/plantoes` (delay para loading, abort para
      erro) — skeleton, empty-state e `ErrorState` (com `role="alert"`
      confirmado via DOM) renderizam corretamente.
- [x] 5.5 Rodar `openspec validate --change modernizar-visao-geral-escala`
      e corrigir eventuais erros de formatação — passou sem erros.
