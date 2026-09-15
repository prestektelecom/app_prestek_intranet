## ADDED Requirements

### Requirement: Controles de escolha binária têm nome acessível
Todo controle de escolha Sim/Não do formulário SHALL expor um nome acessível derivado do rótulo do campo, e SHALL indicar programaticamente quando é de preenchimento obrigatório.

#### Scenario: Leitor de tela anuncia o rótulo do controle
- **WHEN** um leitor de tela move o foco para um controle de escolha Sim/Não
- **THEN** o leitor de tela SHALL anunciar o rótulo do campo ao qual o controle pertence, não apenas o texto "Sim" ou "Não"

#### Scenario: Obrigatoriedade é exposta programaticamente
- **WHEN** um campo do formulário é obrigatório
- **THEN** o controle correspondente SHALL expor essa obrigatoriedade a tecnologia assistiva, e não apenas por um indicador visual

### Requirement: Erros de campo são associados programaticamente e distintos de dicas
Toda mensagem de erro de validação SHALL ser associada ao campo correspondente por atributo de descrição, e SHALL ser visualmente distinta de uma dica neutra.

#### Scenario: Leitor de tela anuncia o erro ao focar o campo
- **WHEN** um campo com erro de validação visível recebe foco
- **THEN** tecnologia assistiva SHALL anunciar a mensagem de erro associada a esse campo

#### Scenario: Erro não se confunde com dica
- **WHEN** um campo exibe uma mensagem de erro de validação
- **THEN** essa mensagem SHALL usar um estilo visualmente distinto do texto de dica neutra do mesmo formulário

### Requirement: Resultados de ações assíncronas são anunciados
O resultado de uma simulação de cadastro, seja sucesso ou falha, SHALL ser anunciado a tecnologia assistiva sem exigir que o usuário mova o foco manualmente até ele.

#### Scenario: Toast de resultado é anunciado
- **WHEN** a simulação de cadastro conclui e o toast de resultado aparece
- **THEN** tecnologia assistiva SHALL anunciar a mensagem do toast automaticamente

#### Scenario: Card de resultado do dry-run é anunciado
- **WHEN** o card de resultado do dry-run aparece ou muda de conteúdo
- **THEN** tecnologia assistiva SHALL anunciar a mudança automaticamente

### Requirement: Texto real e controles interativos passam contraste em todo tema
Todo texto real do formulário — rótulos, dicas, mensagens de erro, o indicador de ferramenta selecionada e o texto do botão primário — SHALL manter contraste de ao menos 4,5:1 contra seu fundo em todos os temas suportados, incluindo qualquer ponto de um fundo em gradiente.

#### Scenario: Rótulos e dicas legíveis no tema claro
- **WHEN** o tema claro está ativo
- **THEN** todo rótulo de campo, subtítulo de seção e texto de dica SHALL ter contraste de ao menos 4,5:1 contra seu fundo

#### Scenario: Texto sobre gradiente permanece legível em toda a extensão
- **WHEN** um botão ou indicador usa um fundo em gradiente
- **THEN** o texto sobreposto SHALL manter ao menos 4,5:1 de contraste em qualquer ponto do gradiente, não apenas em uma das extremidades

### Requirement: Alvos de toque do formulário atingem o mínimo de 44px
Todo controle interativo do formulário — campos, botões, controles de escolha e o indicador de ferramenta — SHALL ter uma área de toque efetiva de ao menos 44×44px.

#### Scenario: Controles de formulário atingem o alvo mínimo
- **WHEN** qualquer campo, botão ou controle de escolha do formulário é medido
- **THEN** sua área de toque efetiva SHALL ser de ao menos 44×44px

### Requirement: Combobox de cidade é operável por teclado
O combobox de seleção de cidade SHALL ser completamente operável sem mouse, seguindo o padrão de combobox com foco virtual.

#### Scenario: Setas navegam entre resultados
- **WHEN** o combobox exibe resultados e o usuário pressiona a seta para baixo ou para cima
- **THEN** o destaque SHALL mover entre os resultados sem que o foco real saia do campo de texto

#### Scenario: Enter seleciona o resultado destacado
- **WHEN** um resultado está destacado e o usuário pressiona Enter
- **THEN** esse resultado SHALL ser selecionado, com o mesmo efeito de um clique

#### Scenario: Escape fecha sem perder o foco
- **WHEN** a lista de resultados está aberta e o usuário pressiona Escape
- **THEN** a lista SHALL fechar
- **THEN** o foco SHALL permanecer no campo de texto

#### Scenario: Destaque de teclado é visualmente distinguível
- **WHEN** um resultado está destacado por navegação de teclado
- **THEN** o destaque SHALL ter contraste de ao menos 3:1 contra o fundo da lista

### Requirement: Indicador de progresso reflete o estado real da ferramenta
O indicador de etapa exibido no cabeçalho SHALL refletir o estado real do formulário, e SHALL NOT anunciar uma etapa que a ferramenta não é capaz de alcançar.

#### Scenario: O indicador muda depois de uma simulação
- **WHEN** uma simulação é executada com sucesso
- **THEN** o indicador de etapa SHALL mudar de valor para refletir esse novo estado

#### Scenario: Nenhuma etapa inexistente é anunciada
- **WHEN** o indicador de etapa é exibido em qualquer momento
- **THEN** ele SHALL NOT fazer referência a uma etapa de gravação real, enquanto essa capacidade não existir

### Requirement: A ação de simular permanece alcançável sem rolagem extensa
Em larguras de tela abaixo do limiar de duas colunas, o controle de simulação SHALL permanecer alcançável sem exigir rolagem por múltiplas telas de conteúdo.

#### Scenario: Botão de simular visível durante a rolagem em telas estreitas
- **WHEN** a largura da tela está abaixo do limiar de duas colunas e o usuário rola o formulário
- **THEN** o controle de simulação SHALL permanecer visível ou acessível em poucos gestos, sem exigir rolar todas as seções do formulário primeiro
