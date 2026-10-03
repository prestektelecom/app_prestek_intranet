## ADDED Requirements

### Requirement: Setores reflete a equipe efetiva
O total de membros e o responsável automático de cada setor SHALL ser calculados sobre a equipe efetiva, isto é, a equipe do IXC com os ajustes feitos na intranet. Um setor cuja equipe foi ajustada à mão SHALL ser sinalizado com texto na tela de Setores.

#### Scenario: Total acompanha o ajuste
- **WHEN** uma pessoa é incluída na equipe de um setor
- **THEN** o total de membros desse setor em Setores SHALL aumentar em um

#### Scenario: Setor ajustado é sinalizado
- **WHEN** um setor tem ao menos um ajuste de equipe em vigor
- **THEN** o cartão do setor SHALL indicar, em texto, que a equipe foi ajustada na intranet

#### Scenario: Setor sem ajuste não ganha marca
- **WHEN** um setor não tem nenhum ajuste de equipe
- **THEN** o cartão do setor SHALL NOT exibir a indicação de equipe ajustada
