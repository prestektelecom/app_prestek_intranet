## MODIFIED Requirements

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
