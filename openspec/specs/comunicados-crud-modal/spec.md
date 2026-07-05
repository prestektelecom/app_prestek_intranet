## Requirements

### Requirement: Modal com header gradiente Bento Blue
O modal de criação/edição SHALL ter header com `background: linear-gradient(120deg, C.accentDeep, C.accent)`, texto branco, ícone Material Symbols (`campaign` para novo, `edit` para edição) e botão de fechar branco translúcido.

#### Scenario: Header novo comunicado
- **WHEN** o admin clica em "Novo Comunicado"
- **THEN** o modal abre com header azul, ícone `campaign` e título "Novo Comunicado"

#### Scenario: Header editar comunicado
- **WHEN** o admin clica em editar em um comunicado existente
- **THEN** o modal abre com header azul, ícone `edit` e título "Editar Comunicado" com dados preenchidos

### Requirement: Backdrop blur no modal
O overlay do modal SHALL ter `background: rgba(11, 27, 46, 0.6)` (usando `C.ink` como base) e `backdropFilter: blur(8px)`.

#### Scenario: Overlay com blur
- **WHEN** o modal está aberto
- **THEN** o conteúdo atrás do modal é visivelmente desfocado

### Requirement: Inputs estilizados com tokens Bento
Todos os inputs e selects do form SHALL usar `border: 1px solid C.line`, `borderRadius: 10`, `background: C.surfaceSoft`, `color: C.ink` e ao foco `outline: none` com `borderColor: C.accent` e `boxShadow: 0 0 0 3px rgba(accent, 0.15)`.

#### Scenario: Foco em input
- **WHEN** o usuário foca em qualquer input do modal
- **THEN** a borda muda para `C.accent` com ring de foco azul

### Requirement: Select de tipo com cores semânticas no modal
O select "Tipo" SHALL exibir as opções com rótulos descritivos incluindo indicação de cor (ex: "Urgente — Vermelho", "Importante — Amarelo", "Geral — Verde").

#### Scenario: Opções de tipo
- **WHEN** o modal está aberto
- **THEN** o select exibe as 3 opções: Urgente, Importante e Geral

### Requirement: Botão Publicar/Salvar com estado de loading
O botão de submit SHALL usar `background: C.accent`, `color: white`, `borderRadius: 10` e durante o envio (`isSubmitting === true`) SHALL exibir spinner animado e texto "Salvando..." com `opacity: 0.7`.

#### Scenario: Submit em andamento
- **WHEN** o formulário está sendo submetido
- **THEN** o botão exibe spinner + "Salvando..." e fica desabilitado

#### Scenario: Submit publicar
- **WHEN** o admin está criando um novo comunicado e clica em publicar
- **THEN** o botão exibe ícone `send` e texto "Publicar Aviso"
