## Why

A Visão Geral da Escala não possui um botão de ação primária explícito para criar novos plantões. A única forma de disparar a criação é clicar em um dia específico no mini calendário lateral — interação que não é óbvia para administradores novos e que faz com que usuários procurem em vão por um botão "Criar" ou "Novo Plantão" no topo da página. Isso aumenta o tempo de conclusão da tarefa e gera confusão desnecessária.

## What Changes

- Adição de um botão de ação primária **"+ Novo Plantão"** no Hero Banner da Visão Geral da Escala, visível somente para administradores (`user.is_admin`).
- O botão abre o `ManagePlantaoModal` em modo de criação, com a data de hoje pré-selecionada e editável — o admin pode manter ou trocar a data dentro do próprio modal.
- O modal `ManagePlantaoModal` recebe suporte para campo de seleção de data editável quando aberto via o botão "Novo Plantão" (em vez de fixa, como no fluxo de abertura via calendário).
- Adição de tooltip/dica visual no mini calendário indicando que os dias são clicáveis ("Clique para gerenciar plantão").
- O botão é renderizado com o estilo de ação primária já existente (gradiente azul Prestek), consistente com o resto do sistema.

## Capabilities

### New Capabilities

- `escala-criar-plantao-cta`: Botão de ação primária no Hero para criação de novo plantão com data padrão editável (hoje), disponível apenas para administradores.

### Modified Capabilities

- `escala-ui-redesign`: O `ManagePlantaoModal` passa a suportar um campo de data editável (em vez de fixa) quando aberto via o botão "Novo Plantão", complementando o fluxo já existente de abertura via calendário.

## Impact

- **`src/components/Schedule.jsx`**: Adição do botão "Novo Plantão" no `ScheduleHero`; nova função `openNewPlantao()` que pré-seleciona a data de hoje e ativa um novo estado `dateEditable` (independente de `selectedDate`, que passa a ter sempre um valor).
- **`src/components/schedule/ManagePlantaoModal.jsx`**: Adição de um campo seletor de data, exibido quando a prop `dateEditable` é `true`.
- **`src/components/schedule/CalendarDay.jsx`**: Adição de tooltip de acessibilidade indicando interatividade.
- Nenhuma alteração de API ou banco de dados — o payload já usa a data selecionada.
