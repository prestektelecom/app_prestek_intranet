## ADDED Requirements

### Requirement: Cards de colaborador acessíveis por toque
O Diretório de colaboradores SHALL garantir que as ações em cada card sejam acessíveis em dispositivos touchscreen.

#### Scenario: Ações visíveis no mobile
- **WHEN** um card de colaborador é exibido em uma viewport touchscreen
- **THEN** as ações do card (ligar, enviar mensagem, perfil, etc.) ficam visíveis ou acessíveis por um botão de menu, sem depender de hover

#### Scenario: Grid de cards responsivo
- **WHEN** a lista de colaboradores é exibida
- **THEN** o grid adapta o número de colunas ao breakpoint: 1 coluna em mobile, 2 em tablet, 3 ou mais em desktop

#### Scenario: Hover como realce, não como gatilho único
- **WHEN** um card possui estado de hover
- **THEN** o hover pode realçar visualmente o card, mas não é a única forma de acessar as ações
