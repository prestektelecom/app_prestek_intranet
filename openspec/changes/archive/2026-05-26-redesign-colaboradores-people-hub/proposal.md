## Why

A aba "Colaboradores" atual (`Directory.jsx`) usa cards genéricos, paginação numérica simples e um filtro via `<select>` sem identidade visual — não reflete o padrão premium do Dashboard e Login (glassmorphism, hero banner, acento azul #4A9EF5). Com centenas de colaboradores e a ação principal sendo **contatar** (email, telefone), a UX precisa ser mais fluída, visual e orientada a ação.

## What Changes

- **Substituir** o header simples por um **Hero Banner** com gradiente azul (idêntico ao Dashboard), busca inline e KPIs (total, ativos, departamentos)
- **Substituir** o filtro `<select>` por **chips horizontais scrolláveis** com contador de membros por departamento
- **Redesenhar** os cards de colaboradores com: borda colorida por departamento, avatar com ring colorido, indicador de presença pulsante e ações de contato visíveis no hover (email + telefone)
- **Substituir** a paginação numérica por **scroll infinito** (Intersection Observer API), carregando +16 cards ao chegar no final da lista
- **Adicionar** sistema de **cores por departamento** consistente com a paleta do projeto (#4A9EF5 azul, #7FD4E8 cyan, #D97706 âmbar, #1F8A5B verde, #8B5CF6 violeta, #E84545 coral)
- **Adicionar** micro-animações de entrada escalonadas (`animation-delay`) nos cards ao carregar/filtrar
- Manter toda a lógica de dados existente (fetch, resolvers, sessionStorage filter)

## Capabilities

### New Capabilities

- `people-hub-hero`: Banner hero com busca inline, KPIs de métricas (total, ativos, departamentos) e gradiente da paleta do sistema
- `department-chip-filter`: Filtro visual em chips scrolláveis horizontais com badge de contagem por departamento
- `employee-card-v2`: Card redesenhado com borda/ring colorido por departamento, hover reveal de ações de contato e indicador de presença pulsante
- `infinite-scroll-directory`: Scroll infinito via Intersection Observer substituindo a paginação numérica

### Modified Capabilities

- Sem modificação de specs existentes

## Impact

- **Arquivo principal**: `src/components/Directory.jsx` (reescrita completa do JSX/CSS-in-JS)
- **Dependências existentes mantidas**: `utils/avatarPngs.js`, `/api/colaboradores`, `/api/departamentos-empresa`, `/api/cargos`, `/api/departamentos`
- **Sem novas dependências** de terceiros — Intersection Observer é nativo
- **Sem breaking changes** de API ou props (`user`, `setCurrentView` mantidos)
- **CSS**: uso exclusivo de inline styles / Tailwind classes já disponíveis no projeto
