## ADDED Requirements

### Requirement: Navegacao do carousel via tabs com rotulo

O componente de ranking SHALL exibir 3 botoes de tab com icone e rotulo textual acima do container do carousel, permitindo ao usuario selecionar qual slide (Top Planos, Top Colaboradoras, Ticket Medio) quer visualizar diretamente.

#### Scenario: Selecionar slide via tab

- **WHEN** o usuario clica em uma das 3 tabs de navegacao (ex: "Colaboradoras")
- **THEN** o carousel transiciona imediatamente para o slide correspondente e a tab clicada recebe o estilo de estado ativo (gradiente azul)

#### Scenario: Estado ativo reflete slide do auto-play

- **WHEN** o carousel avanca automaticamente para o proximo slide (auto-play de 3s)
- **THEN** a tab correspondente ao slide atual fica marcada como ativa automaticamente

#### Scenario: Area de toque minima em mobile

- **WHEN** o usuario acessa a tela em dispositivo mobile (viewport < 768px)
- **THEN** cada tab SHALL ter area de toque minima de 44x44px

### Requirement: Header de secao Rankings do Mes

O carousel de rankings SHALL ser precedido por um header de secao com o titulo "Rankings do Mes" e um subtitulo contextual, separando visualmente o ranking dos cards de planos acima.

#### Scenario: Header visivel em todos os filtros de planos

- **WHEN** o filtro ativo for qualquer um dos modos de plano (All, PF, PJ, Link)
- **THEN** o header "Rankings do Mes" e as tabs SHALL ser exibidos acima do carousel

### Requirement: Remocao do efeito confetti

O sistema SHALL NOT disparar nenhum efeito de confetti durante a navegacao do carousel, seja por auto-play ou por clique do usuario.

#### Scenario: Trocar de slide sem confetti

- **WHEN** o carousel avanca para qualquer slide (automaticamente ou por clique nas tabs)
- **THEN** nenhum efeito visual de confetti SHALL ser renderizado na tela

#### Scenario: Sem carga de script CDN externo

- **WHEN** o componente ServicesDirectory e montado
- **THEN** nenhuma requisicao SHALL ser feita ao CDN do canvas-confetti
