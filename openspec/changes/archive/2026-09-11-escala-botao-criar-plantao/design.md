## Context

A Visão Geral da Escala ([`Schedule.jsx`](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/Schedule.jsx)) já possui toda a infraestrutura de gestão de plantão: `ManagePlantaoModal`, `openManagement(dateStr)`, e a lógica de criação/edição via `executarSalvamento()`. O único ponto de entrada atual é o mini calendário lateral, que chama `openManagement(dateStr)` com uma data fixa. Há também o `ScheduleRow` / `ScheduleMobileCard` que chama `openManagement` via botão de edição nas linhas da tabela.

O `ManagePlantaoModal` recebe `selectedDate` como prop vinda de `Schedule.jsx`, e o `executarSalvamento` usa esse valor diretamente no payload. Portanto, para suportar seleção de data no modal, é necessário que o modal possa comunicar de volta a data escolhida para o pai, ou que o estado `selectedDate` seja elevado para aceitar atualização durante o fluxo de criação.

## Goals / Non-Goals

**Goals:**
- Exibir botão "Novo Plantão" no Hero Banner (somente `is_admin`)
- Ao clicar, abrir `ManagePlantaoModal` com a data de hoje pré-selecionada e editável
- Adicionar campo de seleção de data dentro do modal quando a prop `dateEditable` é `true`
- Adicionar tooltip `title="Gerenciar plantão"` ao `CalendarDay` quando `isAdmin`
- Manter todo o comportamento de salvamento, validação e exclusão existente

**Non-Goals:**
- Redesign do `ManagePlantaoModal`
- Alteração de endpoints de API
- Criação de nova rota ou view
- Suporte a criação em lote (múltiplas datas)

## Decisions

### 1. Seleção de data elevada para o estado do pai (`Schedule.jsx`)

**Decisão**: O campo de seleção de data ficará dentro do `ManagePlantaoModal`, mas a data selecionada será comunicada ao pai via callback `onDateChange(date)`, que atualiza `selectedDate` em `Schedule.jsx`. O payload de salvamento (`executarSalvamento`) já lê `selectedDate` do estado do pai — sem mudança na lógica de salvamento.

**Confirmado por leitura do código**: `ManagePlantaoModal.handleSubmit` chama `onSave()` sem argumentos; `executarSalvamento` em `Schedule.jsx` lê `selectedDate` do próprio estado por closure. Se a data ficasse só local no modal, o salvamento usaria a data antiga/nula silenciosamente — elevar o estado é uma correção funcional, não só de estilo.

**Alternativa descartada**: Gerenciar `selectedDate` internamente no modal. Descartado porque o pai já usa `selectedDate` para exibição e para o `fetchHistorico`, o que causaria duplicação de estado.

### 1.1. Sinalização de campo editável via estado `dateEditable`, independente de `selectedDate`

**Contexto**: a Decisão 3 (abaixo) pré-seleciona a data de hoje ao abrir via "Novo Plantão", então `selectedDate` deixa de ser `null` nesse fluxo. Usar `selectedDate === null` para decidir se o campo é exibido como `<input>` editável ou como texto estático quebraria — o campo editável desapareceria assim que uma data (mesmo a padrão) fosse atribuída.

**Decisão**: Introduzir um novo estado booleano `dateEditable` em `Schedule.jsx`, independente do valor de `selectedDate`:
- `openManagement(dateStr)` (clique no calendário/linha, data fixa): `setDateEditable(false)`.
- `openNewPlantao()` (botão Hero, data editável): `setDateEditable(true)`.
- `closeManagement()`: reseta `setDateEditable(false)` junto com `setSelectedDate(null)`.

`ManagePlantaoModal` recebe a prop `dateEditable` e a usa para decidir entre renderizar o `<input type="date">` (quando `true`) ou o texto estático `Data: {selectedDate...}` (quando `false`) — nunca com base em `selectedDate` ser nulo.

### 2. Campo de data como `<input type="date">` nativo

**Decisão**: Usar `<input type="date">` nativo estilizado com as classes do design system Bento Blue existente. Não adicionar uma dependência de date picker externo para uma mudança de escopo tão pequena.

**Alternativa descartada**: Reutilizar o mini calendário como picker interno no modal. Confirmado pelo código que a grade do mini calendário (cálculo de `daysInMonth`/`firstDayOfMonth`, renderização) vive embutida em `Schedule.jsx`, fortemente acoplada ao estado de filtro da página (`filterMonth`/`filterYear`) e a `openManagement` — não é um componente reutilizável hoje, exigiria extração não-trivial. Descartado por complexidade desproporcional ao escopo.

**Nota de consistência**: já existe o padrão `<input type="date">` em `PlantaoHistorico.jsx` (filtro de data início/fim), mas estilizado com cores hex fixas (`bg-[#F7FAFD]`, `border-[#EC7D23]`) — convenção anterior ao redesign "Bento Blue". O novo campo deste change usa as classes com tokens de tema (`bg-surface-raised`, `text-foreground`) por ser parte da página já redesenhada, e não deve copiar o padrão hex antigo.

### 3. Data padrão ao abrir via "Novo Plantão": hoje, editável

**Decisão**: `openNewPlantao()` pré-seleciona a data de hoje via `toIsoDay(new Date())` — mesma utility já usada em `Schedule.jsx` (importada de `utils/dateHelpers`) — em vez de deixar o campo vazio. O campo permanece editável (ver Decisão 1.1); o admin pode manter a data padrão ou trocá-la antes de salvar.

**Alternativa descartada**: Campo vazio, forçando escolha manual sempre. Descartada por adicionar fricção no caso mais comum (criar plantão para hoje ou em breve) sem ganho proporcional — o campo continua visível e editável, então o risco de "criar no dia errado sem perceber" é mitigado pela própria visibilidade do input.

### 4. Botão "Novo Plantão" no `ScheduleHero` via nova prop `onNewPlantao`

**Decisão**: Adicionar prop `onNewPlantao` ao componente `ScheduleHero`. O botão é renderizado condicionalmente somente quando `user?.is_admin && onNewPlantao` — padrão já usado para `onHistory` e `onAudit` no mesmo componente.

### 5. Tooltip via atributo `title` nativo no `CalendarDay`

**Decisão**: Adicionar `title="Gerenciar plantão"` ao elemento clicável do `CalendarDay` quando `isAdmin` é `true`. Solução de zero dependência, acessível e consistente com o que já existe.

## Risks / Trade-offs

- **Risco**: Admin abre modal via "Novo Plantão", limpa manualmente o campo de data pré-preenchido e tenta salvar → Mitigação: validação no `handleSubmit` do modal exige que `selectedDate` não seja nulo/vazio antes de chamar `onSave()`. Deixa de ser o caso comum (a data já vem preenchida com hoje), mas continua como rede de segurança.
- **Risco**: Estado de `selectedDate`/`dateEditable` pode ficar inconsistente entre fechamentos se não for limpo → Mitigação: `closeManagement()` já faz `setExistingPlantao(null)`; adicionar `setSelectedDate(null)` e `setDateEditable(false)` ao mesmo bloco garante limpeza.
- **Trade-off**: `input type="date"` tem aparência variável entre browsers. Aceitável pois é uma funcionalidade administrativa (não crítica para UX de usuário final) e evita dependências extras.

## Migration Plan

Não há migração de dados. As mudanças são exclusivamente no frontend. Nenhum endpoint novo é criado. Rollback é simplesmente reverter os arquivos modificados.
