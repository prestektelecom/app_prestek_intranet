# employee-card-v2 Specification

## Purpose
O card de colaborador da visão em grid: identidade visual do setor, estado do vínculo e caminho até o contato. É a unidade de varredura da tela — precisa ser legível nos cinco temas e operável sem mouse.

## Requirements

### Requirement: Duas rampas de cor por departamento
O módulo `src/components/directory/deptColors.js` SHALL definir, para cada departamento, três hex: `tintaClara`, `tintaEscura` e `marca`.

`tinta*` é usada como **cor de texto** (badge de departamento, chip ativo) e SHALL manter no mínimo **4,5:1** contra `C.surface` do tema ativo. `marca` é usada na faixa superior e na borda esquerda do card — componente de UI não-textual — e SHALL manter no mínimo **3:1** contra `C.surface` em todos os temas.

Um único hex por departamento SHALL NOT ser usado para os dois papéis: os requisitos de contraste são diferentes (4,5:1 vs 3:1) e nenhum valor único atende ambos nos cinco temas.

#### Scenario: Badge legível no tema claro
- **WHEN** um card de qualquer um dos oito departamentos é renderizado no tema light
- **THEN** o texto do badge usa `tintaClara` e atinge no mínimo 4,5:1 contra `#FFFFFF`

#### Scenario: Badge legível nos temas escuros
- **WHEN** o mesmo card é renderizado em cyber, aurora ou amoled
- **THEN** o texto do badge usa `tintaEscura` e atinge no mínimo 4,5:1 contra a superfície do tema

#### Scenario: Faixa e borda perceptíveis
- **WHEN** o card é renderizado em qualquer tema
- **THEN** a faixa de 4px e a borda esquerda usam `marca` e atingem no mínimo 3:1 contra a superfície

### Requirement: Departamento resolvido por palavra e sem acento
`deptColors.js` SHALL normalizar o nome do departamento com `.normalize('NFD')`, remoção de diacríticos e remoção de pontos antes de comparar, e SHALL casar as chaves com limite de palavra, não como substring.

#### Scenario: Substring não sequestra o departamento
- **WHEN** o departamento se chama "Marketing" ou "Logística"
- **THEN** recebe a cor de Comercial e de Frota respectivamente, e não a de TI (ambos contêm a substring "ti")

#### Scenario: Acento não impede o match
- **WHEN** o departamento se chama "Suporte Técnico"
- **THEN** casa com a entrada de Atendimento, em vez de cair no neutro

#### Scenario: Variantes de grafia de TI
- **WHEN** o departamento se chama "TI", "T.I.", "Setor de T.I" ou "NOC"
- **THEN** todas resolvem para o mesmo departamento

### Requirement: Ações de contato operáveis sem mouse
As ações de contato SHALL ser visíveis por padrão. A revelação por hover SHALL ser aplicada apenas dentro de `@media (hover: hover) and (pointer: fine)`, e nesse ramo SHALL incluir `:focus-within` junto de `:hover`.

A regra inversa — esconder por padrão e reexibir em `(hover: none) and (pointer: coarse)` — SHALL NOT ser usada: não cobre dispositivos híbridos (notebook com touchscreen e mouse conectado, que reporta `hover: hover, pointer: fine`).

#### Scenario: Navegação por teclado revela as ações
- **WHEN** o usuário tabula até um elemento dentro do card
- **THEN** as ações do card ficam visíveis (`opacity: 1`), satisfazendo a SC 2.4.7

#### Scenario: Dispositivo sem hover confiável
- **WHEN** o card é renderizado num dispositivo que não reporta `hover: hover` e `pointer: fine`
- **THEN** as ações já estão visíveis sem qualquer interação

#### Scenario: Alvo de ação com 44px
- **WHEN** a ação de contato é renderizada
- **THEN** tem no mínimo 44px de altura efetiva

#### Scenario: Ausência de contato é anunciada
- **WHEN** o colaborador não tem celular nem ramal
- **THEN** a ação recebe `aria-disabled="true"` e o clique é prevenido

### Requirement: E-mail como link e sem truncamento artificial
A linha de e-mail SHALL ser o próprio `<a href="mailto:">`, dispensando um botão duplicado na barra de ações. O e-mail SHALL NOT ter largura máxima fixa em pixels — o truncamento é responsabilidade do container.

