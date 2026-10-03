# hover-border-effect Specification

## Purpose
Efeito de borda luminosa ao passar o mouse sobre cards do Dashboard, com cor guiada por tokens de tema (família laranja da marca), sem conflitar com o modo de edição do grid.

## Requirements

### Requirement: Tokens CSS de borda hover por tema
O sistema SHALL definir `--hover-border-from`, `--hover-border-to` e `--hover-border-glow` em cada bloco de tema (`:root`, `.dark`, `.dark-cyber`, `.dark-aurora`, `.dark-amoled`) de `src/index.css`, usando a família laranja da marca.

#### Scenario: Tema claro
- **WHEN** nenhuma classe de tema escuro está ativa no `<html>`
- **THEN** `--hover-border-from` SHALL ser `#EC7D23` e `--hover-border-glow` SHALL ser `rgba(236, 125, 35, 0.40)`

#### Scenario: Temas escuros
- **WHEN** o `<html>` tem `.dark`, `.dark-cyber`, `.dark-aurora` ou `.dark-amoled`
- **THEN** `--hover-border-from` SHALL ser um tom de laranja (`#F97316` ou `#FB923C` no Aurora) com `--hover-border-glow` na mesma cor com alfa entre 0.45 e 0.50

### Requirement: Classe utilitária `.bento-hover-border`
O sistema SHALL fornecer a classe `.bento-hover-border`, que aplica borda luminosa e glow externo no hover usando os tokens do tema ativo.

#### Scenario: Glow no hover
- **WHEN** o usuário passa o mouse sobre um elemento com `.bento-hover-border`
- **THEN** SHALL aparecer a borda luminosa e um glow externo (`box-shadow` com `var(--hover-border-glow)`), aplicados com `!important` para prevalecer sobre estilos inline

#### Scenario: Compatibilidade com border-radius
- **WHEN** o elemento tem `border-radius`
- **THEN** o efeito SHALL seguir o arredondamento do elemento

### Requirement: Cards do Dashboard usam o efeito
Os cards do Dashboard SHALL receber `.bento-hover-border` pela constante de classe `CARD` em `src/components/Dashboard.jsx`.

#### Scenario: Card do Dashboard no hover
- **WHEN** o usuário passa o mouse sobre um card do Dashboard
- **THEN** o efeito de borda luminosa SHALL aparecer, compatível com o tema ativo

### Requirement: Efeito desativado no modo de edição do grid
O efeito NÃO SHALL ser aplicado a cards dentro de `.layout.is-editing`.

#### Scenario: Modo de edição
- **WHEN** `.layout.is-editing` está presente
- **THEN** `box-shadow` do hover SHALL ser suprimido e o pseudo-elemento `::before` SHALL ficar oculto
