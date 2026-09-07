# impeccable-quality-gate

Critérios objetivos que uma superfície do portal precisa cumprir para ser considerada concluída pelo programa `/impeccable`, e a forma de registrar exceções aceitas.

## ADDED Requirements

### Requirement: Uma superfície só avança com backlog prioritário zerado

O programa SHALL considerar uma superfície concluída somente quando não houver findings P0 ou P1 abertos na última crítica nem no último audit dela, salvo exceção registrada.

#### Scenario: Crítica ainda tem P0 aberto
- **GIVEN** a última crítica de `src/components/Dashboard.jsx` lista um P0
- **AND** o P0 não está registrado em `.impeccable/critique/ignore.md`
- **WHEN** o executor tenta marcar a superfície como concluída
- **THEN** a superfície permanece aberta e a próxima da fila não é iniciada

#### Scenario: P0 aceito como exceção
- **GIVEN** um P0 foi registrado em `.impeccable/critique/ignore.md` com motivo, data e responsável
- **WHEN** o portão é avaliado
- **THEN** esse finding não conta como aberto

### Requirement: Verificação antes de reavaliar

O executor SHALL, após qualquer correção de código em uma superfície e antes de rodar a crítica e o audit de reavaliação, executar `npx vite build` com sucesso, revisar o diff contra o contrato de resposta de cada endpoint tocado e submeter o diff ao agente `impeccable-finish-reviewer`.

#### Scenario: Correção altera tratamento de resposta de API
- **GIVEN** uma correção passa a tratar `sucesso: false` de um endpoint como erro
- **WHEN** o diff é revisado contra o contrato do endpoint
- **AND** o endpoint também responde `sucesso: false, sem_dados: true` para um caso legítimo
- **THEN** a correção é ajustada para distinguir sucesso, sem dados e erro antes de a superfície ser reavaliada

### Requirement: Tendência registrada por superfície

O executor SHALL rodar `critique` e `audit` de novo após as correções, sempre sobre o mesmo alvo usado na primeira rodada, de modo que o snapshot registre a tendência de placar.

#### Scenario: Placar da crítica caiu
- **GIVEN** a crítica anterior da superfície marcou 15/40
- **WHEN** a crítica de reavaliação marca menos de 15/40
- **THEN** a superfície não passa o portão e a regressão é investigada antes de qualquer outra correção

#### Scenario: Alvo diferente entre rodadas
- **GIVEN** a primeira crítica usou `src/components/Schedule.jsx`
- **WHEN** a reavaliação é preparada
- **THEN** o alvo é o mesmo arquivo, e não a pasta `src/components/schedule/`

### Requirement: Cobertura mínima de papéis, temas e viewports

Antes de passar o portão, a superfície SHALL ter sido percorrida manualmente por colaborador comum e por admin, nos temas claro e Default Dark, em desktop e celular, e conferida por amostragem em Cyber-Obsidian, Deep-Space Aurora e AMOLED.

#### Scenario: Página com área restrita a admin
- **GIVEN** a superfície tem conteúdo condicionado a `is_admin`
- **WHEN** a passagem manual é feita
- **THEN** o executor confirma o comportamento para o usuário sem `is_admin` (conteúdo ausente ou NotFound, nunca apenas escondido)

#### Scenario: Cor fixa que só quebra em um tema escuro
- **GIVEN** um componente usa hex fixo que passa em claro e em Default Dark
- **WHEN** a amostragem em AMOLED é feita
- **THEN** o contraste insuficiente é registrado como P1 de tema e corrigido com token antes do portão

### Requirement: Registro de exceções

Toda exceção a um finding SHALL ser registrada em `.impeccable/critique/ignore.md` com o finding, o motivo, a data e quem decidiu. Exceções silenciosas não são permitidas.

#### Scenario: Decisão de não corrigir grid travado
- **GIVEN** o usuário decide manter `isDraggable=false` no dashboard apesar do PRODUCT.md
- **WHEN** a decisão é tomada
- **THEN** ela é escrita em `ignore.md` com o motivo, e o PRODUCT.md é atualizado para não contradizer o código

### Requirement: Padrões repetidos sobem para o sistema

Um finding do mesmo tipo encontrado em três ou mais superfícies SHALL ser anotado na seção Transversal de `tasks.md` do programa e resolvido via `extract` no encerramento, e não corrigido de forma independente em cada página a partir da terceira ocorrência.

#### Scenario: Terceira ocorrência de raio de borda fora do DESIGN.md
- **GIVEN** duas superfícies já tiveram finding de raio de borda inconsistente
- **WHEN** a terceira superfície apresenta o mesmo finding
- **THEN** o finding é anotado como transversal e a correção local se limita a usar o token existente mais próximo