#### Scenario: Clique no e-mail abre o cliente de correio
- **WHEN** o usuário clica no e-mail exibido no card
- **THEN** o `mailto:` é acionado

### Requirement: Um sinal por canal visual
O anel do avatar, a tarja esquerda e a faixa do topo SHALL codificar **departamento**. O chip do canto superior direito SHALL codificar **situação**.

O card SHALL NOT exibir ponto de presença sobre o avatar. Ele codificava `ativo` — um terceiro canal para o mesmo dado que o chip já diz por extenso — e, animado, emprestava a semântica de "online agora" do Slack/Teams para um dado que significa apenas "não foi desligado", além de animar `box-shadow` em todos os cards visíveis simultaneamente.

#### Scenario: Situação exibida como chip
- **WHEN** o card é renderizado
- **THEN** a situação vem de `situacaoColaborador()` e é exibida no chip, com a paleta correspondente ao tom (`ok`, `info`, `aviso`, `neutro`) derivada dos tokens de tema

#### Scenario: Nome sem metadado embutido
- **WHEN** o cadastro tem prefixo de situação no nome
- **THEN** o `<h3>` exibe apenas o nome, em capitalização de nome próprio

### Requirement: Estilo de borda em longhand
O card SHALL definir a borda apenas com propriedades longhand (`borderStyle`, `borderColor`, `borderWidth`, `borderLeftColor`), e SHALL NOT combinar o shorthand `border` com `borderLeft` no mesmo objeto de estilo inline.

A combinação funciona na primeira renderização, porque o React aplica as chaves na ordem do objeto, mas quebra na atualização: quando apenas `hover` muda, o diff contém só `border`, o React executa `style.border = ...` e o shorthand zera `border-left-width` de volta para 1px — `borderLeft` não é reaplicado porque não mudou.

#### Scenario: Tarja sobrevive ao hover
- **WHEN** o usuário passa o mouse sobre um card e retira
- **THEN** a tarja de 4px na cor do departamento continua visível

### Requirement: Ausência de contato é explícita
Quando o colaborador não tem e-mail, ramal nem celular, o card SHALL exibir "Sem contato cadastrado" e SHALL NOT renderizar a barra de ações.

O bloco de contato SHALL NOT ser renderizado vazio.

#### Scenario: Colaborador sem nenhum contato
- **WHEN** não há e-mail, ramal nem celular
- **THEN** uma linha com ícone e o texto "Sem contato cadastrado" é exibida, e nenhuma ação desabilitada aparece

#### Scenario: Só e-mail disponível
- **WHEN** há e-mail mas não há celular nem ramal
- **THEN** a ação principal vira "Enviar e-mail"

### Requirement: Departamento canônico no card
O nome de departamento exibido no card SHALL ser o mesmo que rotula o chip correspondente na toolbar, resolvido a partir do id canônico.

Sem isso, um chip "ATENDIMENTO (68)" que agrega os ids 13, 15 e 68 devolvia cards rotulados "SUPORTE" e "RELACIONAMENTO" — nenhum deles com o nome do chip clicado.

#### Scenario: Badge concorda com o chip
- **WHEN** o usuário filtra por um departamento que agrega ids mesclados
- **THEN** todos os cards exibem o mesmo nome de departamento que o chip selecionado

### Requirement: Avatar decorativo e carregado sob demanda
O `<img>` do avatar SHALL ter `alt=""`, `loading="lazy"` e `decoding="async"`.

#### Scenario: Nome não é lido duas vezes
- **WHEN** um leitor de tela lê o card
- **THEN** o nome é anunciado uma vez, pelo `<h3>`, e não também pelo `alt` do avatar

### Requirement: Elevação visível nos temas escuros
A sombra do card SHALL ser condicional ao tema: sombra preta sobre superfícies quase pretas (amoled `#0A0A0A`, cyber `#070B13`) é imperceptível e o card perde toda a elevação e o feedback de hover.

#### Scenario: Hover perceptível no amoled
- **WHEN** o usuário passa o mouse sobre um card no tema amoled
- **THEN** um halo derivado da cor `marca` do departamento é exibido, além da elevação por `translateY`
