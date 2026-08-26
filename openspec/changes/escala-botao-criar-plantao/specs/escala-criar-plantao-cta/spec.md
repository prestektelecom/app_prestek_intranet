## Purpose

Permite que administradores criem um novo plantão diretamente pelo botão de ação primária no Hero da Visão Geral da Escala, sem precisar interagir com o mini calendário lateral.

## ADDED Requirements

### Requirement: Botão de ação primária para criar plantão

A página SHALL exibir um botão "Novo Plantão" no Hero Banner, visível somente para usuários com `is_admin = true`.

#### Scenario: Administrador acessa a Visão Geral da Escala

- **WHEN** um usuário com `is_admin = true` carrega a página da Escala
- **THEN** um botão com label "Novo Plantão" e ícone `add` é exibido na área de ações do Hero Banner

#### Scenario: Usuário sem permissão de admin acessa a página

- **WHEN** um usuário com `is_admin = false` (ou sem a propriedade) carrega a página
- **THEN** o botão "Novo Plantão" NÃO é exibido

### Requirement: Abertura do modal de criação sem data pré-selecionada

Ao clicar em "Novo Plantão", o sistema SHALL abrir o `ManagePlantaoModal` em modo de criação com o campo de data vazio para seleção pelo administrador.

#### Scenario: Admin clica em "Novo Plantão"

- **WHEN** o administrador clica no botão "Novo Plantão" no Hero
- **THEN** o `ManagePlantaoModal` é aberto
- **AND** nenhuma data está pré-selecionada
- **AND** o modal exibe um campo de seleção de data habilitado para o admin escolher

#### Scenario: Admin salva plantão após selecionar data no modal

- **WHEN** o admin seleciona uma data no modal aberto via botão "Novo Plantão" e clica em salvar
- **THEN** o sistema cria o plantão para a data informada
- **AND** o comportamento de salvamento é idêntico ao fluxo existente via calendário

#### Scenario: Admin abre modal via botão e fecha sem salvar

- **WHEN** o admin abre o modal via "Novo Plantão" e fecha sem salvar
- **THEN** nenhum plantão é criado e o estado da página permanece inalterado

### Requirement: Indicação de interatividade no mini calendário

Os dias do mini calendário lateral SHALL exibir uma indicação visual de que são clicáveis quando o usuário é administrador.

#### Scenario: Administrador passa o cursor sobre um dia no mini calendário

- **WHEN** o usuário com `is_admin = true` passa o cursor sobre qualquer dia do mini calendário
- **THEN** o cursor muda para `pointer` e o dia exibe feedback visual de hover
- **AND** um `title` (tooltip nativo) com o texto "Gerenciar plantão" é exibido

#### Scenario: Usuário sem admin passa o cursor sobre um dia no mini calendário

- **WHEN** o usuário sem permissão admin passa o cursor sobre um dia
- **THEN** nenhum feedback interativo de clique é exibido e o cursor permanece padrão
