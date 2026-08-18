## MODIFIED Requirements

### Requirement: Paleta e Fundo da Página

A página SHALL usar os tokens semânticos de superfície e cor do sistema
(`bg-background`, `bg-surface`, `text-foreground`, `text-muted`,
`border-border`) em vez de valores hex fixos, de modo que o fundo e a
paleta acompanhem o tema ativo (light/cyber/aurora/amoled).

#### Scenario: Renderização inicial da Escala
- **WHEN** a página "Visão Geral da Escala" é carregada
- **THEN** o fundo da página usa o token `bg-background` do tema ativo, a
  fonte é "Plus Jakarta Sans", e nenhum elemento usa cor hex hardcoded
  fora dos tokens do design system.
- **AND** a cor de destaque (accent) segue `var(--accent)`, consistente
  com o restante do sistema (paleta laranja da marca).

### Requirement: Hero Banner

A página SHALL exibir um hero banner full-width no topo reutilizando o
gradiente compartilhado `fundoHero(C)` de `src/components/ui/heroGradiente.js`,
com KPIs resumidos.

#### Scenario: Usuário acessa a Visão Geral da Escala
- **WHEN** a página é renderizada
- **THEN** o hero usa `background: fundoHero(C)` (mesmo primitivo de
  `SectorsHero.jsx` e `CoverageHero.jsx`), calibrado para contraste WCAG
  AA (≥ 4.5:1 para texto branco sobre a parada intermediária do
  gradiente).
- **AND** o banner contém o título "Visão Geral da Escala", um subtítulo
  descritivo, e KPIs (total de plantões, dias com cobertura,
  alterações no mês ou "Meus Plantões").
- **AND** os botões de ação (Imprimir, Exportar iCal, Ver Histórico,
  Auditoria) ficam posicionados dentro ou imediatamente abaixo do
  banner, alinhados à direita.
- **AND** a decoração de fundo usa `aneisHero()`/reticula de pontos, sem
  elementos `filter: blur()` posicionados atrás do painel escuro.

### Requirement: Cards com Borda em Token Semântico

Todos os cards da página (filtros, resumos, container da tabela) SHALL
usar os tokens de superfície compartilhados pelas demais telas do
sistema.

#### Scenario: Usuário visualiza os cards da Escala
- **WHEN** os cards são renderizados
- **THEN** cada card usa `bg-surface`, `border-border` e
  `border-radius` consistente com os cards de Sectors/Coverage.
- **AND** os cards não usam glassmorphism nem cor hex fixa fora dos
  tokens do tema.

### Requirement: Botões Primários com Gradiente de Destaque

Os botões de ação primários da página SHALL usar o gradiente de accent
da marca (laranja), consistente com o restante do sistema.

#### Scenario: Usuário interage com botões de ação
- **WHEN** um botão primário (ex: "Gerenciar Plantão", "Salvar",
  "Auditoria") é renderizado
- **THEN** ele usa o gradiente de accent padrão (`from-[#9A3412]
  to-[#EC7D23]` ou equivalente via `var(--accent)`), igual ao usado em
  `SectorsStates.jsx`/`ErrorState`.
- **AND** botões secundários usam `bg-surface` com `border-border` e
  `text-muted`/`text-foreground`.

### Requirement: Tabela de Escala com Tokens Semânticos

A tabela "Escala Detalhada de Suporte" SHALL usar tokens semânticos em
vez de hex fixo.

#### Scenario: Usuário visualiza a tabela de plantões
- **WHEN** a tabela é renderizada
- **THEN** o cabeçalho usa `bg-surface` (ou `bg-surface-raised`), labels
  em caixa alta mono com `text-muted`.
- **AND** as linhas usam `border-border` e hover com `bg-surface-raised`.
- **AND** o texto principal usa `text-foreground` e o texto secundário
  usa `text-muted`.

### Requirement: Mini Calendário com Cor de Destaque do Tema

O mini calendário lateral SHALL usar o token de accent do tema ativo
para estados ativos e indicadores.

#### Scenario: Usuário seleciona um dia no calendário
- **WHEN** um dia é selecionado
- **THEN** o dia usa `var(--accent)` como fundo e texto branco.
- **AND** dias com plantão exibem um dot na cor de accent do tema.
- **AND** hover sobre dias usa `bg-surface-raised`.

### Requirement: Dark Mode Consistente

O dark mode da página SHALL usar os tokens do tema escuro ativo
(cyber/aurora/amoled) em vez de cor hex fixa.

#### Scenario: Usuário ativa o modo escuro
- **WHEN** um tema escuro é aplicado
- **THEN** a página usa `bg-background`/`bg-surface` do tema ativo para
  fundo e superfícies.
- **AND** o accent de destaque é o `var(--accent)` do tema ativo (rampa
  laranja da marca), sem hex hardcoded sobrepondo o token.

## ADDED Requirements

### Requirement: Container e Espaçamento Padronizados

A página SHALL usar o mesmo container e espaçamento de referência
adotado por Sectors, Directory, Ti e Coverage.

#### Scenario: Renderização em desktop
- **WHEN** a página é renderizada em viewport desktop
- **THEN** o container usa `max-w-[1200px]`, `px-4 md:px-10`, `py-8` e
  `gap-8`, substituindo o `max-w-[1920px] px-4 md:px-8` anterior.

### Requirement: Estados de Carregamento, Vazio e Erro Dedicados

A página SHALL usar componentes de estado dedicados (`ScheduleStates.jsx`)
em vez de skeleton genérico e blocos de empty-state duplicados entre
desktop e mobile.

#### Scenario: Carregamento dos dados de escala
- **WHEN** os dados de plantão ainda estão sendo buscados
- **THEN** o skeleton exibido (`SkeletonRow` em desktop, `SkeletonCard`
  em mobile) replica a estrutura real das colunas (Data/Dia/N1/N2/
  Supervisão), em vez de blocos genéricos.

#### Scenario: Nenhum plantão corresponde ao filtro
- **WHEN** o filtro aplicado não retorna nenhum plantão
- **THEN** um único componente `EmptyState` (parametrizado por
  `temFiltro`) é exibido, reutilizado entre a visão desktop e mobile,
  com ação para limpar o filtro quando aplicável.

#### Scenario: Falha ao carregar dados de escala
- **WHEN** a requisição a `/api/plantoes` falha
- **THEN** um componente `ErrorState` com `role="alert"` e botão "Tentar
  novamente" é exibido, substituindo o banner vermelho estático anterior.
