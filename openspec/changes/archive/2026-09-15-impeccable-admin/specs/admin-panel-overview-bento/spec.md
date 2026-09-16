## REMOVED Requirements

### Requirement: KPI cards com design Bento Blue

Descrevia a paleta "Bento Blue" (azul `#4A9EF5`) abandonada — substituída pela versão que segue os tokens do tema ativo.

### Requirement: Card destaque "Gerenciar Usuários" em gradiente azul

Descrevia um gradiente azul abandonado — substituída pela versão em tons de marca.

### Requirement: Cards secundários com hover azul

Descrevia um hover azul abandonado — substituída pela versão no tom de marca.

### Requirement: Atividades Recentes com link azul

Descrevia um link azul abandonado — substituída pela versão no tom de marca calibrado para texto.

### Requirement: Ícone de log create_comunicado em azul

Descrevia uma cor azul abandonada para um único tipo de ação — substituída por um requisito de fonte única de ícone/cor válido para todas as ações.

### Requirement: Fundo do painel em azul-gelo Bento

Descrevia um fundo azul-gelo abandonado — substituída por um requisito de fundo E cabeçalho reagindo ao tema ativo.

## ADDED Requirements

### Requirement: KPI cards com o tema ativo
A seção de KPIs da Visão Geral do Painel SHALL exibir os três cartões (Usuários Ativos, Comunicações, Ações) usando os tokens do tema ativo (`useBentoTheme()`) para fundo, borda, texto e a faixa colorida de 4px no topo — nunca hex fixo.

#### Scenario: Exibição dos KPIs no tema ativo
- **WHEN** o administrador acessa a aba "Painel de Controle" em qualquer tema suportado
- **THEN** cada KPI SHALL exibir uma faixa colorida no topo derivada do tema ativo, com o rótulo e o valor passando 4,5:1 de contraste contra o próprio fundo do cartão

#### Scenario: Estado de carregamento dos KPIs
- **WHEN** os dados ainda estão sendo carregados
- **THEN** o valor SHALL exibir "—" com a mesma estilização do cartão, sem quebrar o layout

### Requirement: Card destaque "Gerenciar Usuários" com gradiente de marca legível
O card de atalho "Gerenciar Usuários" SHALL usar um gradiente derivado dos tons de marca (`accentDeep`/`accentDark`) capaz de sustentar texto branco legível em toda a sua extensão, e SHALL ser um elemento de botão alcançável por teclado.

#### Scenario: Contraste do texto em toda a extensão do gradiente
- **WHEN** o card destaque é renderizado em qualquer tema
- **THEN** o texto branco sobreposto SHALL manter ao menos 4,5:1 de contraste em qualquer ponto do gradiente, não apenas numa das extremidades

#### Scenario: Interação com o card destaque por teclado
- **WHEN** o administrador navega até o card por Tab e pressiona Enter ou Espaço
- **THEN** a aba SHALL trocar para `abaAtiva === 'usuarios'`, com o mesmo efeito de um clique

### Requirement: Cards secundários com hover no tom de marca
Os cards secundários da seção de atalhos SHALL usar a variante "dark" do tom de marca (ex.: `accentDark`) para bordas e realces de hover, nunca um tom cru sem calibração de contraste, e SHALL ser elementos de botão alcançáveis por teclado.

#### Scenario: Hover nos cards secundários
- **WHEN** o administrador passa o mouse ou navega por teclado até um card secundário
- **THEN** a borda SHALL destacar usando o tom de marca do tema ativo

#### Scenario: Ativação por teclado
- **WHEN** um card secundário recebe foco via Tab e o usuário pressiona Enter ou Espaço
- **THEN** a ação correspondente SHALL disparar, com o mesmo efeito de um clique

### Requirement: Atividades Recentes com link no tom de marca
O link "Ver Tudo" na seção de Atividades Recentes SHALL usar um tom de marca calibrado para uso como texto (nunca o tom base reservado a preenchimentos/ícones), e SHALL ter uma área de toque de ao menos 44×44px.

#### Scenario: Link Ver Tudo legível e alcançável
- **WHEN** o administrador visualiza a seção Atividades Recentes em qualquer tema
- **THEN** o link "Ver Tudo" SHALL manter ao menos 4,5:1 de contraste contra seu fundo e uma área de toque de ao menos 44×44px

### Requirement: Ícone de ação por tipo de log, fonte única
O mapeamento de ícone/cor por tipo de ação de auditoria (`grant_admin`, `revoke_admin`, `create_comunicado`, etc.) SHALL existir em um único módulo compartilhado, consumido tanto pelo painel quanto pela tela de Auditoria, para que a mesma ação nunca seja exibida com cores divergentes entre as duas superfícies.

#### Scenario: Mesma ação, mesma cor em toda parte
- **WHEN** um log de auditoria com uma determinada ação aparece tanto na Visão Geral quanto na aba Auditoria
- **THEN** o ícone e a cor exibidos SHALL ser idênticos nas duas superfícies

### Requirement: Fundo e cabeçalho do painel reagem ao tema ativo
O elemento `<main>` e o cabeçalho fixo do painel SHALL usar os tokens do tema ativo para fundo e texto, nunca um valor de cor hardcoded independente do tema.

#### Scenario: Fundo da página admin
- **WHEN** o administrador acessa qualquer aba do painel admin em qualquer tema suportado
- **THEN** o fundo do `<main>` SHALL usar o token de fundo do tema ativo

#### Scenario: Cabeçalho legível em todo tema
- **WHEN** o administrador acessa o painel em qualquer um dos cinco temas suportados, incluindo os quatro escuros
- **THEN** o nome do produto e o nome do administrador no cabeçalho SHALL manter ao menos 4,5:1 de contraste contra o fundo do próprio cabeçalho

### Requirement: Navegação por abas alcançável em qualquer largura
Todas as seções administrativas registradas no menu SHALL permanecer alcançáveis em qualquer largura de tela suportada, sem depender exclusivamente da barra lateral de desktop.

#### Scenario: Todas as seções alcançáveis abaixo do breakpoint de desktop
- **WHEN** a largura da tela está abaixo do breakpoint em que a barra lateral de desktop é ocultada
- **THEN** a navegação alternativa SHALL expor todas as seções do menu, não apenas um subconjunto

### Requirement: Item de navegação ativo é exposto a tecnologia assistiva
O item de navegação correspondente à aba ativa SHALL ser identificado programaticamente, não apenas por cor.

#### Scenario: Leitor de tela identifica a aba ativa
- **WHEN** uma aba do painel está ativa
- **THEN** o item de navegação correspondente SHALL expor um atributo de estado "atual" reconhecível por tecnologia assistiva
