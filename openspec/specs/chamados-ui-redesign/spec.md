# chamados-ui-redesign Specification

## Purpose

Definir os requisitos visuais para alinhar a página "Meus Chamados" (`TicketsList.jsx`) ao mesmo estilo e layout das páginas Dashboard, Serviços, Colaboradores, Cobertura, Escala, Escritórios e Processos, adotando o padrão visual "Bento Blue" da Prestek. O escopo é estritamente de interface; o fluxo funcional e a estrutura de dados permanecem inalterados.

## Requirements

### Requirement: Paleta e Fundo da Página

A página SHALL usar o fundo azul claro Prestek `#F5F9FF` e a paleta de cores "Bento Blue" em todos os seus elementos visuais.

#### Scenario: Renderização inicial de Meus Chamados
- **WHEN** a página "Meus Chamados" é carregada
- **THEN** o fundo da página é `#F5F9FF`, a fonte é "Plus Jakarta Sans", e nenhum elemento primário usa o tom âmbar como cor de marca.

### Requirement: Hero Banner

A página SHALL exibir um hero banner full-width no topo com gradiente azul e KPIs resumidos.

#### Scenario: Usuário acessa Meus Chamados
- **WHEN** a página é renderizada
- **THEN** um banner gradiente `120deg #1F5BA8 → #2D7BD4 → #4A9EF5` é exibido abaixo do header global.
- **AND** o banner contém o título "Meus Chamados", um subtítulo descritivo, tag "Suporte Técnico" e pills glassmorphism com KPIs (total, abertos, finalizados, pendentes).

### Requirement: Tabela de Chamados no Tom Azul

A tabela de chamados SHALL ser reestilizada para o padrão Bento Blue.

#### Scenario: Usuário visualiza a tabela de chamados
- **WHEN** a tabela é renderizada
- **THEN** o container possui fundo branco `#FFFFFF`, borda `#E4ECF5` e `border-radius: 20px`.
- **AND** o cabeçalho possui fundo `#F7FAFD`, labels em caixa alta com cor `#475467`.
- **AND** as linhas possuem bordas `#E4ECF5` e hover `#EAF4FF`.
- **AND** o texto principal é `#0B1B2E`, o texto secundário é `#475467` e os IDs aparecem em azul `#4A9EF5`.

### Requirement: Semântica dos Status

Os badges de status SHALL manter suas cores semânticas.

#### Scenario: Usuário visualiza o status de um chamado
- **WHEN** um badge de status é renderizado
- **THEN** "Finalizado" aparece em verde, "Aberto" em azul e "Pendente" em laranja.

### Requirement: Estados Vazio, Erro e Loading

Os estados alternativos da página SHALL ser reestilizados no padrão Bento Blue.

#### Scenario: Usuário aguarda ou encontra problemas na lista
- **WHEN** a página está carregando
- **THEN** um spinner azul `#4A9EF5` e texto `#475467` são exibidos.
- **WHEN** ocorre um erro
- **THEN** um ícone vermelho, texto `#0B1B2E`/`#475467` e um botão "Tentar Novamente" com gradiente azul são exibidos.
- **WHEN** não há chamados
- **THEN** um ícone `#8896A8` e texto `#0B1B2E`/`#475467` são exibidos.

### Requirement: Dark Mode Consistente

O dark mode da página SHALL usar tons azul/ciano em vez de âmbar.

#### Scenario: Usuário ativa o modo escuro
- **WHEN** o tema escuro é aplicado
- **THEN** a página usa fundo escuro azulado e acentos ciano `#7FD4E8`.
- **AND** nenhum elemento primário usa `#ff8c00` como cor de destaque.

### Requirement: Preservação da Estrutura Funcional

A estrutura de layout e o fluxo funcional da página SHALL ser preservados.

#### Scenario: Usuário utiliza a página de chamados
- **WHEN** a página monta ou o usuário clica em "Tentar Novamente"
- **THEN** a requisição para `/api/ixc/su-ticket/list` continua funcionando e a lista é exibida normalmente, alterando apenas o revestimento visual.
