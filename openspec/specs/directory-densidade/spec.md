# directory-densidade Specification

## Purpose
A escolha de densidade da aba Colaboradores. A tarefa dominante da tela é lookup — "qual o ramal do fulano?" — e para isso um grid de cards altos é um formato ruim. A visão em lista existe para essa tarefa; o grid continua existindo para reconhecimento facial de quem é novo na empresa.

## Requirements

### Requirement: Alternância entre grid e lista
A toolbar SHALL oferecer um segmented control com duas opções, "Cards" e "Lista", usando o mesmo padrão visual já adotado em `Ti.jsx`, `Coverage.jsx` e `ServicesFilterBar.jsx`.

O grid SHALL ser o padrão para usuários sem preferência registrada.

#### Scenario: Alternar para lista
- **WHEN** o usuário aciona "Lista"
- **THEN** os colaboradores passam a ser renderizados como linhas compactas, mantendo os mesmos filtros, a mesma ordem e o mesmo scroll infinito

#### Scenario: Estado do controle é anunciado
- **WHEN** um leitor de tela encontra o segmented control
- **THEN** a opção ativa é anunciada via `aria-pressed`

### Requirement: Preferência persistida
A visão escolhida SHALL ser gravada em `localStorage` sob a chave `@Stitch:directoryView`.

#### Scenario: Preferência sobrevive ao recarregamento
- **WHEN** o usuário escolhe "Lista" e recarrega a página
- **THEN** a aba abre em lista

#### Scenario: Primeiro acesso
- **WHEN** não há valor gravado
- **THEN** a aba abre em grid

### Requirement: Paridade de dados e ações entre as visões
A linha SHALL exibir avatar, nome, departamento, ramal e e-mail, e SHALL oferecer as mesmas ações de contato do card (e-mail e WhatsApp/ligar).

Colunas secundárias SHALL ser ocultadas progressivamente em telas estreitas, em vez de comprimir a linha.

#### Scenario: Ações da linha são acessíveis
- **WHEN** a linha é renderizada
- **THEN** cada ação tem alvo de 44×44px, `aria-label` descritivo e é visível sem hover

#### Scenario: Ausência de dado é explícita
- **WHEN** o colaborador não tem ramal ou e-mail
- **THEN** a coluna exibe um travessão e a ação correspondente recebe `aria-disabled="true"`

#### Scenario: Degradação em telas estreitas
- **WHEN** a largura disponível é pequena
- **THEN** o e-mail e o badge de departamento são ocultados, preservando nome, ramal e ações

### Requirement: Grid dimensionado para caber o conteúdo
O grid SHALL usar no máximo 3 colunas (`sm:grid-cols-2 lg:grid-cols-3`) dentro do container de `max-w-[1200px]`.

Os breakpoints do Tailwind medem a viewport, mas o conteúdo vive num container ~330px mais estreito (sidebar de 248px + `px-10` do `<main>`). Com 4 colunas o card ficava com ~289px úteis e o e-mail — o dado que motiva a visita à tela — era truncado.

#### Scenario: E-mail não truncado em tela larga
- **WHEN** o grid é renderizado numa viewport de 1440px
- **THEN** são exibidas 3 colunas e o e-mail cabe sem reticências para endereços de comprimento típico

### Requirement: Tipografia da linha e do cabeçalho de grupo na rampa
Os textos da linha (`EmployeeRow`: nome, badge de departamento, chip de situação) e do cabeçalho de grupo (`GrupoSecao`) SHALL usar tamanhos da rampa tipográfica documentada em `DESIGN.md` (Overline 11px, Label/Mono 13px, Body 14px), preservando o papel semântico de cada texto.

O chip de situação da linha e o total do cabeçalho de grupo SHALL usar um tom de texto secundário com no mínimo 4,5:1 de contraste (`text-faint`) em vez de `text-muted`, onde `text-muted` representa texto real e não ícone inativo ou placeholder.

#### Scenario: Nome da linha na rampa
- **WHEN** a visão em lista é renderizada
- **THEN** o nome de cada colaborador usa 14px (papel Body), não um tamanho arbitrário fora da rampa

#### Scenario: Cabeçalho de grupo legível nos cinco temas
- **WHEN** um cabeçalho de grupo (`GrupoSecao`) é renderizado em qualquer tema
- **THEN** seu contraste contra o fundo é de no mínimo 4,5:1
