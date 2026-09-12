## ADDED Requirements

### Requirement: Trap de foco e fechamento por teclado no modal de criação/edição

O `CrudModal` SHALL conter a navegação por teclado dentro de si enquanto estiver aberto, e SHALL ser fechável via Escape, consistente com o `role="dialog"`/`aria-modal="true"` que declara.

#### Scenario: Usuário navega pelo modal só com teclado

- **WHEN** o `CrudModal` está aberto e o usuário pressiona Tab repetidamente
- **THEN** o foco circula apenas entre os elementos focáveis do modal, nunca alcançando elementos da página por trás do backdrop
- **AND** Shift+Tab a partir do primeiro elemento focável do modal move o foco para o último elemento focável do modal

#### Scenario: Usuário fecha o modal com Escape

- **WHEN** o usuário pressiona Escape com o modal aberto
- **THEN** o modal fecha
- **AND** o foco retorna ao elemento que abriu o modal

#### Scenario: Usuário clica fora do modal

- **WHEN** o usuário clica na área do backdrop, fora do card do modal
- **THEN** o modal fecha
