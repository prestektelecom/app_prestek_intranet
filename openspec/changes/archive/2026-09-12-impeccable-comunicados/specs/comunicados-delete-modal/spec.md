## ADDED Requirements

### Requirement: Trap de foco e fechamento por teclado no modal de exclusão

O `DeleteModal` SHALL conter a navegação por teclado dentro de si enquanto estiver aberto, e SHALL ser fechável via Escape, consistente com o `role="dialog"`/`aria-modal="true"` que declara. Como é uma confirmação de ação destrutiva, esse comportamento é ainda mais crítico aqui do que em modais não-destrutivos.

#### Scenario: Usuário navega pelo modal de exclusão só com teclado

- **WHEN** o `DeleteModal` está aberto e o usuário pressiona Tab repetidamente
- **THEN** o foco circula apenas entre "Cancelar" e "Sim, excluir!", nunca alcançando elementos da página por trás do backdrop

#### Scenario: Usuário fecha o modal de exclusão com Escape

- **WHEN** o usuário pressiona Escape com o modal de exclusão aberto
- **THEN** o modal fecha sem excluir nada
- **AND** o foco retorna ao elemento que abriu o modal

#### Scenario: Usuário clica fora do modal de exclusão

- **WHEN** o usuário clica na área do backdrop, fora do card do modal
- **THEN** o modal fecha sem excluir nada
