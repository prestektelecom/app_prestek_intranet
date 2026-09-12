## Why

A Fase 6 (Colaboradores) do programa Impeccable rodou uma crítica dual-agent (`.impeccable/critique/2026-09-12T20-49-34Z__src-components-directory-jsx.md`, 25/40, Aceitável) e um audit técnico (14/20, Bom) sobre `src/components/Directory.jsx` e `src/components/directory/*`. Pela primeira vez no programa, nenhum achado chegou a P0 — mas 4 achados P1:

- **P1** — o KPI "Ativos" do hero (170, derivado da flag crua `ativo`) discordava do chip de situação "Ativo" (163, derivado do prefixo no nome) na mesma tela ao mesmo tempo. O código já documenta casos reais de divergência entre as duas fontes (Joyce: `ativo='S'` mas "(AFASTADO)"; Michele: o inverso) — só o chip tinha sido reconciliado. Também só o KPI "Departamentos" reagia à busca; "Colaboradores"/"Ativos" ficavam congelados.
- **P1** — a ordem padrão da lista (sem filtro) mostra quem está afastado/inativo antes de quem está ativo — a base real tem 327 de 490 pessoas fora da empresa hoje, e a tarefa dominante da tela é achar um colega que trabalha aqui.
- **P1** — `C.muted`/`text-muted` usado como cor de texto real abaixo de 14px em `GrupoSecao.jsx`, `DirectoryStates.jsx`, `DirectoryToolbar.jsx` e `Directory.jsx` — medido a 2,8:1 ao vivo. 4ª recorrência do mesmo antipadrão já corrigido no chrome, Dashboard e Comunicados (regra transversal documentada em `programa-impeccable/tasks.md`).
- **P1** — 14 tamanhos de fonte fora da rampa documentada em `DESIGN.md` (11/13/14px), confirmados pelo detector determinístico e pela evidência de navegador (3 achados adicionais eram falso-positivo de ícone).

Por decisão do Felix (2026-09-12), o escopo desta change é P1. Os achados P2 (`"Sem contato cadastrado"` ao lado de um botão de WhatsApp funcional, hierarquia de heading pulando h2) e P3 (nomes de produção sem sanitização, neumorfismo quase invisível no AMOLED, placeholder cortado a 360px) ficam registrados em `MEMORIA.md` para uma rodada de polish futura.

Também descoberto e corrigido no caminho, fora do escopo dos dois relatórios mas coberto pela mesma regra de área de toque (`AGENTS.md`): o botão "Mais N" do seletor de departamentos da cauda (`SeletorCauda`) media 38px de altura.

Uma descoberta separada não virou correção: os valores de 10px (kicker), 17px (KPI) e 15px (subtítulo) do hero, e os de 15px/13px dos estados de erro/vazio, são um padrão **compartilhado, não local** — copiado verbatim de `TiHero.jsx`/`CoverageHero.jsx`/`ServicesHero.jsx` e `SectorsStates.jsx` respectivamente. Corrigi-los só aqui quebraria a consistência com as telas irmãs; ficam registrados como um novo achado transversal para a Fase 16.

## What Changes

- `Directory.jsx`: KPI "Ativos" passa a contar por `_situacao.rotulo === 'Ativo'` (a mesma fonte do chip), e os três KPIs do hero passam a escopar por `colaboradoresPorBusca` (resultado da busca), não pelo total bruto.
- `Directory.jsx`: `colaboradoresFiltrados` ganha uma ordenação estável por situação (Ativo → Férias → Afastado → Inativo → desconhecida), usando a mesma ordem já documentada em `SITUACOES_FILTRO`; pulada quando um chip de situação específico já filtra o resultado.
- `GrupoSecao.jsx`, `DirectoryStates.jsx`, `DirectoryToolbar.jsx`, `Directory.jsx`: troca `C.muted`/`text-muted` por `C.ink2`/`text-faint` nos textos reais (contador, "limpar tudo", pílulas de filtro, mensagens de erro/vazio, rodapé "Todos os N exibidos").
- `Directory.jsx`, `DirectoryToolbar.jsx`, `EmployeeRow.jsx`, `GrupoSecao.jsx`: 11 tamanhos de fonte arbitrários normalizados para a rampa (11/13/14px), preservando o papel semântico de cada texto (rótulo, mono, corpo).
- `DirectoryToolbar.jsx`: botão "Mais N" do seletor de departamentos vai de 38px para 44px de altura.

## Capabilities

### Modified Capabilities

- `people-hub-hero`: adiciona requisito de consistência do KPI "Ativos" com o chip de situação, e de escopo por busca dos três KPIs.
- `infinite-scroll-directory`: adiciona requisito de ordenação padrão (ativos primeiro) e de contraste/tipografia do contador e do rodapé da lista.
- `department-chip-filter`: adiciona requisito de contraste/tipografia da faixa de situação, pílulas de filtro e botão "limpar tudo", e de área de toque do seletor da cauda.
- `directory-densidade`: adiciona requisito de contraste/tipografia da visão em lista (`EmployeeRow`) e do cabeçalho de grupo (`GrupoSecao`).

## Impact

- **`src/components/Directory.jsx`**: cálculo de KPIs, ordenação do resultado filtrado, dois textos (rodapé, "carregando mais").
- **`src/components/directory/DirectoryToolbar.jsx`**: contador, separador, "limpar tudo", pílulas, botão "Mais N" do `SeletorCauda`.
- **`src/components/directory/EmployeeRow.jsx`**: nome, badge de departamento, chip de situação.
- **`src/components/directory/GrupoSecao.jsx`**: cabeçalho de grupo.
- **`src/components/directory/DirectoryStates.jsx`**: textos de `ErrorState` e `EmptyState`.
- Nenhuma alteração de API ou banco de dados.
