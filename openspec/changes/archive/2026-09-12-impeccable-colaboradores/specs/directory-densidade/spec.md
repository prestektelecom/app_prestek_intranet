## ADDED Requirements

### Requirement: Tipografia da linha e do cabeçalho de grupo na rampa
Os textos da linha (`EmployeeRow`: nome, badge de departamento, chip de situação) e do cabeçalho de grupo (`GrupoSecao`) SHALL usar tamanhos da rampa tipográfica documentada em `DESIGN.md` (Overline 11px, Label/Mono 13px, Body 14px), preservando o papel semântico de cada texto.

O chip de situação da linha e o total do cabeçalho de grupo SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`text-faint`) em vez de `text-muted`, onde `text-muted` representa texto real e não ícone inativo ou placeholder.

#### Scenario: Nome da linha na rampa
- **WHEN** a visão em lista é renderizada
- **THEN** o nome de cada colaborador usa 14px (papel Body), não um tamanho arbitrário fora da rampa

#### Scenario: Cabeçalho de grupo legível nos cinco temas
- **WHEN** um cabeçalho de grupo (`GrupoSecao`) é renderizado em qualquer tema
- **THEN** seu contraste contra o fundo é de no mínimo 4,5:1
