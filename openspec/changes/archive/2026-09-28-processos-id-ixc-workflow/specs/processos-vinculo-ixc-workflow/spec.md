## ADDED Requirements

### Requirement: Vincular um Processo a um processo de workflow do IXC

Ao criar ou editar um Processo, o administrador SHALL poder vincular esse Processo a um `wfl_processo` ativo do IXC, escolhido por nome a partir de uma lista, nunca digitando um identificador numérico cru.

#### Scenario: Seletor carregado com processos ativos do IXC
- **WHEN** o administrador abre o formulário de criar/editar Processo
- **THEN** o campo "Processo do IXC" SHALL listar os `wfl_processo` com `ativo = 'S'`, exibindo o nome (`descricao`) de cada um
- **AND** o administrador SHALL poder selecionar "Nenhum" para deixar o Processo sem vínculo

#### Scenario: Processo já vinculado mostra o valor atual
- **WHEN** o administrador abre para edição um Processo que já tem um `wfl_processo` vinculado
- **THEN** o seletor SHALL vir pré-selecionado com esse `wfl_processo`

### Requirement: Resolver o assunto do IXC a partir da primeira tarefa do processo vinculado

Ao salvar um Processo com um `wfl_processo` novo ou alterado, o sistema SHALL resolver o `id_assunto` do IXC correspondente à primeira tarefa ativa do fluxo que efetivamente gera Ordem de Serviço, e persistir esse valor junto ao Processo.

#### Scenario: Resolução bem-sucedida com uma única interação válida
- **WHEN** o `wfl_processo` vinculado tem uma tarefa ativa de menor `sequencia`, e essa tarefa tem exatamente uma interação ativa com `id_wfl_param_os` diferente de zero
- **THEN** o sistema SHALL resolver `id_assunto` a partir de `wfl_parametro_oss.id_assunto` dessa interação
- **AND** SHALL persistir o `id_assunto` e o nome do assunto (`su_oss_assunto.assunto`) no Processo, com o timestamp da resolução

#### Scenario: Tarefa com múltiplas interações, só uma gera OS
- **WHEN** a tarefa de menor `sequencia` do `wfl_processo` vinculado tem mais de uma interação ativa, e apenas uma delas tem `id_wfl_param_os` diferente de zero
- **THEN** o sistema SHALL usar exclusivamente a interação com `id_wfl_param_os` diferente de zero, ignorando as demais

#### Scenario: Mais de uma tarefa com a mesma sequência mínima, só uma conectada ao fluxo
- **WHEN** o `wfl_processo` vinculado tem duas ou mais tarefas ativas com a mesma `sequencia` mínima, e apenas uma delas tem `id_proxima_tarefa` diferente de zero (efetivamente continua o fluxo)
- **THEN** o sistema SHALL usar exclusivamente a tarefa com `id_proxima_tarefa` diferente de zero como a tarefa inicial, ignorando as demais tarefas órfãs empatadas na mesma sequência

#### Scenario: Mais de uma tarefa com a mesma sequência mínima, ambiguidade não resolvida
- **WHEN** o `wfl_processo` vinculado tem duas ou mais tarefas ativas com a mesma `sequencia` mínima, e nenhuma ou mais de uma delas tem `id_proxima_tarefa` diferente de zero
- **THEN** a resolução SHALL falhar com uma mensagem genérica explicando que o processo tem mais de uma tarefa inicial configurada
- **AND** o Processo SHALL ser salvo normalmente mesmo assim, sem o vínculo resolvido

#### Scenario: Nenhuma interação da primeira tarefa gera OS
- **WHEN** a tarefa de menor `sequencia` do `wfl_processo` vinculado não tem nenhuma interação ativa com `id_wfl_param_os` diferente de zero
- **THEN** a resolução SHALL falhar com uma mensagem genérica explicando que a tarefa inicial não abre Ordem de Serviço
- **AND** o Processo SHALL ser salvo normalmente mesmo assim, sem o vínculo resolvido

#### Scenario: Processo do IXC sem nenhuma tarefa
- **WHEN** o `wfl_processo` vinculado não retorna nenhuma linha em `wfl_tarefa`
- **THEN** a resolução SHALL falhar com uma mensagem genérica
- **AND** o Processo SHALL ser salvo normalmente mesmo assim, sem o vínculo resolvido

### Requirement: Atualizar manualmente um vínculo já existente

O administrador SHALL poder reprocessar a resolução de um Processo já vinculado, sem precisar remover e recriar o vínculo.

#### Scenario: Atualização manual bem-sucedida
- **WHEN** o administrador aciona "Atualizar vínculo agora" em um Processo com `wfl_processo` já vinculado
- **THEN** o sistema SHALL reexecutar a resolução da cadeia de workflow usando o vínculo já salvo
- **AND** SHALL atualizar o `id_assunto`, o nome do assunto e o timestamp de resolução com o resultado mais recente

#### Scenario: Atualização manual sem vínculo prévio
- **WHEN** o administrador aciona a atualização em um Processo sem `wfl_processo` vinculado
- **THEN** o sistema SHALL recusar a ação com uma mensagem genérica, sem tentar resolver nada

### Requirement: Exibir o assunto do IXC na listagem de processos

A listagem de processos (tabela desktop e cards mobile) SHALL exibir o `id_assunto` do IXC no lugar do ID interno quando o Processo estiver vinculado e resolvido, mantendo o ID interno como fallback.

#### Scenario: Processo vinculado e resolvido
- **WHEN** um Processo tem `id_assunto` resolvido
- **THEN** o badge de ID na tabela desktop e no card mobile SHALL exibir o número do assunto do IXC, não o ID interno
- **AND** SHALL ter um `title`/tooltip indicando o número e o nome do assunto do IXC

#### Scenario: Processo sem vínculo ou sem resolução bem-sucedida
- **WHEN** um Processo não tem `id_assunto` resolvido (nunca vinculado, ou última resolução falhou)
- **THEN** o badge de ID na tabela desktop e no card mobile SHALL exibir o ID interno (`OP-001`/`TI-004`...), sem ficar vazio ou quebrar o layout

#### Scenario: Modais de edição e consulta não são afetados
- **WHEN** o administrador abre o modal de "Editar/Novo Processo" ou o modal de "Consulta (somente leitura)" de qualquer Processo, vinculado ou não
- **THEN** o badge de ID dentro desses modais SHALL sempre exibir o ID interno do Processo, independentemente de haver vínculo ou assunto resolvido
