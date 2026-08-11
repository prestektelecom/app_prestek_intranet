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

### Requirement: Ações sempre visíveis, nunca reveladas por hover
As ações de contato SHALL estar visíveis desde a renderização, no rodapé do card. O card SHALL NOT usar revelação por `:hover` para expor ações.

A revelação por hover foi removida junto com o layout alinhado à esquerda. Ela exigia uma media query de capacidade (`hover: hover and pointer: fine`) mais `:focus-within` só para chegar ao mesmo lugar onde a versão sempre visível chega sem nenhuma condicional — e a versão condicional é a que falha em dispositivo híbrido, como notebook com touchscreen e mouse conectado.

#### Scenario: Ação disponível sem interação
- **WHEN** o card é renderizado em qualquer dispositivo
- **THEN** as ações de contato estão visíveis e operáveis, sem hover, foco ou toque prévio

#### Scenario: Alvo e rótulo da ação
- **WHEN** uma ação é renderizada
- **THEN** tem no mínimo 44px de altura efetiva, rótulo textual visível e `aria-label` descrevendo o destinatário

### Requirement: Texto informa, botão age
As linhas de contato do corpo do card SHALL ser texto, e as ações SHALL ficar exclusivamente nos botões do rodapé. O mesmo canal de contato SHALL NOT aparecer como link no corpo e como botão no rodapé.

O e-mail SHALL truncar por responsabilidade do container, com o endereço completo em `title`, e SHALL NOT ter largura máxima fixa em pixels.

#### Scenario: E-mail legível e acionável sem duplicar afordância
- **WHEN** o colaborador tem e-mail
- **THEN** o endereço aparece como texto truncado no corpo, com `title` completo, e a ação "E-mail" aparece uma única vez, no rodapé

#### Scenario: Canal telefônico único no rodapé
- **WHEN** o colaborador tem celular e ramal
- **THEN** o rodapé exibe "WhatsApp"; havendo apenas ramal, exibe "Ligar"

### Requirement: Perfil neumórfico em retrato centralizado
O card SHALL usar composição centralizada em relevo: ponto de situação e selo no canto superior direito, avatar de 112px em berço reentrante, identidade centralizada, rótulo de situação em pílula e duas ações circulares no rodapé, tudo em `rounded-3xl`.

O relevo SHALL vir de `src/components/directory/neumorfismo.js`, e SHALL NOT ser escrito com valores literais nos componentes.

#### Scenario: Face do card acompanha o fundo
- **WHEN** o card é renderizado no tema claro
- **THEN** a face usa `C.bg`, não `C.surface` — o efeito depende de figura e fundo terem a mesma cor, senão a sombra clara não tem contra o que contrastar

#### Scenario: Relevo sobrevive ao preto absoluto
- **WHEN** o card é renderizado no tema amoled, cujo `bg` é `#000000`
- **THEN** a face sobe para `C.surfaceSoft`, para que a sombra escura tenha para onde ir

#### Scenario: Hover aprofunda o relevo
- **WHEN** o usuário passa o mouse sobre um card
- **THEN** o deslocamento e o desfoque das sombras aumentam, o avatar cresce, e uma borda na cor do departamento é revelada

#### Scenario: Crescimento no hover não invade a calha
- **WHEN** o card cresce no hover
- **THEN** o fator de escala é no máximo 1,02 — 1,05 sobre um card de ~370px consome quase um terço do `gap-8` e desalinha a fileira

### Requirement: Calha proporcional à sombra
O grid SHALL usar `gap-8`.

As sombras neumórficas se estendem cerca de 36px além da caixa (deslocamento 12 + desfoque 24). Com `gap-6` as sombras de cards vizinhos se sobrepõem e o relevo lê como borrão.

#### Scenario: Sombras não colidem
- **WHEN** o grid é renderizado com 3 colunas
- **THEN** há espaço suficiente entre os cards para cada relevo se fechar

### Requirement: Mapeamento dos slots do card de perfil
O card SHALL preencher os slots da composição com dados que existem no cadastro:

| slot | conteúdo |
|---|---|
| nome | nome sem o prefixo de situação, em capitalização de nome próprio |
| cargo | departamento, na `tinta` categórica do setor |
| linha terciária | ramal; na ausência dele, o e-mail |
| ponto de status | situação (`ok`, `info`, `aviso`, `neutro`) |
| pílula | a mesma situação, por extenso |
| selo | e-mail corporativo `@prestek.com.br` |
| ações | e-mail e WhatsApp, ou ligar para o ramal |

