## ADDED Requirements

### Requirement: Botão "Mais N" com alvo de toque mínimo
O botão que abre o seletor da cauda SHALL ter no mínimo 44px de altura efetiva, mesmo padrão já aplicado aos demais controles da toolbar.

#### Scenario: Alvo de toque do botão "Mais N"
- **WHEN** o botão "Mais N" é renderizado
- **THEN** sua altura efetiva é de no mínimo 44px

### Requirement: Contraste e tipografia da faixa de situação e das pílulas
A faixa de situação (Ativo/Férias/Afastado/Inativo), o botão "limpar tudo" e as pílulas de filtro ativo SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`C.ink2`) em vez de `C.muted` nos elementos onde `C.muted` representa texto real, não ícone inativo ou placeholder.

Esses textos SHALL usar 13px (papel Label/Mono da rampa tipográfica), não um tamanho arbitrário fora da rampa documentada em `DESIGN.md`.

#### Scenario: Contador e "limpar tudo" legíveis nos cinco temas
- **WHEN** o contador de resultados e o botão "limpar tudo" são renderizados em qualquer tema
- **THEN** seu contraste contra o fundo é de no mínimo 4,5:1
