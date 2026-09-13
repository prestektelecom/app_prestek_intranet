## 1. KPI "Pendentes" reconciliado

- [x] 1.1 `TicketsList.jsx`: KPI "Pendentes" passa a contar estritamente `status === 'pendente'`
- [x] 1.2 Verificado ao vivo com dado real: Total (1000) = Abertos (17) + Finalizados (983) + Pendentes (0), consistente

## 2. Contraste do pill de filtro ativo

- [x] 2.1 `color: isActive ? C.surface : C.ink2` → `C.onAccent : C.ink2`
- [x] 2.2 Verificado ao vivo: 6,22:1 no claro (era 2,79:1), 7,06:1 no AMOLED (sem regressão)

## 3. Acessibilidade dos pills de filtro

- [x] 3.1 `type="button"`, `aria-pressed={isActive}`, `focus-visible:ring-2`, `min-h-[44px]` nos 5 pills
- [x] 3.2 `FilterBar.jsx`: "Limpar filtros"/"Limpar" ganham alvo de 44px via `after:-inset-y-[14px] after:-inset-x-2`, mesma técnica de `Pilula`/`SectorCard`
- [x] 3.3 Achado no caminho, mesma classe: badge de contagem do botão "Filtros" mobile (`FilterBar.jsx`) também usava `C.surface` sobre `C.accent` — corrigido para `C.onAccent`
- [x] 3.4 Verificado ao vivo: altura 44px, `aria-pressed` correto, anel de foco visível ao tabular, "Limpar filtros" resolve o mesmo botão a 12px da caixa visual

## 4. Specs

- [x] 4.1 Atualizar `openspec/specs/tickets-listagem-por-os/spec.md` — requisito de consistência do KPI "Pendentes" e de contraste/acessibilidade dos pills

## 5. Verificação

- [x] 5.1 `npx vite build` sem erro
- [x] 5.2 Contraste, `aria-pressed`, foco, alvo de toque e KPI verificados ao vivo em claro e AMOLED, com dado real de produção (1000 chamados)
- [x] 5.3 `openspec validate --strict` limpo na spec tocada
