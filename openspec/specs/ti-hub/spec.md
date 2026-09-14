# ti-hub Specification

## Purpose

Garante que a área de TI da intranet funcione como um hub extensível de ferramentas administrativas — uma única entrada de navegação, restrita a administradores, com o mesmo sistema visual e de responsividade do resto do produto — em vez de crescer como uma view nova por ferramenta.

## Requirements

### Requirement: Aba TI como hub extensível de ferramentas do setor
A intranet SHALL expor uma área dedicada ao setor de TI, organizada como container de múltiplas ferramentas em vez de uma tela única.

A área SHALL ocupar **uma** entrada na navegação, independentemente de quantas ferramentas contenha, de modo que o custo de registro de view seja pago uma única vez e a barra de navegação inferior do mobile não seja disputada a cada ferramenta nova.

O conjunto de ferramentas SHALL ser declarado em um registro único, e a área SHALL derivar dele tanto os controles de seleção quanto o conteúdo renderizado.

#### Scenario: Uma entrada de navegação para todas as ferramentas
- **WHEN** a área de TI contém qualquer quantidade de ferramentas
- **THEN** a navegação SHALL exibir exatamente uma entrada correspondente à área
- **THEN** a seleção entre ferramentas SHALL acontecer dentro da própria área, sem alterar a view ativa da aplicação

#### Scenario: Adicionar uma ferramenta não toca em navegação
- **WHEN** uma nova ferramenta é adicionada ao registro
- **THEN** ela SHALL aparecer no seletor de ferramentas e ser renderizável
- **THEN** nenhum arquivo de navegação, nem o componente container da área, nem o componente raiz da aplicação SHALL precisar de alteração

#### Scenario: O seletor existe mesmo com uma ferramenta só
- **WHEN** o registro contém uma única ferramenta
- **THEN** a área SHALL renderizar o seletor normalmente
- **THEN** a área SHALL NOT tratar esse caso de forma especial

#### Scenario: A ferramenta ativa sobrevive ao recarregamento
- **WHEN** o usuário seleciona uma ferramenta e recarrega a página
- **THEN** a área SHALL reabrir na mesma ferramenta
- **WHEN** a ferramenta persistida não existe mais no registro
- **THEN** a área SHALL abrir na ferramenta padrão, sem erro

### Requirement: Acesso restrito a administradores
A área de TI SHALL ser acessível apenas a usuários com privilégio de administrador, tanto na exibição quanto no acesso direto.

#### Scenario: A entrada não é exibida para quem não pode acessar
- **WHEN** um usuário sem privilégio de administrador está autenticado
- **THEN** a entrada da área de TI SHALL NOT aparecer em nenhuma das superfícies de navegação — barra lateral, gaveta mobile ou folha de opções adicionais

#### Scenario: Acesso direto por view persistida é bloqueado
- **WHEN** um usuário sem privilégio de administrador força a view da área de TI, por exemplo alterando o estado persistido no navegador
- **THEN** a aplicação SHALL exibir a página de conteúdo não encontrado
- **THEN** a aplicação SHALL NOT renderizar a página de conteúdo não encontrado simultaneamente com o conteúdo da área

### Requirement: Consistência visual com o restante do produto
A área de TI SHALL adotar o mesmo sistema visual das demais telas, de modo que não se leia como um produto separado.

O espaçamento SHALL seguir o padrão da Central de Vendas, que é a referência do projeto para páginas roláveis.

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
