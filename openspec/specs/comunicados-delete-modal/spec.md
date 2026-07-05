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
