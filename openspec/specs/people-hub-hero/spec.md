# people-hub-hero Specification

## Purpose
TBD - created by archiving change redesign-colaboradores-people-hub. Update Purpose after archive.
## Requirements
### Requirement: Hero banner com busca e métricas
O componente `Directory` SHALL exibir um hero banner no topo da página com gradiente azul idêntico ao Dashboard (`linear-gradient(120deg, #1F5BA8, #2D7BD4, #4A9EF5)`), contendo: título "Colaboradores", campo de busca inline estilizado com glassmorphism, e 3 KPIs (total de colaboradores, total ativos, total de departamentos).

#### Scenario: Hero renderizado ao acessar a aba
- **WHEN** o usuário navega para a aba Colaboradores
- **THEN** o hero banner é exibido com gradiente azul, grid pattern SVG e orbs de blur visíveis

#### Scenario: Busca no hero filtra colaboradores
- **WHEN** o usuário digita no campo de busca dentro do hero
- **THEN** a lista de colaboradores é filtrada em tempo real por nome, ramal ou email

#### Scenario: KPIs refletem dados reais
- **WHEN** os dados de colaboradores são carregados com sucesso
- **THEN** os 3 KPIs exibem valores corretos: total geral, total com `ativo='S'`, e contagem de departamentos únicos

