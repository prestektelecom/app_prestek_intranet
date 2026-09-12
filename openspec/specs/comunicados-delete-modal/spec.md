## Purpose

Modal de confirmação de exclusão de comunicados, usado pelo admin a partir da página de Comunicados (`Comunicados.jsx`).

## Requirements

### Requirement: Modal de exclusão com tema danger Bento
O modal de confirmação de exclusão SHALL usar `border: 1px solid rgba(C.danger, 0.3)`, ícone de aviso centralizado com `background: C.dangerSoft` e `color: C.danger`, e botão de confirmação com `background: C.danger`.

#### Scenario: Modal de exclusão abre
- **WHEN** o admin clica no botão excluir de um comunicado
- **THEN** o modal de confirmação abre com ícone de warning em fundo vermelho suave

#### Scenario: Confirmar exclusão
- **WHEN** o admin clica em "Sim, excluir!"
- **THEN** a requisição DELETE é enviada, o modal fecha e a lista é atualizada

#### Scenario: Cancelar exclusão
- **WHEN** o admin clica em "Cancelar"
- **THEN** o modal fecha sem executar nenhuma requisição

### Requirement: Backdrop blur no modal de exclusão
O overlay SHALL ter `backdropFilter: blur(8px)` e `background: rgba(C.ink, 0.6)`.

#### Scenario: Overlay com blur no modal de exclusão
- **WHEN** o modal de exclusão está aberto
- **THEN** o conteúdo atrás está desfocado

### Requirement: Botão cancelar com tema neutro
O botão "Cancelar" SHALL usar `background: C.surface`, `border: 1px solid C.line`, `color: C.ink2` e hover com `background: C.surfaceSoft`.

#### Scenario: Hover no botão cancelar
- **WHEN** o usuário passa o mouse sobre o botão cancelar
- **THEN** o fundo muda para `C.surfaceSoft` com transição suave

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
