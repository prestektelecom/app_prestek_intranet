## ADDED Requirements

### Requirement: Card de colaborador redesenhado v2
Cada card de colaborador SHALL exibir: avatar circular com ring colorido conforme o departamento, indicador de presença pulsante (ativo=verde/inativo=cinza), nome, nome do departamento com badge colorido, e ações de contato (email + telefone) que revelam-se no hover com transição suave.

#### Scenario: Borda e ring coloridos por departamento
- **WHEN** um card é renderizado
- **THEN** a borda esquerda (4px) e o ring do avatar usam a cor mapeada para o departamento do colaborador (via `DEPT_COLORS` por palavra-chave no nome do depto)

#### Scenario: Indicador de presença ativo pulsa
- **WHEN** o colaborador tem `ativo='S'`
- **THEN** a bolinha de status exibe a cor `#1F8A5B` com animação de pulso (`@keyframes pulse-ring`) contínua

#### Scenario: Indicador de presença inativo
- **WHEN** o colaborador tem `ativo` diferente de `'S'`
- **THEN** a bolinha de status exibe cor `#8896A8` sem animação

#### Scenario: Ações de contato reveladas no hover
- **WHEN** o usuário passa o mouse sobre o card
- **THEN** dois botões de ação surgem com transição (`opacity: 0→1`, `translateY: 4px→0`): botão de email (abre `mailto:`) e botão de telefone (abre `tel:` com o ramal)

#### Scenario: Fallback sem email ou ramal
- **WHEN** o colaborador não possui email ou ramal cadastrado
- **THEN** o botão correspondente é renderizado como desabilitado (`opacity: 0.4`, `cursor: not-allowed`)
