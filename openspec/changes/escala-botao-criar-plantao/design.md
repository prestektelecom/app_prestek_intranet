## Context

A Visão Geral da Escala ([`Schedule.jsx`](file:///c:/Users/Prestek%20Telecom/Documents/prestek_intranet/src/components/Schedule.jsx)) já possui toda a infraestrutura de gestão de plantão: `ManagePlantaoModal`, `openManagement(dateStr)`, e a lógica de criação/edição via `executarSalvamento()`. O único ponto de entrada atual é o mini calendário lateral, que chama `openManagement(dateStr)` com uma data fixa. Há também o `ScheduleRow` / `ScheduleMobileCard` que chama `openManagement` via botão de edição nas linhas da tabela.

O `ManagePlantaoModal` recebe `selectedDate` como prop vinda de `Schedule.jsx`, e o `executarSalvamento` usa esse valor diretamente no payload. Portanto, para suportar seleção de data no modal, é necessário que o modal possa comunicar de volta a data escolhida para o pai, ou que o estado `selectedDate` seja elevado para aceitar atualização durante o fluxo de criação.

## Goals / Non-Goals

**Goals:**
- Exibir botão "Novo Plantão" no Hero Banner (somente `is_admin`)
- Ao clicar, abrir `ManagePlantaoModal` sem data pré-selecionada
- Adicionar campo de seleção de data dentro do modal quando `selectedDate` é `null`
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

**Alternativa descartada**: Gerenciar `selectedDate` internamente no modal. Descartado porque o pai já usa `selectedDate` para exibição e para o `fetchHistorico`, o que causaria duplicação de estado.

### 2. Campo de data como `<input type="date">` nativo

**Decisão**: Usar `<input type="date">` nativo estilizado com as classes do design system Bento Blue existente. Não adicionar uma dependência de date picker externo para uma mudança de escopo tão pequena.

**Alternativa descartada**: Reutilizar o mini calendário como picker interno no modal. Desnecessariamente complexo para o escopo atual.

### 3. Botão "Novo Plantão" no `ScheduleHero` via nova prop `onNewPlantao`

**Decisão**: Adicionar prop `onNewPlantao` ao componente `ScheduleHero`. O botão é renderizado condicionalmente somente quando `user?.is_admin && onNewPlantao` — padrão já usado para `onHistory` e `onAudit` no mesmo componente.

### 4. Tooltip via atributo `title` nativo no `CalendarDay`

**Decisão**: Adicionar `title="Gerenciar plantão"` ao elemento clicável do `CalendarDay` quando `isAdmin` é `true`. Solução de zero dependência, acessível e consistente com o que já existe.

## Risks / Trade-offs

- **Risco**: Admin abre modal via "Novo Plantão" e tenta salvar sem selecionar data → Mitigação: validação no `handleSubmit` do modal exige que `selectedDate` não seja nulo antes de chamar `onSave()`.
- **Risco**: Estado de `selectedDate` pode ficar `null` entre fechamentos se não for limpo → Mitigação: `closeManagement()` já faz `setExistingPlantao(null)`; adicionar `setSelectedDate(null)` ao mesmo bloco garante limpeza.
- **Trade-off**: `input type="date"` tem aparência variável entre browsers. Aceitável pois é uma funcionalidade administrativa (não crítica para UX de usuário final) e evita dependências extras.

## Migration Plan

Não há migração de dados. As mudanças são exclusivamente no frontend. Nenhum endpoint novo é criado. Rollback é simplesmente reverter os arquivos modificados.
