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

### Requirement: Composição em retrato centralizado
O card SHALL usar composição centralizada: faixa de departamento no topo, chip de situação ancorado no canto superior direito, avatar de 88px centralizado, identidade e contato centralizados abaixo dele, e as ações pareadas no rodapé.

O card SHALL NOT usar `scale` no hover. A elevação SHALL vir de `translateY`, que não altera a caixa de layout — um card que cresce dentro de um grid passa por cima dos vizinhos.

#### Scenario: Hover não desloca vizinhos
- **WHEN** o usuário passa o mouse sobre um card do grid
- **THEN** o card sobe por `translateY` e ganha sombra e borda na cor do departamento, sem alterar a área ocupada na grade

#### Scenario: Silhueta consistente com a casa
- **WHEN** o card é renderizado
- **THEN** usa raio de 20px — entre o `rounded-2xl` dos painéis e o `rounded-[24px]` dos heroes

### Requirement: Um sinal por canal visual
A faixa do topo e o anel do avatar SHALL codificar **departamento**. O chip do canto superior direito SHALL codificar **situação**.

O card SHALL NOT exibir ponto de presença sobre o avatar. Ele codificava `ativo` — um terceiro canal para o mesmo dado que o chip já diz por extenso — e, animado, emprestava a semântica de "online agora" do Slack/Teams para um dado que significa apenas "não foi desligado", além de animar `box-shadow` em todos os cards visíveis simultaneamente.

#### Scenario: Situação exibida como chip
- **WHEN** o card é renderizado
- **THEN** a situação vem de `situacaoColaborador()` e é exibida no chip, com a paleta correspondente ao tom (`ok`, `info`, `aviso`, `neutro`) derivada dos tokens de tema

#### Scenario: Nome sem metadado embutido
- **WHEN** o cadastro tem prefixo de situação no nome
- **THEN** o `<h3>` exibe apenas o nome, em capitalização de nome próprio

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
