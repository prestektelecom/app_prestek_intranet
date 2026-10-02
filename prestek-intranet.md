---
tags: [projeto, prestek]
repo: https://github.com/felixskmarcio/prestek_intranet
---

# Prestek Intranet

Intranet corporativa da Prestek Telecom. React/Vite/Tailwind (front SPA em `src/`) + backend Express com PostgreSQL e Redis; integra com o banco do IXC. Código na VPS: `/root/prestek_intranet`.

## Stack & convenções
- Mobile-first, breakpoints Tailwind padrão (convenções em `AGENTS.md`)
- Componentes responsivos próprios em `src/components/responsive/`: `ResponsiveTable`, `FilterBar`, `MobileDrawer`, `PageShell`, `TouchFriendlyActions`, hook `useTouchOnly`
- Dashboard com `react-grid-layout` (layouts por breakpoint salvos no backend)
- Fontes self-hosted via @fontsource (sem CDN Google Fonts)
- Cores: #F5F9FF / #EC7D23; z-index em escala documentada (DESIGN.md §6)

## Estado atual (08/09/2026)
- Branch de trabalho: `chore/z-index-migration` (tree limpo)
- Últimos commits: migração de z-index p/ convenção documentada, print styles, fontes self-hosted, fix de contraste dark mode (WCAG AA), componente Processos + propagação de permissão admin

## Documentos do projeto
- `DESIGN.md` (paleta, z-index), `AGENTS.md` (responsividade), `CHANGELOG.md`, `CONTEXTO_IA.md`, `docs/`, `openspec/`

## Pendências
- [ ] Mesclar `chore/z-index-migration` na main (verificar se já não foi)
- [ ] Limpar arquivos soltos na raiz do repo (`tmp_check_ti.js`, `tmp_output.txt`, `lovable_keys.txt` — este último pode ter segredo, conferir)
