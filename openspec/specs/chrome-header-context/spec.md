# chrome-header-context Specification

## Purpose
Header do portal como contexto da view atual: título vindo da fonte única de navegação, slot de ações da página, busca apenas onde funciona (Serviços) e, no mobile, avatar que abre o sheet de perfil com tema e saída.

## Requirements

### Requirement: Header informa a view atual
O header SHALL exibir o título do que foi renderizado, a partir da fonte única de navegação, e um slot para ações da página, além do sino. Quando a view pedida existe mas o papel do usuário não permite, o título SHALL ser "Acesso restrito"; quando a view não existe, "Página não encontrada". No desktop SHALL ter altura de 64px definida por token. O título da aba do navegador SHALL acompanhar o título do header, no formato "<título> · Prestek Intranet".

#### Scenario: Navegar para Plantão
- **WHEN** `currentView` muda para `schedule`
- **THEN** o header mostra "Plantão" como título e a aba diz "Plantão · Prestek Intranet"

#### Scenario: Página sem ações
- **WHEN** a página não registra ações no slot
- **THEN** o slot não ocupa espaço nem deixa lacuna visível

#### Scenario: Sem permissão
- **WHEN** um usuário sem papel de admin tem `currentView` igual a `admin`
- **THEN** o header mostra "Acesso restrito", não "Painel Admin"

#### Scenario: View inexistente
- **WHEN** `currentView` não corresponde a nenhuma view conhecida
- **THEN** o header mostra "Página não encontrada"

### Requirement: Busca só onde funciona
O campo de busca do chrome SHALL ser exibido apenas quando `currentView === 'services'`, com placeholder que descreve o que ele filtra, e o atalho SHALL ser exibido como "Ctrl+K" com um único listener global.

#### Scenario: Fora de Serviços
- **WHEN** o usuário está no Dashboard
- **THEN** nenhum campo de busca é exibido no chrome

#### Scenario: Em Serviços
- **WHEN** o usuário está em Serviços e pressiona Ctrl+K
- **THEN** o foco vai para o campo de busca da Sidebar (desktop) e o placeholder diz "Buscar planos por nome, valor ou ID"

### Requirement: Header mobile com identidade e saída
Abaixo de `lg`, o header SHALL exibir o avatar do usuário como botão que abre um sheet de perfil com nome, setor, alternância de tema (incluindo variantes) e "Sair da conta".

#### Scenario: Sair pelo celular
- **WHEN** o usuário toca no avatar do header e depois em "Sair da conta"
- **THEN** a sessão é encerrada e a tela de login aparece, igual ao fluxo da Sidebar
