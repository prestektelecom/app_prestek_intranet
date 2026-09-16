## ADDED Requirements

### Requirement: Mudança de privilégio de administrador exige confirmação explícita
Conceder ou revogar o privilégio de administrador de um usuário SHALL exigir uma etapa de confirmação explícita, nomeando a pessoa afetada e o efeito da ação, antes de qualquer gravação ocorrer. A confirmação SHALL usar um diálogo próprio da aplicação, nunca uma caixa de diálogo nativa do navegador.

#### Scenario: Conceder admin exige confirmação
- **WHEN** o administrador aciona o controle para conceder privilégio de administrador a um usuário
- **THEN** a aplicação SHALL exibir uma confirmação nomeando o usuário e o efeito, antes de enviar qualquer requisição de gravação
- **THEN** cancelar a confirmação SHALL NOT alterar o privilégio do usuário

#### Scenario: Revogar admin exige confirmação
- **WHEN** o administrador aciona o controle para revogar privilégio de administrador de um usuário
- **THEN** a aplicação SHALL exibir uma confirmação nomeando o usuário e o efeito, antes de enviar qualquer requisição de gravação
- **THEN** cancelar a confirmação SHALL NOT alterar o privilégio do usuário

### Requirement: O controle de privilégio nomeia a ação, não o estado atual
O controle usado para conceder ou revogar privilégio de administrador SHALL ter um rótulo e um nome acessível que descrevem a AÇÃO que o acionamento executa, não apenas o estado atual do usuário.

#### Scenario: Rótulo descreve a ação disponível
- **WHEN** um usuário sem privilégio de administrador é exibido
- **THEN** o controle SHALL indicar que a ação disponível é conceder o privilégio
- **WHEN** um usuário com privilégio de administrador é exibido
- **THEN** o controle SHALL indicar que a ação disponível é revogar o privilégio

### Requirement: Falha ao alterar privilégio é anunciada sem bloquear a interface
Uma falha ao conceder ou revogar privilégio de administrador SHALL ser comunicada dentro do próprio fluxo de confirmação, de forma perceptível a tecnologia assistiva, sem usar uma caixa de diálogo nativa do navegador.

#### Scenario: Erro de gravação é anunciado
- **WHEN** a requisição de mudança de privilégio falha
- **THEN** a aplicação SHALL exibir a falha dentro do diálogo de confirmação, de forma anunciável a tecnologia assistiva
- **THEN** a aplicação SHALL NOT usar `alert()` nativo do navegador para comunicar essa falha
