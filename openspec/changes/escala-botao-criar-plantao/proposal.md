## Why

A Visão Geral da Escala não possui um botão de ação primária explícito para criar novos plantões. A única forma de disparar a criação é clicar em um dia específico no mini calendário lateral — interação que não é óbvia para administradores novos e que faz com que usuários procurem em vão por um botão "Criar" ou "Novo Plantão" no topo da página. Isso aumenta o tempo de conclusão da tarefa e gera confusão desnecessária.

## What Changes

- Adição de um botão de ação primária **"+ Novo Plantão"** no Hero Banner da Visão Geral da Escala, visível somente para administradores (`user.is_admin`).
- O botão abre o `ManagePlantaoModal` em modo de criação, sem uma data pré-selecionada — permitindo que o admin escolha a data dentro do próprio modal.
- O modal `ManagePlantaoModal` recebe suporte para campo de seleção de data quando nenhuma data é pré-passada via calendário.
- Adição de tooltip/dica visual no mini calendário indicando que os dias são clicáveis ("Clique para gerenciar plantão").
- O botão é renderizado com o estilo de ação primária já existente (gradiente azul Prestek), consistente com o resto do sistema.

## Capabilities

### New Capabilities

- `escala-criar-plantao-cta`: Botão de ação primária no Hero para criação de novo plantão sem data pré-selecionada, disponível apenas para administradores.

### Modified Capabilities

- `escala-ui-redesign`: O `ManagePlantaoModal` passa a suportar abertura sem data pré-selecionada (campo de date picker interno), complementando o fluxo já existente de abertura via calendário.

## Impact

- **`src/components/Schedule.jsx`**: Adição do botão "Novo Plantão" no `ScheduleHero`; `openManagement` passa a aceitar `null` como data inicial.
- **`src/components/schedule/ManagePlantaoModal.jsx`**: Adição de um campo seletor de data quando `selectedDate` é `null`.
- **`src/components/schedule/CalendarDay.jsx`**: Adição de tooltip de acessibilidade indicando interatividade.
- Nenhuma alteração de API ou banco de dados — o payload já usa a data selecionada.
