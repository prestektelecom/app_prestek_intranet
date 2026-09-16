## ADDED Requirements

### Requirement: Modal de criar/editar comunicado tem semântica de diálogo completa
O modal de criar/editar comunicado do Painel Admin SHALL se comportar como um diálogo modal reconhecível por tecnologia assistiva: papel de diálogo, foco preso enquanto aberto, fechamento por Escape, foco inicial e de retorno, e campos identificados programaticamente.

#### Scenario: Leitor de tela reconhece o diálogo
- **WHEN** o modal de criar ou editar comunicado abre
- **THEN** tecnologia assistiva SHALL anunciá-lo como um diálogo, com um título associado

#### Scenario: Escape fecha e devolve o foco
- **WHEN** o modal está aberto e o usuário pressiona Escape
- **THEN** o modal SHALL fechar
- **THEN** o foco SHALL retornar ao controle que abriu o modal

#### Scenario: Tab não escapa do modal
- **WHEN** o modal está aberto e o usuário tabula a partir do último controle focável
- **THEN** o foco SHALL voltar para o primeiro controle focável do modal, nunca para um elemento fora dele

#### Scenario: Cada campo tem rótulo associado programaticamente
- **WHEN** um leitor de tela foca qualquer campo do formulário do modal
- **THEN** o rótulo visível desse campo SHALL ser anunciado
