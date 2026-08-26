## 1. Schedule.jsx — Botão "Novo Plantão" no Hero e suporte a data nula

- [ ] 1.1 Em `Schedule.jsx`, adicionar prop `onNewPlantao` ao componente `ScheduleHero` e renderizá-la no bloco de ações do Hero, condicionalmente apenas quando `user?.is_admin && onNewPlantao` — verificar que o botão aparece visualmente no Hero com ícone `add` e label "Novo Plantão" seguindo o mesmo estilo dos botões existentes (glass button com borda rgba)
- [ ] 1.2 Em `Schedule.jsx`, criar a função `openNewPlantao()` que chama `setSelectedDate(null)`, `setExistingPlantao(null)`, `setFormData({ n1_ids: [], n2_ids: [], gerente_ids: [] })` e `setIsModalOpen(true)` — verificar que ao chamar a função o modal abre vazio sem data pré-selecionada
- [ ] 1.3 Em `Schedule.jsx`, passar `onNewPlantao={user?.is_admin ? openNewPlantao : null}` ao `ScheduleHero` na JSX do `return` — verificar que o botão só aparece para admin
- [ ] 1.4 Em `Schedule.jsx`, atualizar `closeManagement()` para incluir `setSelectedDate(null)` no bloco de limpeza de estado — verificar que após fechar o modal o estado fica limpo para abertura subsequente

## 2. ManagePlantaoModal.jsx — Campo de seleção de data e callback onDateChange

- [ ] 2.1 Adicionar prop `onDateChange` ao `ManagePlantaoModal` e renderizar um `<input type="date">` estilizado (classes Bento Blue: `bg-surface-raised border border-transparent rounded-lg py-2.5 px-3 text-foreground`) logo abaixo do cabeçalho do modal, exibido somente quando `selectedDate` é `null` ou vazio — verificar que o campo aparece ao abrir o modal via botão "Novo Plantão" e não aparece ao abrir via calendário
- [ ] 2.2 No `handleSubmit` do `ManagePlantaoModal`, adicionar validação que verifica `selectedDate` antes de chamar `onSave()`: se `selectedDate` for nulo/vazio, exibir mensagem de erro "Selecione uma data para o plantão." em `setValidationError` — verificar que o erro aparece ao tentar salvar sem data
- [ ] 2.3 Conectar o `onChange` do `<input type="date">` para chamar `onDateChange(e.target.value)` — verificar que selecionar uma data no campo atualiza `selectedDate` no pai (`Schedule.jsx`) e o campo de validação é limpo

## 3. CalendarDay.jsx — Tooltip de interatividade para admin

- [ ] 3.1 Em `CalendarDay.jsx`, adicionar `title={isAdmin ? 'Gerenciar plantão' : undefined}` no elemento clicável (botão ou div) que representa cada dia — verificar que ao passar o cursor sobre um dia com `isAdmin=true` o tooltip nativo do browser exibe "Gerenciar plantão", e que com `isAdmin=false` nenhum tooltip aparece

## 4. Verificação integrada

- [ ] 4.1 Verificar fluxo completo como admin: clicar em "Novo Plantão" → modal abre sem data → selecionar data → selecionar N1 → salvar → plantão é criado e aparece na tabela sem erro de console
- [ ] 4.2 Verificar fluxo via calendário (regressão): clicar em dia com plantão existente → modal abre com data e dados preenchidos → editar/salvar → plantão atualizado corretamente
- [ ] 4.3 Verificar visão de não-admin: botão "Novo Plantão" não é exibido, clique no calendário não abre modal, tooltip não aparece nos dias
