## Purpose

O organograma visual da Prestek: a hierarquia de áreas e sub-setores abaixo do CEO, como conteúdo editorial (JSON + localStorage), não derivado da API de setores.

## Requirements

### Requirement: Hierarquia organizacional da Prestek
O componente `OrgChart` SHALL exibir a hierarquia organizacional da Prestek Telecom conforme imagem de referência.

#### Scenario: Visualização do CEO
- **WHEN** o usuário acessa a página de Setores
- **THEN** o organograma SHALL exibir o nó raiz como "Severino Júnior" com cargo "CEO / Sócio Diretor"

#### Scenario: Áreas de primeiro nível
- **WHEN** o organograma é renderizado
- **THEN** abaixo do CEO SHALL aparecer exatamente 6 áreas: Gerente Operacional (Caroline), Supervisor Comercial (?), Supervisor Relacionamento com Cliente (Erika), Controladoria (Roberta), RH / Cultura Performance e TI / Sistemas / BI

#### Scenario: Sub-setores por área
- **WHEN** o usuário visualiza uma área de primeiro nível
- **THEN** os sub-setores definidos para essa área SHALL ser exibidos abaixo dela:
  - Gerente Operacional: NOC, Suporte Técnico, Infraestrutura, Instalação, Frota
  - Supervisor Comercial: V. PAP, V. INT, Marketing
  - Supervisor Relacionamento com Cliente: SAC / Atendimento, Retenção, Pós-Venda, Ouvidoria
  - Controladoria: Financeiro, Cobrança, Almoxarifado, Auditoria Interna, Patrimônio, Fiscal
  - RH / Cultura Performance: TST (Técnico em Segurança do Trabalho)
  - TI / Sistemas / BI: nenhum sub-setor

### Requirement: Identificação visual de staff
O organograma SHALL diferenciar visualmente as áreas de staff (RH e TI) das áreas operacionais.

#### Scenario: Linha tracejada para staff
- **WHEN** o usuário visualiza as áreas RH / Cultura Performance e TI / Sistemas / BI
- **THEN** essas áreas SHALL estar conectadas ao CEO por linhas tracejadas, em posição separada da fileira operacional

### Requirement: Preservação do estilo visual
A atualização do organograma SHALL preservar o design system Bento Blue existente.

#### Scenario: Cores e tipografia mantidas
- **WHEN** o organograma é renderizado
- **THEN** o card do CEO SHALL manter o gradiente roxo, os demais nós SHALL manter fundo dark com borda sutil, e as fontes SHALL continuar sendo "Plus Jakarta Sans" e "JetBrains Mono"

### Requirement: Responsividade
O organograma SHALL permanecer utilizável em telas de diferentes larguras.

#### Scenario: Scroll horizontal em telas pequenas
- **WHEN** o viewport é menor que a largura mínima do organograma
- **THEN** o container SHALL permitir scroll horizontal sem quebrar o layout

### Requirement: Sem alteração de backend
A implementação do organograma SHALL NOT criar ou alterar tabelas, endpoints ou dados no PostgreSQL.

#### Scenario: Dados hardcoded
- **WHEN** o componente é implementado
- **THEN** toda a estrutura hierárquica SHALL ser definida estaticamente no frontend, sem depender de `/api/setores` para montar a árvore

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
