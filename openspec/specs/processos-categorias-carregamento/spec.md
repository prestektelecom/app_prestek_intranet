# processos-categorias-carregamento Specification

## Purpose

Definir o comportamento de carregamento das categorias de processos na página "Processos Operacionais", cobrindo tanto o caso de sucesso quanto falhas da API, para que a página nunca fique inutilizável por causa de um erro no carregamento das categorias.

## Requirements

### Requirement: Carregamento bem-sucedido de categorias

Ao abrir a página "Processos Operacionais", o sistema SHALL buscar as categorias de processos na API e usá-las para popular os filtros por categoria e o campo de seleção de categoria no formulário de processo.

#### Scenario: API retorna categorias com sucesso
- **WHEN** a página "Processos Operacionais" é carregada e `GET /api/categorias-processos` responde com sucesso e um array de categorias
- **THEN** os pills de filtro exibem "Todas as Categorias" seguido de uma opção para cada categoria retornada
- **AND** o campo "Categoria" do formulário de novo/editar processo lista as mesmas categorias como opções selecionáveis

### Requirement: Degradação sem quebra em falha de carregamento

Quando a busca de categorias falhar (erro HTTP, erro de rede, ou resposta em formato inesperado), o sistema SHALL manter a página funcional em vez de lançar uma exceção não tratada.

#### Scenario: API responde com erro HTTP
- **WHEN** `GET /api/categorias-processos` responde com um status de erro (ex: 500)
- **THEN** a lista de categorias usada pela página permanece vazia
- **AND** os pills de filtro exibem apenas "Todas as Categorias", sem opções adicionais
- **AND** o campo "Categoria" do formulário de novo/editar processo é exibido sem opções, sem lançar erro de renderização
- **AND** o restante da página (busca, tabela/lista de processos, paginação) continua funcional

#### Scenario: API responde com corpo em formato inesperado
- **WHEN** a resposta de `GET /api/categorias-processos` não é um array de categorias (ex: um objeto de erro `{ "erro": "..." }`)
- **THEN** o sistema trata a resposta como falha de carregamento
- **AND** o comportamento observável é o mesmo do cenário "API responde com erro HTTP"

#### Scenario: Usuário abre o modal de novo processo durante falha de carregamento
- **WHEN** a busca de categorias falhou e o usuário clica em "Novo Processo"
- **THEN** o modal de criação de processo abre normalmente, sem tela em branco/preta ou erro não tratado
- **AND** o campo "Categoria" é exibido vazio, sem impedir o preenchimento dos demais campos
