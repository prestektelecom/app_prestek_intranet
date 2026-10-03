## ADDED Requirements

### Requirement: Filtro e contagem consideram os setores efetivos
O filtro por departamento e a contagem de cada chip SHALL usar os setores efetivos de cada pessoa, que incluem o setor do IXC com os ajustes de equipe da intranet. Uma pessoa que consta em dois setores SHALL aparecer no filtro dos dois e SHALL ser contada em cada um dos dois chips, mas SHALL ser contada uma só vez no total de pessoas.

#### Scenario: Pessoa incluída aparece no filtro do outro setor
- **WHEN** uma pessoa é incluída na equipe do setor TI e o usuário seleciona o chip TI
- **THEN** a lista SHALL conter essa pessoa

#### Scenario: Pessoa excluída some do filtro do setor
- **WHEN** uma pessoa é excluída da equipe do setor TI e o usuário seleciona o chip TI
- **THEN** a lista SHALL NOT conter essa pessoa

#### Scenario: Contagem do chip bate com a lista
- **WHEN** o usuário seleciona um chip de setor
- **THEN** a quantidade de pessoas listadas SHALL ser igual à contagem exibida no chip

#### Scenario: Rótulo do cartão mantém o setor principal
- **WHEN** uma pessoa consta em mais de um setor
- **THEN** o cartão dela SHALL exibir o setor do IXC como principal e SHALL indicar, em texto, os demais setores definidos na intranet
