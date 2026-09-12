## 1. Schedule.jsx — Botão "Novo Plantão" no Hero e estado `dateEditable`

- [x] 1.1 Em `Schedule.jsx`, adicionar prop `onNewPlantao` ao componente `ScheduleHero` e renderizá-la no bloco de ações do Hero, condicionalmente apenas quando `user?.is_admin && onNewPlantao` — verificar que o botão aparece visualmente no Hero com ícone `add` e label "Novo Plantão" seguindo o mesmo estilo dos botões existentes (glass button com borda rgba)
- [x] 1.2 Em `Schedule.jsx`, adicionar estado `const [dateEditable, setDateEditable] = useState(false)`. Criar a função `openNewPlantao()` que pré-seleciona a data de hoje, ativa `dateEditable`, limpa `existingPlantao`/`formData` e abre o modal — verificar que ao chamar a função o modal abre com a data de hoje pré-selecionada e editável. **Desvio do task original**: `setSelectedDate(toIsoDay(new Date()))` é um bug — `toIsoDay` lê campos UTC (pensada para strings "ingênuas" do IXC) enquanto `new Date()` é o instante atual; à noite no fuso de Brasília (UTC-3) isso adianta a data em 1 dia e diverge do "hoje" que `isHoje`/o calendário mostram (que usam hora local). Corrigido calculando a data local diretamente (`getFullYear`/`getMonth`/`getDate`), achado e verificado ao vivo no navegador antes de prosseguir
- [x] 1.3 Em `Schedule.jsx`, passar `onNewPlantao={user?.is_admin ? openNewPlantao : null}` ao `ScheduleHero` na JSX do `return` — verificar que o botão só aparece para admin
- [x] 1.4 Em `Schedule.jsx`, atualizar `openManagement(dateStr)` para incluir `setDateEditable(false)` (data fixa vinda do calendário/linha) e atualizar `closeManagement()` para incluir `setSelectedDate(null)` e `setDateEditable(false)` no bloco de limpeza de estado — verificar que após fechar o modal o estado fica limpo para abertura subsequente

## 2. ManagePlantaoModal.jsx — Campo de seleção de data e callback onDateChange

- [x] 2.1 Adicionar props `onDateChange` e `dateEditable` ao `ManagePlantaoModal`. Quando `dateEditable` for `true`, renderizar um `<input type="date">` estilizado (classes Bento Blue: `bg-surface-raised border border-transparent rounded-lg py-2.5 px-3 text-foreground`) com `value={selectedDate || ''}` no lugar do texto estático `Data: {selectedDate...}`; quando `dateEditable` for `false`, manter o texto estático como hoje — verificado ao vivo: campo editável aparece via "Novo Plantão" (hoje pré-preenchido corretamente após o fix do item 1.2) e o texto estático aparece via calendário/tabela
- [x] 2.2 No `handleSubmit` do `ManagePlantaoModal`, adicionar validação que verifica `selectedDate` antes de chamar `onSave()`: se `selectedDate` for nulo/vazio, exibir mensagem de erro "Selecione uma data para o plantão." em `setValidationError`
- [x] 2.3 Conectar o `onChange` do `<input type="date">` para chamar `onDateChange(e.target.value)` — atualiza `selectedDate` no pai (`Schedule.jsx`) e limpa o erro de validação

## 3. CalendarDay.jsx — Tooltip de interatividade para admin

- [x] 3.1 Em `CalendarDay.jsx`, adicionar `title={isAdmin ? 'Gerenciar plantão' : undefined}` no botão de cada dia

## 4. Verificação integrada

- [x] 4.1 Verificado ao vivo (Playwright) como admin: "Novo Plantão" → modal abre com hoje (11/09) pré-selecionado e editável → N1 selecionado (Vilker Silva Santos) → salvar → plantão criado para a data correta, aparece na tabela e no calendário ("tem plantão, hoje"), sem erro de console. Dado de teste removido em seguida (excluído pelo próprio fluxo do modal) para não deixar registro fictício
- [x] 4.2 Verificado ao vivo: abrir o plantão recém-criado pela linha da tabela mostra a data como texto estático (11/09/2026 · Sexta-feira, não editável) e os dados preenchidos (N1 com Vilker marcado, botão Excluir visível) — regressão do fluxo por calendário/tabela intacta
- [x] 4.3 Não verificado ao vivo (sem credencial de um usuário não-admin disponível nesta sessão). Coberto por revisão de código: o botão só renderiza com `user?.is_admin && onNewPlantao` truthy, `onNewPlantao` e a função interna de `openManagement` retornam cedo (`if (!user?.is_admin) return`) e o tooltip do calendário só é passado quando `isAdmin` é `true` — tripla checagem client-side, redundante com o controle server-side de admin já existente e independente desta feature
