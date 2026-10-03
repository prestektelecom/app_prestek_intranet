# setores-membros-manuais Specification

## Purpose

Permitir que um administrador defina, só na intranet, quem faz parte da equipe de cada setor, incluindo pessoas que o IXC não colocou nele ou excluindo pessoas que o IXC colocou, sem nunca alterar o IXC e de forma sempre reversível.

## Requirements

### Requirement: Ajustes de equipe existem só na intranet
Os ajustes de equipe SHALL ser guardados apenas no banco da intranet. O sistema SHALL NOT escrever nada no IXC por causa de um ajuste.

#### Scenario: Incluir alguém não altera o IXC
- **WHEN** um administrador inclui uma pessoa na equipe de um setor
- **THEN** o cadastro dessa pessoa no IXC SHALL permanecer inalterado

### Requirement: Equipe efetiva do setor
A equipe efetiva de um setor SHALL ser composta por quem o IXC coloca no setor, mais as pessoas incluídas, menos as pessoas excluídas. A regra existente de ATENDIMENTO (que reúne os departamentos de Suporte e Relacionamento) SHALL ser aplicada antes dos ajustes.

#### Scenario: Pessoa incluída aparece na equipe
- **WHEN** uma pessoa ativa, que o IXC não coloca no setor Comercial, é incluída no Comercial
- **THEN** a equipe efetiva do Comercial SHALL conter essa pessoa

#### Scenario: Pessoa excluída deixa a equipe
- **WHEN** uma pessoa que o IXC coloca no setor TI é excluída do TI
- **THEN** a equipe efetiva do TI SHALL NOT conter essa pessoa

#### Scenario: Exclusão vale também para quem entra por ATENDIMENTO
- **WHEN** uma pessoa do departamento de Suporte, que entra no setor ATENDIMENTO pela regra de agrupamento, é excluída do ATENDIMENTO
- **THEN** a equipe efetiva do ATENDIMENTO SHALL NOT conter essa pessoa

#### Scenario: Ajuste sobre pessoa inexistente ou inativa não tem efeito
- **WHEN** existe um ajuste para uma pessoa que não está mais entre os funcionários ativos do IXC
- **THEN** a equipe efetiva SHALL ignorar esse ajuste, sem erro

#### Scenario: Setores agregados pelo ATENDIMENTO não recebem ajuste próprio
- **WHEN** alguém tenta criar um ajuste de equipe diretamente nos setores Suporte ou Relacionamento
- **THEN** o sistema SHALL recusar com erro de validação, indicando que a equipe dessas áreas se ajusta pelo ATENDIMENTO

### Requirement: Mais de um setor por pessoa
Uma pessoa SHALL poder pertencer a mais de um setor ao mesmo tempo. O setor que o IXC indica SHALL continuar sendo o setor principal dela.

#### Scenario: Pessoa em dois setores
- **WHEN** uma pessoa do Comercial é incluída também na equipe de TI
- **THEN** ela SHALL constar nas equipes do Comercial e do TI, com o Comercial como setor principal

### Requirement: Contagens não contam a mesma pessoa duas vezes
O total de colaboradores únicos de Setores SHALL contar cada pessoa uma só vez, mesmo que ela conste em mais de um setor. O total de membros de cada setor SHALL refletir a equipe efetiva desse setor.

#### Scenario: Total único com duas lotações
- **WHEN** uma pessoa consta em dois setores
- **THEN** o total de colaboradores únicos SHALL contá-la uma vez e o total de membros de cada um dos dois setores SHALL contá-la

### Requirement: Setores e Colaboradores concordam
Para cada setor, o total de membros mostrado em Setores SHALL ser igual à quantidade de colaboradores ativos que a lista de Colaboradores filtra por esse setor.

#### Scenario: Mesma equipe nas duas telas
- **WHEN** a equipe de um setor foi ajustada
- **THEN** o total de membros em Setores e a contagem do filtro desse setor em Colaboradores SHALL ser iguais

### Requirement: Responsável do setor
O responsável manual de um setor SHALL continuar independente dos ajustes de equipe. Quando não houver responsável manual, o responsável automático SHALL ser escolhido entre a equipe efetiva.

#### Scenario: Supervisor excluído não vira responsável automático
- **WHEN** a única pessoa de grupo de supervisão do setor é excluída da equipe e não há responsável manual
- **THEN** o setor SHALL ficar sem responsável automático

#### Scenario: Supervisor incluído pode ser responsável automático
- **WHEN** uma pessoa de grupo de supervisão é incluída na equipe de um setor sem responsável manual
- **THEN** ela SHALL poder ser escolhida como responsável automático desse setor

### Requirement: Ajuste reversível
Um ajuste SHALL poder ser desfeito individualmente, e desfazê-lo SHALL devolver a pessoa ao que o IXC indica para aquele setor.

#### Scenario: Desfazer uma exclusão
- **WHEN** um administrador desfaz a exclusão de uma pessoa do setor TI
- **THEN** a pessoa SHALL voltar à equipe do TI se o IXC a coloca nele

