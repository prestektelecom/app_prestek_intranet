# ti-modal-solicitante-selector Specification

## Purpose
Componente de modal para abertura de chamados de TI na intranet. Gerencia a seleção do técnico responsável no frontend, deriva o solicitante do usuário logado e define as regras de atribuição dos respectivos IDs no backend ao criar o ticket (`su_ticket`) e a OS manual (`su_oss_chamado`) no IXC Soft.

## Requirements

### Requirement: Campo de seleção de solicitante no modal de TI
O modal de abertura de chamado de TI SHALL enviar o e-mail do usuário logado na requisição. O backend SHALL buscar o ID do funcionário/técnico correspondente a esse e-mail no IXC Soft. A OS criada no IXC SHALL ter o campo `id_tecnico` (Colaborador responsável) preenchido com o ID do colaborador logado solicitante (se encontrado no IXC), enquanto o agendamento da OS é atribuído ao técnico selecionado para atendimento.

#### Scenario: Abertura do modal e envio do chamado
- **WHEN** o usuário preenche a descrição, seleciona o técnico para atendimento e clica em "Abrir Chamado"
- **THEN** o frontend SHALL enviar o e-mail do usuário logado e o `tecnico_id` selecionado para o backend
- **THEN** o backend SHALL tentar obter o ID do técnico no IXC Soft correspondente ao e-mail do solicitante
- **THEN** o backend SHALL criar a OS manual com `id_tecnico` correspondente ao ID do solicitante logado (ou fallback para o técnico se não encontrado) e associar a OS ao técnico de atendimento selecionado

### Requirement: Campo de Técnico Responsável no modal de TI
O modal de abertura de chamado de TI SHALL exibir um campo `<select>` habilitado (editável) contendo as opções de técnicos disponíveis: "MARCIO EDUARDO FELIX" (id: 59570) e "EVERTON DOS SANTOS VIEIRA" (id: 59841). O campo SHALL exibir uma opção-placeholder "Quem vai atender" como padrão vazio. O chamado enviado ao backend SHALL conter `tecnico_id` correspondente ao ID do técnico selecionado no IXC.

#### Scenario: Exibição do técnico no modal com seleção obrigatória
- **WHEN** o modal está aberto
- **THEN** o modal SHALL exibir um campo `<select>` com label "Enviar para" e a opção placeholder "Quem vai atender" como estado inicial
- **THEN** o botão "Abrir Chamado" SHALL estar desabilitado enquanto nenhum técnico for selecionado

#### Scenario: Envio do chamado com técnico atribuído
- **WHEN** o usuário seleciona um técnico e envia o chamado
- **THEN** o frontend SHALL passar o `tecnico_id` correspondente à opção selecionada no payload da requisição
- **THEN** o backend SHALL persistir o `id_tecnico` na OS vinculada no IXC

### Requirement: Atribuição de responsável no ticket e técnico na OS
O sistema SHALL atribuir o `funcionario_id` do colaborador logado ao campo `id_responsavel_tecnico` do ticket (`su_ticket`) ao abrir um chamado de TI via intranet. O campo `id_tecnico` da OS manual (`su_oss_chamado`) SHALL sempre receber o ID do técnico de TI selecionado pelo usuário (Marcio ou Everton).

#### Scenario: Abertura de chamado com colaborador logado identificado no banco local
- **WHEN** um colaborador abre um chamado de TI pela intranet, seleciona um técnico e envia o formulário
- **THEN** o backend busca o `funcionario_id` do solicitante em `usuarios_perfil` usando `colaborador_id` ou `email_solicitante`
- **THEN** o ticket (`su_ticket`) é criado com `id_responsavel_tecnico` = `funcionario_id` do solicitante
- **THEN** o ticket (`su_ticket`) é criado com `id_usuarios` = `usuario_id` do solicitante (mantido)
- **THEN** a OS manual (`su_oss_chamado`) é criada com `id_tecnico` = ID do técnico de TI selecionado (Marcio/Everton)
- **THEN** o painel do IXC exibe o colaborador logado como "Colaborador responsável" no atendimento

#### Scenario: Abertura de chamado quando funcionario_id não é encontrado no banco local
- **WHEN** o banco local não retorna `funcionario_id` para o colaborador logado
- **THEN** o ticket (`su_ticket`) é criado com `id_responsavel_tecnico` = ID do técnico de TI selecionado (fallback)
- **THEN** a OS manual (`su_oss_chamado`) é criada com `id_tecnico` = ID do técnico de TI selecionado
- **THEN** o chamado é aberto com sucesso sem interrupção para o usuário

#### Scenario: Registro de rastreabilidade
- **WHEN** qualquer chamado de TI é aberto via intranet
- **THEN** o log de debug SHALL registrar qual `funcionario_id` foi resolvido para `id_responsavel_tecnico` e qual `tecnico_id` foi usado para `id_tecnico` da OS

### Requirement: Modal acessível por teclado e leitor de tela
O modal de abertura de chamado de TI SHALL ser exposto como um diálogo (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o título visível). Ao abrir, o foco SHALL mover-se para dentro do modal; enquanto aberto, a navegação por Tab SHALL permanecer restrita aos controles do modal; pressionar Escape SHALL fechar o modal e devolver o foco ao controle que o abriu.

#### Scenario: Abrir o modal por teclado
- **WHEN** o usuário aciona "Suporte TI" pelo teclado
- **THEN** o foco entra no modal e um leitor de tela anuncia um diálogo com o título correspondente

#### Scenario: Navegar dentro do modal aberto
- **WHEN** o modal de Suporte de TI está aberto e o usuário pressiona Tab repetidamente
- **THEN** o foco percorre apenas os controles do modal, sem visitar elementos da página por trás

#### Scenario: Fechar com Escape
- **WHEN** o modal está aberto e o usuário pressiona Escape
- **THEN** o modal fecha e o foco volta ao controle que o abriu

### Requirement: Exibição legível do número de protocolo sem transbordo
O modal de sucesso de chamado de TI SHALL exibir o número de protocolo gerado sem transbordo visual na caixa do container. A caixa SHALL ter um tamanho responsivo e o texto do protocolo SHALL quebrar linha se a largura ultrapassar o limite interno, garantindo a exibição integral do número.

#### Scenario: Visualização do protocolo longo com quebra de linha
- **WHEN** o chamado é criado com sucesso e o IXC Soft retorna um número de protocolo longo (como 20 dígitos ou mais)
- **THEN** o modal SHALL exibir o número do protocolo inteiramente dentro de uma caixa container estilizada
- **THEN** o texto do número de protocolo SHALL quebrar linha (word-break) se necessário, sem estourar as bordas laterais do container
