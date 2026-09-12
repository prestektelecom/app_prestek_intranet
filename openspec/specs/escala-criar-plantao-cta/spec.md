# escala-criar-plantao-cta Specification

## Purpose

Permite que administradores criem um novo plantão diretamente pelo botão de ação primária no Hero da Visão Geral da Escala, sem precisar interagir com o mini calendário lateral.

## Requirements

### Requirement: Botão de ação primária para criar plantão

A página SHALL exibir um botão "Novo Plantão" no Hero Banner, visível somente para usuários com `is_admin = true`.

#### Scenario: Administrador acessa a Visão Geral da Escala

- **WHEN** um usuário com `is_admin = true` carrega a página da Escala
- **THEN** um botão com label "Novo Plantão" e ícone `add` é exibido na área de ações do Hero Banner

#### Scenario: Usuário sem permissão de admin acessa a página

- **WHEN** um usuário com `is_admin = false` (ou sem a propriedade) carrega a página
- **THEN** o botão "Novo Plantão" NÃO é exibido

### Requirement: Abertura do modal de criação com data padrão editável

Ao clicar em "Novo Plantão", o sistema SHALL abrir o `ManagePlantaoModal` em modo de criação com a data de hoje pré-selecionada e um campo de data editável para o administrador manter ou trocar.

#### Scenario: Admin clica em "Novo Plantão"

- **WHEN** o administrador clica no botão "Novo Plantão" no Hero
- **THEN** o `ManagePlantaoModal` é aberto
- **AND** a data de hoje é pré-selecionada no campo de data
- **AND** o campo permanece editável para o admin escolher outra data caso deseje

#### Scenario: Admin salva plantão mantendo a data padrão

- **WHEN** o admin abre o modal via "Novo Plantão", não altera o campo de data e clica em salvar
- **THEN** o sistema cria o plantão para a data de hoje
- **AND** o comportamento de salvamento é idêntico ao fluxo existente via calendário

#### Scenario: Admin salva plantão após trocar a data no modal

- **WHEN** o admin altera a data pré-selecionada no modal aberto via botão "Novo Plantão" e clica em salvar
- **THEN** o sistema cria o plantão para a nova data informada
- **AND** o comportamento de salvamento é idêntico ao fluxo existente via calendário

#### Scenario: Admin limpa a data e tenta salvar sem selecionar outra

- **WHEN** o admin limpa manualmente o campo de data pré-preenchido e tenta salvar
- **THEN** o sistema exibe a mensagem de erro "Selecione uma data para o plantão." e não cria o plantão

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
