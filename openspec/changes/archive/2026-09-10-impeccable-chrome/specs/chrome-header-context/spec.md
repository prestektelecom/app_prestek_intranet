## ADDED Requirements

### Requirement: Header informa a view atual
O header SHALL exibir o título da view atual (a partir da fonte única de navegação) e um slot para ações da página, além do sino. No desktop SHALL ter altura de 64px definida por token.

#### Scenario: Navegar para Plantão
- **WHEN** `currentView` muda para `schedule`
- **THEN** o header mostra "Plantão" como título

#### Scenario: Página sem ações
- **WHEN** a página não registra ações no slot
- **THEN** o slot não ocupa espaço nem deixa lacuna visível

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
