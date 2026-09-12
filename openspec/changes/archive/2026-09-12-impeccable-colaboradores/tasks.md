## 1. KPI e ordenação

- [x] 1.1 KPI "Ativos" passa a contar por `_situacao.rotulo === 'Ativo'`, a mesma fonte do chip de situação
- [x] 1.2 Os três KPIs do hero escopam por `colaboradoresPorBusca`, não pelo total bruto
- [x] 1.3 `colaboradoresFiltrados` ganha ordenação estável por situação (Ativo → Férias → Afastado → Inativo), pulada quando `situacaoFiltro` já filtra

## 2. Contraste (muted → ink2/faint)

- [x] 2.1 `GrupoSecao.jsx`: `text-muted` → `text-faint` no cabeçalho `h3`
- [x] 2.2 `DirectoryStates.jsx`: `text-muted` → `text-faint` no corpo de `ErrorState`, `EmptyState` e no botão "Limpar filtros"
- [x] 2.3 `DirectoryToolbar.jsx`: `C.muted` → `C.ink2` no contador, separador "·", e nos dois usos dentro do `SeletorCauda`
- [x] 2.4 `Directory.jsx`: `text-muted` → `text-faint` no rodapé "Todos os N exibidos" e em "carregando mais..."

## 3. Tipografia (rampa 11/13/14px)

- [x] 3.1 `Directory.jsx` (rodapé): 12px → 13px
- [x] 3.2 `DirectoryToolbar.jsx` (contador, separador, "limpar tudo", `Pilula`): 12px → 13px
- [x] 3.3 `EmployeeRow.jsx` (nome 15→14, badge de departamento 12→13, `ChipSituacao` 10→11)
- [x] 3.4 `GrupoSecao.jsx` (cabeçalho `h3`): 12px → 13px
- [x] 3.5 Confirmado fora de escopo, registrado para a Fase 16: `DirectoryHero.jsx` (kicker 10px, KPI 17px, subtítulo 15px, compartilhado com TiHero/CoverageHero/ServicesHero) e `DirectoryStates.jsx` (título 15px, compartilhado com `SectorsStates.jsx`)

## 4. Área de toque (achado no caminho)

- [x] 4.1 `SeletorCauda` (botão "Mais N"): 38px → 44px de altura

## 5. Specs

- [x] 5.1 Atualizar `openspec/specs/people-hub-hero/spec.md` — requisito de consistência do KPI "Ativos" e escopo por busca
- [x] 5.2 Atualizar `openspec/specs/infinite-scroll-directory/spec.md` — requisito de ordenação padrão e contraste/tipografia do contador/rodapé
- [x] 5.3 Atualizar `openspec/specs/department-chip-filter/spec.md` — requisito de contraste/tipografia da faixa de situação/pílulas e área de toque do `SeletorCauda`
- [x] 5.4 Atualizar `openspec/specs/directory-densidade/spec.md` — requisito de contraste/tipografia de `EmployeeRow`/`GrupoSecao`

## 6. Verificação

- [x] 6.1 `npx vite build` sem erro
- [x] 6.2 KPI "Ativos" e chip "Ativo" mostrando o mesmo número, ao vivo, claro e AMOLED
- [x] 6.3 Ordenação confirmada ao vivo: 5 primeiros itens da lista sem filtro são todos "Ativo"
- [x] 6.4 Contraste dos textos corrigidos confirmado visualmente (screenshot) em claro e AMOLED — nenhuma regressão de legibilidade
- [x] 6.5 Botão "Mais N" confirmado com 44px de altura