O ponto de status SHALL codificar situação de vínculo, e SHALL NOT ser apresentado como presença em tempo real.

#### Scenario: Selo distingue e-mail corporativo
- **WHEN** o e-mail do colaborador termina em `@prestek.com.br`
- **THEN** o selo é exibido, com o endereço completo em `title`

#### Scenario: Pulso apenas no vínculo ativo
- **WHEN** a situação é "Ativo"
- **THEN** o ponto recebe `animate-ping`, que anima `transform` e `opacity` — resolvidas pelo compositor — e é neutralizado pelo bloco global de `prefers-reduced-motion`

#### Scenario: Nome sem metadado embutido
- **WHEN** o cadastro tem prefixo de situação no nome
- **THEN** o `<h3>` exibe apenas o nome, e o prefixo aparece na pílula

### Requirement: Ação percorre a rampa do relevo
Os botões de ação SHALL ter três estados, e a sombra SHALL diminuir monotonicamente do repouso ao pressionado:

| estado | sombra | escala |
|---|---|---|
| repouso | relevo 6px/12px | 1 |
| hover / foco | relevo 3px/6px | 0,98 |
| pressionado | reentrância 4px/8px | 0,95 |

A sombra SHALL NOT aumentar no hover: numa superfície neumórfica isso lê como o botão saltando para longe do cursor, o oposto da affordance de pressionar.

O estado de foco de teclado SHALL aplicar o mesmo realce do hover, além do anel de foco.

#### Scenario: Hover afunda o botão
- **WHEN** o usuário passa o mouse sobre um botão de ação
- **THEN** a sombra encolhe, o botão reduz para 0,98, o fundo recebe tinta e o ícone cresce para 1,1

#### Scenario: Teclado recebe o mesmo feedback
- **WHEN** o botão recebe foco por `Tab`
- **THEN** o realce de hover é aplicado junto do `focus-visible:ring`

#### Scenario: Cor de realce do WhatsApp
- **WHEN** o botão do WhatsApp é destacado
- **THEN** usa `var(--success-strong)`, e SHALL NOT usar o verde de marca `#25D366` — que dá 1,88:1 sobre a face clara e reprova o piso de 3:1 da SC 1.4.11

### Requirement: Texto legível sobre a face neumórfica
Nenhum texto do card SHALL usar `C.muted`.

A face neumórfica é `C.bg` (`#F5F9FF` no tema claro), e não o branco puro. Sobre ela, `C.muted` (`#8896A8`) dá **2,85:1** — reprova a SC 1.4.3. `C.ink2` dá **7,28:1** e é visualmente quase o mesmo cinza. Isso vale em especial para a linha terciária, que carrega o ramal.

#### Scenario: Linha do ramal legível
- **WHEN** o card exibe o ramal ou o e-mail na linha terciária
- **THEN** a cor é `C.ink2`, com no mínimo 4,5:1 contra a face

#### Scenario: Tinta do departamento revalidada contra a face
- **WHEN** o nome do departamento é exibido no lugar do cargo
- **THEN** a `tinta` mantém no mínimo 4,5:1 contra a face de cada tema — medido entre 6,71 e 12,99

### Requirement: Estilo de borda em longhand
Componentes com borda dependente de estado SHALL usar apenas propriedades longhand (`borderStyle`, `borderWidth`, `borderColor`, e as variantes por lado), e SHALL NOT combinar o shorthand `border` com um longhand de lado no mesmo objeto de estilo inline.

A combinação funciona na primeira renderização, porque o React aplica as chaves na ordem do objeto, mas quebra na atualização: quando apenas `hover` muda, o diff contém só `border`, o React executa `style.border = ...` e o shorthand zera as larguras por lado — o longhand não é reaplicado porque não mudou. O sintoma observado era um card perdendo a tarja do departamento depois do primeiro hover, e apenas aquele card.

#### Scenario: Borda sobrevive ao hover
- **WHEN** o usuário passa o mouse sobre um card ou linha e retira
- **THEN** a espessura e a cor por lado permanecem as definidas, inclusive a tarja de departamento da visão em lista

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
