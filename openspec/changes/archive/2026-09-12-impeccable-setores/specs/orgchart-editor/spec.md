## ADDED Requirements

### Requirement: Semântica de diálogo
`OrgChartEditor` SHALL expor `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para seu título, gerenciar foco de entrada (primeiro controle focável ao abrir) e retorno (ao gatilho, ao fechar), fechar com Escape e com clique fora do painel, e reter o foco dentro de si via Tab/Shift+Tab.

#### Scenario: Abrir move o foco para dentro do diálogo
- **WHEN** o admin aciona "Editar" no organograma
- **THEN** o foco move para o primeiro controle focável do editor (o botão de fechar)

#### Scenario: Escape fecha e devolve o foco
- **WHEN** o editor está aberto e o usuário pressiona Escape
- **THEN** o editor fecha e o foco retorna ao botão "Editar" que o abriu

#### Scenario: Tab não escapa do diálogo
- **WHEN** o foco está no último controle focável do editor e o usuário pressiona Tab
- **THEN** o foco volta para o primeiro controle focável do editor, sem sair para a página por trás

### Requirement: Contraste de texto sobre fundo de marca
Os botões primários do editor (fundo `C.accent`) SHALL usar `C.onAccent` como cor de texto, nunca uma cor fixa como branco.

#### Scenario: Botão "Salvar alterações" legível nos cinco temas
- **WHEN** o botão "Salvar alterações" é renderizado em qualquer tema
- **THEN** seu contraste de texto contra o fundo é de no mínimo 4,5:1

### Requirement: Alvos de toque mínimos
O botão de fechar e os botões do rodapé e da aba JSON SHALL ter no mínimo 44px de altura efetiva.

#### Scenario: Botão de fechar com alvo de 44px
- **WHEN** o botão de fechar (✕) é renderizado
- **THEN** sua área clicável mede no mínimo 44×44px
