# processos-ui-redesign Specification

## Purpose

Definir os requisitos visuais para alinhar a página "Processos Operacionais" (`Processos.jsx`) ao mesmo estilo e layout das páginas Dashboard, Serviços, Colaboradores, Cobertura, Escala e Escritórios, adotando o padrão visual "Bento Blue" da Prestek. O escopo é estritamente de interface; o fluxo funcional e a estrutura de dados permanecem inalterados.
## Requirements
### Requirement: Paleta e Fundo da Página

A página SHALL usar o fundo azul claro Prestek `#F5F9FF` e a paleta de cores "Bento Blue" em todos os seus elementos visuais.

#### Scenario: Renderização inicial de Processos
- **WHEN** a página "Processos Operacionais" é carregada
- **THEN** o fundo da página é `#F5F9FF`, a fonte é "Plus Jakarta Sans", e nenhum elemento primário usa o tom âmbar `#ff8c00` como cor de marca.

### Requirement: Hero Banner

A página SHALL exibir um hero banner full-width no topo com gradiente azul e KPIs resumidos.

#### Scenario: Usuário acessa Processos Operacionais
- **WHEN** a página é renderizada
- **THEN** um banner gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` é exibido abaixo do header global.
- **AND** o banner contém o título "Processos Operacionais", um subtítulo descritivo, e pills glassmorphism com KPIs (total de processos, ativos, em revisão, categorias).
- **AND** o botão "Novo Processo" fica posicionado dentro do hero, alinhado à direita.

### Requirement: Cards Brancos com Borda Azul

Todos os cards da página (busca/filtros, resumos por categoria, container da tabela) SHALL usar o mesmo padrão de superfície das páginas de referência.

#### Scenario: Usuário visualiza os cards de Processos
- **WHEN** os cards são renderizados
- **THEN** cada card possui fundo branco `#FFFFFF`, borda `1px solid #E4ECF5`, `border-radius: 20px`, e sombra suave azul.
- **AND** os cards não usam glassmorphism, `surface-container-*`, ou fundos warm/âmbar.

### Requirement: Botões Primários Gradiente Azul

Os botões de ação primários da página SHALL usar o gradiente azul Prestek.

#### Scenario: Usuário interage com botões de ação
- **WHEN** um botão primário (ex: "Novo Processo", "Salvar") é renderizado
- **THEN** ele usa `bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white`.
- **AND** botões secundários usam fundo branco com borda azul e texto azul escuro.

### Requirement: Tabela de Processos no Tom Azul

A tabela desktop de processos SHALL ser reestilizada para o padrão Bento Blue.

#### Scenario: Usuário visualiza a tabela de processos
- **WHEN** a tabela é renderizada
- **THEN** o cabeçalho possui fundo `#F7FAFD`, labels em caixa alta com cor `#475467`.
- **AND** as linhas possuem bordas `#E4ECF5` e hover `#EAF4FF`.
- **AND** o texto principal é `#0B1B2E` e o texto secundário é `#475467`.
- **AND** IDs de processo aparecem em azul `#4A9EF5`.

### Requirement: Cards Mobile e Paginação

A lista mobile de processos e a paginação SHALL seguir o mesmo padrão visual Bento Blue.

#### Scenario: Usuário visualiza a lista mobile
- **WHEN** a lista mobile é renderizada
- **THEN** cada card possui fundo branco, borda `#E4ECF5`, hover `#F7FAFD` e IDs em azul `#4A9EF5`.
- **AND** a paginação possui fundo `#F7FAFD`, borda `#E4ECF5` e botões com hover `#EAF4FF`.

### Requirement: Modal CRUD

O modal de criação/edição de processos SHALL ser reestilizado para o padrão Bento Blue.

#### Scenario: Usuário abre o modal de novo/editar processo
- **WHEN** o modal é renderizado
- **THEN** o container possui fundo branco, borda `#E4ECF5` e `border-radius: 20px`.
- **AND** os inputs e selects possuem fundo `#F7FAFD`, borda `#E4ECF5` e foco azul `#4A9EF5`.
- **AND** o botão "Salvar" usa gradiente azul e o botão "Cancelar" usa fundo branco com borda azul.

### Requirement: Dark Mode Consistente

O dark mode da página SHALL usar tons azul/ciano em vez de âmbar.

#### Scenario: Usuário ativa o modo escuro
- **WHEN** o tema escuro é aplicado
- **THEN** a página usa fundo escuro azulado, superfícies em `#141210`/`#1c1917`, e acentos ciano `#7FD4E8`.
- **AND** nenhum elemento primário usa `#ff8c00` como cor de destaque.

### Requirement: Preservação da Estrutura Funcional

A estrutura de layout e o fluxo funcional da página SHALL ser preservados.

#### Scenario: Usuário utiliza busca, filtros, tabela e modal
- **WHEN** o usuário interage com busca, filtros por categoria, tabela, cards mobile, paginação ou modal CRUD
- **THEN** o comportamento permanece o mesmo, alterando apenas o revestimento visual.

### Requirement: Tabela de processos adaptativa
A tabela de processos SHALL se adaptar a viewports pequenas sem perder acessibilidade aos dados.

#### Scenario: Desktop
- **WHEN** a viewport é maior ou igual a `lg` (1024px)
- **THEN** a tabela de processos exibe todas as colunas disponíveis

#### Scenario: Tablet
- **WHEN** a viewport está entre `md` (768px) e `lg` (1024px)
- **THEN** a tabela mantém colunas prioritárias visíveis e permite scroll horizontal para colunas secundárias

#### Scenario: Mobile
- **WHEN** a viewport é menor que `md` (768px)
- **THEN** a tabela é convertida em lista de cards, cada um representando um processo com seus dados principais

#### Scenario: Busca e filtros
- **WHEN** a página de processos possui busca ou filtros
- **THEN** em telas pequenas os filtros são empilhados ou colapsados em um painel de filtros

