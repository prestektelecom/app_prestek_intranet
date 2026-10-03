## ADDED Requirements

### Requirement: Hero inteligente e útil com açao rápida

O Dashboard SHALL exibir um Hero inteligente no topo do Bento Grid com saudaçao baseada na hora do dia, cargo do colaborador, data/hora ao vivo, botão de açao rápida `+ Abrir Chamado TI` e alerta técnico em destaque quando houver.

#### Scenario: Exibiçao da saudaçao e acçoes no Hero
- **WHEN** o usuário acessa o Dashboard
- **THEN** o sistema exibe o nome do usuário, cargo, saudaçao contextual ("Bom dia/Boa tarde"), botão `+ Abrir Chamado TI` e o card de horário/localidade.

### Requirement: Card de Ordens de Serviço sob responsabilidade

O Dashboard SHALL destacar o card de Ordens de Serviço atribuídas ao usuário logado em posiçao de alta visibilidade, exibindo a contagem total de OS pendentes e um indicador em destaque caso existam ordens com vencimento no dia.

#### Scenario: Visualizaçao de OS no meu nome
- **WHEN** o usuário possui Ordens de Serviço ativas em seu nome
- **THEN** o card exibe o número de chamados em tamanho grande, a contagem de OS do dia e o botão "Gerenciar Minhas OS" direcionando para a listagem.

### Requirement: Card de Comunicados com aviso em destaque

O Dashboard SHALL apresentar o card de Comunicados contendo um banner "Featured" para a notificaçao mais recente/urgente e uma lista recolhida dos demais avisos.

#### Scenario: Comunicado urgente em destaque
- **WHEN** existem comunicados cadastrados
- **THEN** o mais recente é exibido no topo do card com a tag do setor e data relativa ("há 2 horas"), seguido pela lista compacta dos comunicados anteriores.
