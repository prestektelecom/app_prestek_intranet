## Context

`Schedule.jsx` (893 linhas) implementa sua própria hero em inline styles e
usa cores hex fixas em toda a árvore de componentes (`ScheduleRow.jsx`,
`ScheduleMobileCard.jsx`, `CalendarDay.jsx`). O resto do sistema já
convergiu para dois primitivos compartilhados que este change vai adotar:

- `fundoHero(C)` / `gradienteHero(C)` / `aneisHero()` em
  `src/components/ui/heroGradiente.js` — recebem o objeto de tema `C` de
  `useBentoTheme()` e retornam a string de `background` a aplicar via
  `style={{ background: fundoHero(C) }}` no container da hero (ver uso em
  `SectorsHero.jsx`, `CoverageHero.jsx`). Não é uma classe CSS, é uma
  função que gera o gradiente calibrado (parada do meio fixa em
  `#C2410C`, 5,18:1 de contraste contra texto branco).
- `SkeletonRow` / `SkeletonCard` / `ErrorState` / `EmptyState` em
  `src/components/sectors/SectorsStates.jsx` — cada um usa tokens
  semânticos (`bg-surface`, `border-border`, `text-foreground`,
  `text-muted`, `var(--accent)`) e replica a estrutura do elemento real
  (não um retângulo genérico).

## Goals / Non-Goals

**Goals:**
- Hero de `Schedule.jsx` usando `fundoHero(C)` em vez do gradiente inline
  duplicado.
- Container/spacing da página em `max-w-[1200px] px-4 md:px-10 py-8
  gap-8`, igual às telas de referência.
- Todas as cores hex fixas hoje em `Schedule.jsx`, `ScheduleRow.jsx`,
  `ScheduleMobileCard.jsx` e `CalendarDay.jsx` substituídas por tokens
  semânticos equivalentes (mapeamento 1:1, sem mudar a hierarquia visual).
- `ScheduleStates.jsx` novo, com `SkeletonRow`/`SkeletonCard` que
  replicam as colunas reais (Data/Dia/N1/N2/Supervisão), `EmptyState`
  único parametrizado, e `ErrorState` com `role="alert"` + retry.
- Atualizar `openspec/specs/escala-ui-redesign/spec.md` para remover a
  paleta fixa "Bento Blue" e documentar o padrão vigente.

**Non-Goals:**
- Não muda a estrutura de informação da tela (tabela continua sendo a
  visão principal; calendário continua como filtro lateral). A ideia de
  "calendário-primeiro" fica registrada como não-objetivo no proposal.
- Não altera `useScheduleData.js`, `/api/plantoes`, ou qualquer contrato
  de dados.
- Não altera `heroGradiente.js` nem `SectorsStates.jsx` — são consumidos
  como estão, sem modificação dos primitivos compartilhados.

## Decisions

**1. Reusar `fundoHero(C)` em vez de extrair uma terceira variante.**
`Schedule.jsx` tem uma hero com decoração diferente (badge de mês, 3 KPI
pills em vez de 2-4 genéricas), mas o *fundo* gradiente deve ser
idêntico ao das outras telas — é o mesmo elemento de marca. Manter a
composição (badge, título, botões, KPIs) específica de `ScheduleHero`,
só trocando `background: <gradiente inline>` por
`background: fundoHero(C)` e os orbs blur por `aneisHero()`/reticula de
pontos como em `SectorsHero.jsx`.

**2. Migração de cores é mecânica, não redesign.**
Cada hex hoje tem um token semântico equivalente já em uso nas telas de
referência (`#0B1B2E`→`text-foreground`, `#475467`→`text-muted`,
`#E4ECF5`→`border-border`, `#F7FAFD`/`#FFF7ED`→`bg-surface`/
`bg-surface-raised`, `#EC7D23`/`#C2410C`→`var(--accent)` /
`from-[#9A3412] to-[#EC7D23]` no padrão de botão gradiente). Isso reduz
risco de regressão visual — a hierarquia de cor/contraste não muda, só a
fonte da cor passa a ser o tema ativo.

**3. `ScheduleStates.jsx` segue a API de `SectorsStates.jsx`, não a
reinventa.** Mesma assinatura de componentes (`SkeletonRow`,
`SkeletonCard`, `ErrorState({ onRetry })`, `EmptyState({ temFiltro,
onClear })`), adaptando apenas o conteúdo interno (colunas de plantão em
vez de campos de setor) e o texto/ícone (`event_busy` para escala vazia,
mantendo o padrão de ícone contextual já usado).

**4. Atualizar o spec existente em vez de criar um novo.**
`escala-ui-redesign` já é o nome de capability correto para esta tela;
criar um segundo spec (`schedule-visual-modernization` ou similar)
duplicaria a definição de fonte de verdade. O delta substitui os
requisitos de paleta fixa por requisitos de token semântico + hero
compartilhada, e adiciona requisitos de estados dedicados que não
existiam.

## Risks / Trade-offs

- **[Risco] Migração de cor manual, arquivo por arquivo, pode deixar
  algum hex esquecido (ex.: dentro de `ManagePlantaoModal.jsx`, que não
  foi escopado explicitamente).** → Mitigação: tasks.md inclui um passo
  de busca (`grep` por padrão hex `#[0-9A-Fa-f]{6}`) nos arquivos do
  diretório `src/components/schedule/` como verificação final, não só
  nos 4 arquivos já identificados.
- **[Risco] Trocar a hero pode alterar sutilmente o espaço ocupado pelos
  3 KPI pills específicos da Escala (Plantões/Dias Cobertos/Alterações),
  já que as heroes de referência usam grid de KPIs diferente.** →
  Mitigação: preservar a estrutura de KPIs existente do
  `ScheduleHero`, trocando apenas o `background` e os elementos
  decorativos (orbs → anéis), não o grid de conteúdo.
- **[Trade-off] Não paralelizar com o repensar do calendário-primeiro.**
  Fazer só o revestimento visual agora é mais rápido e de menor risco,
  mas significa que, se a decisão de calendário-primeiro avançar depois,
  parte deste trabalho (grid/layout da coluna direita) pode precisar ser
  refeita. Aceito conscientemente — validar a mudança de hierarquia de
  informação primeiro exigiria feedback de uso que ainda não existe.

## Migration Plan

Sem migração de dados ou infraestrutura — é um change de frontend
isolado a componentes React existentes. Deploy segue o fluxo normal
(merge → build → deploy do frontend). Rollback trivial: reverter o
commit, já que não há mudança de schema/API.
