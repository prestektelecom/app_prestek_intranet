# comunicados-bento-hero Specification

## Purpose
Hero da página de Comunicados: gradiente, KPIs e campo de busca. Nota: descreve a paleta "Bento Blue" (azul), já substituída pela marca laranja; vale como registro histórico, não como o estado atual do tema.

## Requirements

### Requirement: Hero banner com identidade Bento Blue
A página de Comunicados SHALL renderizar um hero banner com gradiente azul (`accentDeep → accentDark → accent`), SVG grid pattern com opacidade 12%, dois blur orbs posicionados (topo-direito e rodapé-direito) e conteúdo relativo sobre o gradiente.

#### Scenario: Renderização do hero
- **WHEN** o usuário acessa a página de Comunicados
- **THEN** o hero banner exibe gradiente azul profundo com grid SVG e blur orbs visíveis

### Requirement: KPI pills glassmorphism no hero
O hero SHALL exibir pills de contagem com `background: rgba(255,255,255,0.18)`, `backdropFilter: blur(6px)` e `border: 1px solid rgba(255,255,255,0.25)` mostrando: Total de comunicados, quantidade de Urgentes, Importantes e Gerais.

#### Scenario: Contagem correta por tipo
- **WHEN** existem comunicados de tipos variados carregados da API
- **THEN** cada pill exibe a contagem correta do respectivo tipo com ícone Material Symbols

#### Scenario: Loading state das pills
- **WHEN** a requisição à API ainda está em andamento
- **THEN** as pills exibem "···" como valor de contagem

### Requirement: Campo de busca glassmorphism no hero
O hero SHALL incluir um campo de busca inline com `background: rgba(255,255,255,0.15)`, `backdropFilter: blur(8px)`, borda branca translúcida, ícone de lupa à esquerda e placeholder "Buscar por título ou conteúdo...".

#### Scenario: Busca por título
- **WHEN** o usuário digita texto no campo de busca do hero
- **THEN** os comunicados exibidos são filtrados para aqueles cujo título ou descrição contém o texto digitado (case-insensitive)

#### Scenario: Limpar busca
- **WHEN** o campo de busca tem texto e o usuário clica no botão ✕
- **THEN** o campo é limpo e todos os comunicados são exibidos novamente

### Requirement: Botão "Novo Comunicado" no hero (admin)
Para usuários com `user.is_admin === true`, o hero SHALL exibir um botão "Novo Comunicado" com estilo glassmorphism branco translúcido, posicionado no canto superior direito do hero.

#### Scenario: Visibilidade para admin
- **WHEN** o usuário autenticado tem `is_admin === true`
- **THEN** o botão "Novo Comunicado" é visível no hero banner

#### Scenario: Invisibilidade para não-admin
- **WHEN** o usuário autenticado tem `is_admin !== true`
- **THEN** o botão "Novo Comunicado" não é renderizado