### Requirement: Quem pode alterar e como
Somente administradores, ou usuários com a capacidade de gestão de usuários, SHALL poder criar ou desfazer ajustes de equipe. Cada alteração SHALL exigir confirmação explícita antes de gravar e SHALL gerar um registro de auditoria identificando quem alterou, a pessoa, o setor e a ação.

#### Scenario: Sem permissão
- **WHEN** um usuário sem a capacidade tenta criar um ajuste
- **THEN** o sistema SHALL recusar a requisição com acesso negado

#### Scenario: Confirmação antes de gravar
- **WHEN** o administrador aciona a inclusão ou a exclusão de uma pessoa
- **THEN** a interface SHALL pedir confirmação nomeando a pessoa e o setor antes de enviar qualquer requisição
- **THEN** cancelar SHALL NOT alterar a equipe

#### Scenario: Alteração auditada
- **WHEN** um ajuste é criado ou desfeito
- **THEN** a Auditoria SHALL registrar a ação com o administrador, a pessoa e o setor

#### Scenario: Valores inválidos são recusados
- **WHEN** a requisição traz uma ação fora de incluir, excluir e desfazer, ou um identificador que não é numérico
- **THEN** o sistema SHALL recusar com erro de validação e SHALL NOT alterar nada

### Requirement: Ajuste visível como definido na intranet
Pessoas incluídas ou excluídas à mão SHALL ser identificadas, com texto e não só com cor, como "definido na intranet", e um setor com equipe ajustada SHALL ser sinalizado como tal nas telas que mostram a equipe.

#### Scenario: Marca na tela de edição
- **WHEN** o administrador abre a equipe de um setor com uma pessoa incluída à mão
- **THEN** essa pessoa SHALL aparecer com a indicação "definido na intranet", distinta de quem vem do IXC

### Requirement: O que não muda
O Plantão, o Organograma e a regra de agrupamento de ATENDIMENTO SHALL NOT ser afetados pelos ajustes de equipe.

#### Scenario: Plantão segue o departamento oficial
- **WHEN** uma pessoa é incluída ou excluída da equipe de um setor
- **THEN** a lista de pessoas disponíveis no Plantão SHALL continuar sendo calculada pelo departamento do IXC

### Requirement: Remover todos e restaurar a equipe do IXC
A edição de equipe SHALL oferecer "Remover todos", que tira da equipe do setor todas as pessoas que a compõem, e "Restaurar equipe do IXC", que desfaz de uma vez todos os ajustes do setor. Cada uma SHALL exigir uma única confirmação nomeando o setor e a quantidade de pessoas afetadas, SHALL valer como uma só operação (tudo ou nada) e SHALL gerar registro de auditoria.

#### Scenario: Remover todos
- **WHEN** o administrador confirma "Remover todos" num setor com 49 pessoas na equipe
- **THEN** a equipe efetiva do setor SHALL ficar vazia
- **THEN** as pessoas que o IXC colocou no setor SHALL passar a constar como excluídas e as que foram incluídas à mão SHALL ter o ajuste desfeito
- **THEN** o IXC SHALL permanecer inalterado

#### Scenario: Restaurar equipe do IXC
- **WHEN** o administrador confirma "Restaurar equipe do IXC" num setor com ajustes
- **THEN** a equipe efetiva SHALL voltar a ser exatamente a que o IXC indica

#### Scenario: Confirmação informa o tamanho do efeito
- **WHEN** o administrador aciona "Remover todos" ou "Restaurar equipe do IXC"
- **THEN** a interface SHALL pedir confirmação com o nome do setor e o número de pessoas afetadas antes de enviar qualquer requisição
- **THEN** cancelar SHALL NOT alterar a equipe

#### Scenario: Tudo ou nada
- **WHEN** a gravação em lote falha no meio
- **THEN** nenhum ajuste do lote SHALL ficar gravado e a interface SHALL anunciar a falha mantendo a equipe anterior

#### Scenario: Botões só quando fazem sentido
- **WHEN** a equipe do setor está vazia
- **THEN** "Remover todos" SHALL estar indisponível
- **WHEN** o setor não tem nenhum ajuste
- **THEN** "Restaurar equipe do IXC" SHALL estar indisponível

### Requirement: Edição acessível
A tela de edição de equipe SHALL permitir buscar a pessoa por nome sem diferenciar acento, SHALL ter controles com alvo de toque de no mínimo 44px, SHALL anunciar falhas de gravação a tecnologia assistiva sem usar caixas de diálogo nativas do navegador, e SHALL manter o estado anterior visível quando a gravação falhar.

#### Scenario: Falha ao salvar
- **WHEN** a gravação de um ajuste falha
- **THEN** a interface SHALL exibir a falha de forma anunciável a tecnologia assistiva
- **THEN** a equipe exibida SHALL continuar sendo a anterior à tentativa
