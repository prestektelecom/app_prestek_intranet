## ADDED Requirements

### Requirement: O mapa reflete o filtro e a busca ativos

O mapa de escritórios SHALL exibir apenas os marcadores correspondentes ao filtro de estado e ao termo de busca atualmente aplicados, mantendo lista e mapa sempre em concordância.

#### Scenario: Filtrar por estado atualiza o mapa
- **WHEN** o usuário seleciona o chip "AL" ou "SE"
- **THEN** o mapa exibe somente os marcadores dos escritórios daquele estado, e nenhum outro

#### Scenario: Buscar sem resultado esvazia o mapa
- **WHEN** o usuário digita um termo de busca que não corresponde a nenhum escritório
- **THEN** o mapa não exibe nenhum marcador, assim como a lista não exibe nenhum item

### Requirement: A tela de Escritórios se adapta a todos os temas

A lista de escritórios, sua legenda, os chips de filtro, o campo de busca, a moldura do mapa e os modais de criar/editar e excluir SHALL usar o sistema de tokens de tema (`useBentoTheme`), não cor fixa, de modo a permanecerem legíveis e visualmente coerentes em qualquer um dos cinco temas.

#### Scenario: Painel de lista legível em tema escuro
- **WHEN** um tema escuro (ex. AMOLED) está ativo
- **THEN** o painel da lista, sua legenda e os modais SHALL usar cores de superfície e texto do tema ativo, não permanecer com aparência de tema claro

#### Scenario: Badge "Matriz" com contraste adequado
- **WHEN** o badge "Matriz" é exibido em qualquer tema
- **THEN** seu texto tem contraste de no mínimo 4,5:1 contra o fundo do badge

### Requirement: Ações de editar/excluir são reveladas por foco e por toque, não só por hover

As ações de editar e excluir de cada item da lista SHALL ficar visíveis quando o controle recebe foco de teclado e em dispositivos sem suporte a `:hover`, além de ao passar o mouse.

#### Scenario: Foco por teclado revela a ação
- **WHEN** o usuário navega até o botão de editar ou excluir de um item via Tab
- **THEN** o botão fica visualmente visível, não apenas focado invisivelmente

#### Scenario: Dispositivo de toque revela a ação sem gesto de hover
- **WHEN** a tela é acessada num dispositivo que não suporta `:hover` (`(hover: none)`)
- **THEN** as ações de editar e excluir de cada item permanecem visíveis por padrão

### Requirement: Os modais de Escritórios têm semântica de diálogo completa

O modal de criar/editar escritório e o diálogo de confirmação de exclusão SHALL ter `role="dialog"`, `aria-modal="true"`, foco inicial dentro do diálogo, e Tab preso dentro do diálogo enquanto aberto — nunca alcançando um controle de outra linha da lista por trás.

#### Scenario: Tab não escapa para outra linha da lista
- **WHEN** o diálogo de confirmação de exclusão está aberto e o usuário pressiona Tab repetidamente
- **THEN** o foco permanece circulando entre os controles do próprio diálogo (Cancelar/Excluir), nunca alcançando o botão de editar/excluir de outro escritório

### Requirement: Campos do formulário de Escritório têm rótulo programático

Todo campo do formulário de criar/editar escritório SHALL ter seu `<label>` associado ao controle correspondente via `htmlFor`/`id`, ou `aria-label` quando não houver rótulo visível equivalente.

#### Scenario: Leitor de tela anuncia o campo corretamente
- **WHEN** um usuário de leitor de tela navega até um campo do formulário
- **THEN** o nome do campo é anunciado, não apenas o placeholder ou nenhum texto

### Requirement: Falha ao excluir um escritório usa feedback inline, não alerta nativo

O sistema SHALL NOT usar `alert()` ou qualquer diálogo nativo bloqueante do navegador para comunicar falhas; erros de exclusão SHALL aparecer como feedback inline na própria interface.

#### Scenario: Exclusão falha sem bloquear a interface
- **WHEN** a exclusão de um escritório falha no backend
- **THEN** o erro aparece como texto inline na tela, sem interromper a navegação com um diálogo nativo

### Requirement: Alvos de toque mínimos nos controles de filtro e busca

Os chips de filtro de estado e o campo de busca SHALL ter área de toque efetiva de no mínimo 44px de altura.

#### Scenario: Chip de filtro alcança o mínimo de toque
- **WHEN** um chip de filtro ("Todos"/"AL"/"SE") é renderizado
- **THEN** sua altura é de no mínimo 44px

### Requirement: Lista e mapa permanecem utilizáveis em viewport mobile

Em viewport mobile (< 768px), a área combinada de lista e mapa SHALL reservar altura suficiente para exibir ao menos 2 itens da lista e uma porção útil do mapa, sem depender de rolagem invisível ou de altura menor que 44px por painel.

#### Scenario: Lista visível em mobile
- **WHEN** a tela é exibida em viewport menor que 768px de largura
- **THEN** o painel da lista tem altura visível suficiente para pelo menos 2 itens completos antes de exigir rolagem
