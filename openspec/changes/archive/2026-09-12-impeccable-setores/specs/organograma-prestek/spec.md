## ADDED Requirements

### Requirement: CEO visível por padrão em qualquer largura
O container de rolagem do organograma SHALL centralizar sua posição inicial no diagrama ao montar, para que o nó do CEO fique visível sem exigir rolagem manual, em qualquer largura de viewport.

#### Scenario: CEO visível em mobile sem rolar
- **WHEN** o organograma é renderizado numa viewport de 360px de largura
- **THEN** o card do CEO está inteiramente dentro da área visível do container de rolagem, sem exigir interação do usuário

### Requirement: Contraste e tipografia dos textos locais do organograma
Os textos do `OrgChart` que não são compartilhados com os heroes irmãos (kicker "Hierarquia Organizacional", nome do CEO, "Atualizado em", botão "Editar", hint de arrastar em mobile, micro-rótulo do responsável em cada área) SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`C.ink2`/`text-faint`) em vez de `C.muted`/`text-muted`, e SHALL usar tamanhos da rampa tipográfica documentada em `DESIGN.md` (Overline 11px, Body/título 18px).

#### Scenario: Textos do organograma legíveis nos cinco temas
- **WHEN** o organograma é renderizado em qualquer tema
- **THEN** o kicker, o nome do CEO, o texto "Atualizado em", o botão "Editar" e o hint de arrastar têm contraste de no mínimo 4,5:1 contra seus fundos
