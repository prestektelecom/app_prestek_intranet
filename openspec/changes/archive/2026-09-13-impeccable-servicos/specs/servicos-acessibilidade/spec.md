## ADDED Requirements

### Requirement: Cards de serviço abrem por teclado

Todo card de Plano, Serviço Técnico ou Pacote de Streaming (`GradientCard`) SHALL ser focável por teclado e SHALL disparar sua ação primária (abrir o modal de detalhe) ao pressionar Enter ou Espaço, sem disparar essa ação quando o foco estiver num controle aninhado (editar, excluir, comparar).

#### Scenario: Abrir o detalhe de um card por teclado
- **WHEN** o usuário navega até um card via Tab e pressiona Enter ou Espaço
- **THEN** o modal de detalhe do card abre, da mesma forma que ao clicar no card

#### Scenario: Ativar um controle aninhado não abre o detalhe em duplicidade
- **WHEN** o usuário navega até o botão de editar (ou comparar) dentro de um card e pressiona Enter ou Espaço
- **THEN** apenas a ação do botão aninhado é executada — o modal de detalhe do card NÃO abre junto

### Requirement: Modais administrativos de Serviços têm semântica de diálogo completa

Os modais de edição admin (`PlanEditModal`, `TechServiceModal`, `StreamingServiceModal`, via `ModalShell`), o diálogo de confirmação de exclusão e o modal de detalhe (`ServiceDetailModal`) SHALL ter `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título, fechar via Escape, fechar ao clicar fora, foco inicial dentro do diálogo, e Tab preso dentro do diálogo enquanto aberto.

#### Scenario: Escape fecha qualquer diálogo desta tela
- **WHEN** o usuário pressiona Escape com um modal de edição, o diálogo de exclusão ou o modal de detalhe aberto
- **THEN** o diálogo fecha sem salvar/confirmar nenhuma alteração

#### Scenario: Tab não escapa do diálogo aberto
- **WHEN** o usuário pressiona Tab repetidamente dentro de um diálogo aberto
- **THEN** o foco permanece circulando entre os controles do próprio diálogo, nunca alcançando elementos da página por trás

### Requirement: Texto secundário legível em todos os temas

Texto real (rótulos, hints, legendas, subtítulos, estados vazios) nos componentes de Serviços SHALL usar um tom que passa 4,5:1 de contraste em todos os cinco temas, não o tom `muted`/`--foreground-muted` (reservado a ícones inativos e placeholders).

#### Scenario: Rótulo "Ordenar por" legível no tema claro
- **WHEN** a barra de filtros é exibida no tema claro
- **THEN** o rótulo "Ordenar por:" tem contraste de no mínimo 4,5:1 contra seu fundo

### Requirement: Alvos de toque mínimos nos controles de Serviços

Os botões de ordenação, o toggle Velocidade/Dia do hero, os ícones de editar/excluir dos cards e o botão de fechar dos modais admin SHALL ter área de toque efetiva de no mínimo 44×44px, mesmo quando a caixa visual for menor.

#### Scenario: Botão de editar/excluir com vizinho adjacente
- **WHEN** um card de Serviço Técnico ou Streaming exibe os botões de editar e excluir lado a lado
- **THEN** cada um tem área de toque efetiva de no mínimo 44×44px
- **AND** as áreas de toque expandidas dos dois botões NÃO se sobrepõem
