## MODIFIED Requirements

### Requirement: Consistência visual com o restante do produto
A área de TI SHALL adotar o mesmo sistema visual das demais telas, de modo que não se leia como um produto separado.

O espaçamento SHALL seguir o padrão da Central de Vendas, que é a referência do projeto para páginas roláveis.

Texto real sobre fundos decorativos, incluindo o indicador da ferramenta selecionada na bandeja de navegação, SHALL usar um tom calibrado para 4,5:1, nunca o tom de marca reservado para preenchimentos e ícones.

#### Scenario: Espaçamento alinhado à referência do projeto
- **WHEN** a área de TI e a Central de Vendas são comparadas na mesma viewport
- **THEN** ambas SHALL apresentar a mesma largura máxima de conteúdo, o mesmo padding lateral e o mesmo espaçamento entre blocos irmãos
- **THEN** o container raiz da área SHALL ocupar toda a largura disponível ao lado da barra lateral do shell, sem deixar faixa não utilizada em apenas um dos lados

#### Scenario: Limiares responsivos consideram a largura real de conteúdo
- **WHEN** a área decide dividir o conteúdo em colunas
- **THEN** o limiar SHALL considerar a largura disponível dentro do shell, descontada a barra lateral e o padding do container, e não a largura da viewport
- **THEN** aumentar a viewport SHALL NOT reduzir a largura renderizada da coluna principal

#### Scenario: Tema e contraste
- **WHEN** a área é exibida em qualquer um dos temas suportados, claro ou escuro
- **THEN** todos os elementos SHALL permanecer legíveis, incluindo blocos de texto pré-formatado e indicadores de alerta
- **THEN** texto sobreposto a fundo escurecido dentro do cabeçalho SHALL respeitar o piso de contraste adotado no projeto

#### Scenario: Indicador de ferramenta ativa legível em todo tema
- **WHEN** a bandeja de ferramentas exibe qual ferramenta está selecionada
- **THEN** o texto do indicador SHALL ter contraste de ao menos 4,5:1 contra seu próprio fundo em todos os temas suportados, incluindo o claro
