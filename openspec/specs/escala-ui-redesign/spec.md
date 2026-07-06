# escala-ui-redesign Specification

## Purpose

Definir os requisitos visuais para alinhar a página "Visão Geral da Escala" (`Schedule.jsx`) ao mesmo estilo e layout das páginas Dashboard, Serviços, Colaboradores e Cobertura, adotando o padrão visual "Bento Blue" da Prestek. O escopo é estritamente de interface; o fluxo funcional e a estrutura de dados permanecem inalterados.
## Requirements
### Requirement: Paleta e Fundo da Página

A página SHALL usar o fundo azul claro Prestek `#F5F9FF` e a paleta de cores "Bento Blue" em todos os seus elementos visuais.

#### Scenario: Renderização inicial da Escala
- **WHEN** a página "Visão Geral da Escala" é carregada
- **THEN** o fundo da página é `#F5F9FF`, a fonte é "Plus Jakarta Sans", e nenhum elemento primário usa o tom âmbar `#ff8c00` como cor de marca.

### Requirement: Hero Banner

A página SHALL exibir um hero banner full-width no topo com gradiente azul e KPIs resumidos.

#### Scenario: Usuário acessa a Visão Geral da Escala
- **WHEN** a página é renderizada
- **THEN** um banner gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` é exibido abaixo do header global.
- **AND** o banner contém o título "Visão Geral da Escala", um subtítulo descritivo, e pills glassmorphism com KPIs (ex: total de plantões, colaboradores escalados, dias com cobertura, alterações no mês).
- **AND** os botões de ação (Imprimir, Exportar iCal, Ver Histórico, Auditoria) ficam posicionados dentro ou imediatamente abaixo do banner, alinhados à direita.

### Requirement: Cards Brancos com Borda Azul

Todos os cards da página (filtros, resumos, container da tabela) SHALL usar o mesmo padrão de superfície das páginas de referência.

#### Scenario: Usuário visualiza os cards da Escala
- **WHEN** os cards são renderizados
- **THEN** cada card possui fundo branco `#FFFFFF`, borda `1px solid #E4ECF5`, `border-radius: 20px`, e sombra suave azul.
- **AND** os cards não usam glassmorphism, `surface-container-*`, ou fundos warm/âmbar.

### Requirement: Botões Primários Gradiente Azul

Os botões de ação primários da página SHALL usar o gradiente azul Prestek.

#### Scenario: Usuário interage com botões de ação
- **WHEN** um botão primário (ex: "Gerenciar Plantão", "Salvar", "Auditoria") é renderizado
- **THEN** ele usa `bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white`.
- **AND** botões secundários usam fundo branco com borda azul e texto azul escuro.

### Requirement: Tabela de Escala no Tom Azul

A tabela "Escala Detalhada de Suporte" SHALL ser reestilizada para o padrão Bento Blue.

#### Scenario: Usuário visualiza a tabela de plantões
- **WHEN** a tabela é renderizada
- **THEN** o cabeçalho possui fundo `#F5F9FF` ou `#EAF4FF`, labels em caixa alta mono com cor `#475467`.
- **AND** as linhas possuem bordas `#E4ECF5` e hover `#EAF4FF`.
- **AND** o texto principal é `#0B1B2E` e o texto secundário é `#475467`.

### Requirement: Mini Calendário Azul

O mini calendário lateral SHALL usar a cor azul Prestek para estados ativos e indicadores.

#### Scenario: Usuário seleciona um dia no calendário
- **WHEN** um dia é selecionado
- **THEN** o dia possui fundo `#4A9EF5` e texto branco.
- **AND** dias com plantão exibem um dot azul.
- **AND** hover sobre dias usa fundo `#EAF4FF`.

### Requirement: Dark Mode Consistente

O dark mode da página SHALL usar tons azul/ciano em vez de âmbar.

#### Scenario: Usuário ativa o modo escuro
- **WHEN** o tema escuro é aplicado
- **THEN** a página usa fundo escuro azulado, superfícies em `#141210`/`#1c1917`, e acentos ciano `#7FD4E8`.
- **AND** nenhum elemento primário usa `#ff8c00` como cor de destaque.

### Requirement: Preservação da Estrutura Funcional

A estrutura de layout e o fluxo funcional da página SHALL ser preservados.

#### Scenario: Usuário utiliza filtros, tabs e modais
- **WHEN** o usuário interage com filtros laterais, tabs "Escala"/"Histórico", botões de ação ou modais
- **THEN** o comportamento permanece o mesmo, alterando apenas o revestimento visual.

### Requirement: Tabela de escala adaptativa
A tabela de escala/agenda SHALL se adaptar a viewports pequenas, mantendo a legibilidade dos turnos e colaboradores.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a escala é exibida como tabela completa com dias da semana e colaboradores

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela permite scroll horizontal controlado ou fixa colunas de identificação do colaborador

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a escala é exibida como lista de cards por colaborador ou por dia, com detalhes do turno visíveis

#### Scenario: Navegação entre períodos
- **WHEN** o usuário navega entre semanas ou períodos em mobile
- **THEN** os controles de navegação são grandes o suficiente para toque e não causam overflow horizontal

