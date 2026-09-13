## ADDED Requirements

### Requirement: KPI "Pendentes" consistente com o filtro
O KPI "Pendentes" do hero SHALL contar estritamente os registros cuja categoria de status seja `pendente`, a mesma base usada pelo filtro "Pendentes" — não SHALL incluir registros `cancelado`.

#### Scenario: Hero e filtro concordam
- **WHEN** existe pelo menos um chamado com status `cancelado`
- **THEN** o KPI "Pendentes" não inclui esse chamado na contagem, e o filtro "Cancelados" o exibe separadamente

### Requirement: Pills de filtro acessíveis e com contraste correto
Os pills de filtro de status SHALL expor `aria-pressed` refletindo o estado ativo, SHALL exibir um indicador de foco visível ao navegar por teclado, e SHALL ter área de toque efetiva de no mínimo 44px.

O pill no estado ativo SHALL usar um tom de texto que passa 4,5:1 de contraste em todos os cinco temas (`C.onAccent`), não um token que só coincide com o valor correto em alguns temas.

#### Scenario: Pill ativo legível nos cinco temas
- **WHEN** um pill de filtro está no estado ativo, em qualquer tema
- **THEN** seu contraste de texto contra o fundo é de no mínimo 4,5:1

#### Scenario: Estado do pill anunciado
- **WHEN** um leitor de tela encontra um pill de filtro
- **THEN** o estado ativo/inativo é anunciado via `aria-pressed`
