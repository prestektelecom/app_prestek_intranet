## Context

Escopo P1 dos relatórios de crítica (`.impeccable/critique/2026-09-12T20-49-34Z__src-components-directory-jsx.md`, 25/40) e audit (14/20, Bom) da Fase 6 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. KPI "Ativos" reconciliado com o chip de situação (P1)

`kpis` (`Directory.jsx`) calculava `ativos = colaboradores.filter(c => c.ativo === 'S').length` — a flag crua do IXC. O chip de situação já usa `_situacao.rotulo === 'Ativo'`, derivado do prefixo no nome via `statusColaborador.js`, porque o próprio código documenta que a flag e o prefixo discordam em casos reais. Trocar a fonte do KPI para `_situacao.rotulo` elimina a segunda fonte de verdade. Ao mesmo tempo, `kpis` passa a derivar de `colaboradoresPorBusca` (já filtrado por busca) em vez de `colaboradores` (bruto) — o KPI "Departamentos" já reagia à busca por vir do mesmo `useMemo` dos chips; "Colaboradores"/"Ativos" ficavam presos ao total, uma inconsistência visível buscando um termo sem resultado (dois números congelados ao lado de um que zera).

### 2. Ordenação padrão: ativos primeiro (P1)

`colaboradoresFiltrados` não ordenava — a ordem vinha inalterada da API. Adiciona um `Map` de prioridade construído a partir de `SITUACOES_FILTRO` (`['Ativo', 'Férias', 'Afastado', 'Inativo']`, já a ordem em que os chips aparecem na toolbar) e um `sort` estável por essa prioridade. Situações fora do mapa (prefixo desconhecido no nome, ver `statusColaborador.js`) recebem prioridade 9 — ficam depois de todas as conhecidas. A ordenação é pulada quando `situacaoFiltro` já está ativo, porque nesse caso todo o conjunto compartilha uma única situação e ordenar não muda nada.

### 3. `C.muted`/`text-muted` como texto real (P1, recorrência)

Mesma regra transversal de `programa-impeccable/tasks.md`: `muted` é para ícone inativo/placeholder, nunca texto abaixo de 14px. No sistema de tokens JS (`useBentoTheme.js`), o substituto é `C.ink2`. No sistema de variáveis CSS (`index.css`/Tailwind, usado por `GrupoSecao.jsx`/`DirectoryStates.jsx` via `text-muted`/`text-foreground`), o par equivalente é `--foreground-faint`/`text-faint` — confirmado por medição que `--foreground-faint` tem MAIS contraste que `--foreground-muted` no tema claro (apesar do nome) e ainda passa de 4,5:1 nos quatro temas escuros (4,7-5,9:1), preservando a mesma garantia do par `ink2`/`muted` do sistema JS (os dois sistemas usam os mesmos hexadecimais por trás, só expostos de formas diferentes).

### 4. Tipografia fora da rampa (P1, parcial)

Dos 14 achados do detector, 11 são locais a este arquivo/componentes e foram normalizados para a rampa (`DESIGN.md`: Overline 11px, Label/Mono 13px, Body 14px):

| Arquivo:linha (antes) | Papel | Depois |
|---|---|---|
| `Directory.jsx` (rodapé "Todos os N exibidos") | Mono | 12px → 13px |
| `DirectoryToolbar.jsx` (contador `aria-live`) | Mono | 12px → 13px |
| `DirectoryToolbar.jsx` (separador "·") | Label | 12px → 13px |
| `DirectoryToolbar.jsx` ("limpar tudo") | Label | 12px → 13px |
| `DirectoryToolbar.jsx` (`Pilula`) | Label | 12px → 13px |
| `EmployeeRow.jsx` (nome) | Body | 15px → 14px |
| `EmployeeRow.jsx` (badge de departamento) | Label | 12px → 13px |
| `EmployeeRow.jsx` (`ChipSituacao`) | Overline | 10px → 11px |
| `GrupoSecao.jsx` (cabeçalho `h3`) | Label | 12px → 13px |

Os outros 3 (`DirectoryHero.jsx`: kicker 10px, valor de KPI 17px, subtítulo 15px; `DirectoryStates.jsx`: título de erro/vazio 15px) **não entram nesta change** — são um padrão compartilhado, copiado verbatim de `TiHero.jsx`/`CoverageHero.jsx`/`ServicesHero.jsx` (o próprio cabeçalho de `DirectoryHero.jsx` diz "reconstruído sobre os primitivos compartilhados") e `SectorsStates.jsx`. Corrigir só a cópia de Colaboradores criaria uma inconsistência nova entre telas irmãs, pior do que a violação de rampa atual. Registrado como achado transversal para a Fase 16 (`programa-impeccable/tasks.md`, seção Transversal): o kicker/KPI/subtítulo dos heroes e o título dos estados de erro/vazio precisam de uma correção coordenada nas ≥4 telas que os compartilham, não um patch isolado.

### 5. Botão "Mais N" abaixo do alvo de toque (achado no caminho)

`SeletorCauda` (`DirectoryToolbar.jsx`) tinha `h-[38px]` no botão que abre o popover de departamentos da cauda — mesma classe de violação já corrigida em 6.1 para os outros controles da toolbar (`AGENTS.md`: alvos ≥44×44px). Vai para `h-11` (44px), mesmo valor usado nos demais controles.

## Fora de escopo (P2/P3, registrados em MEMORIA.md)

- `EmployeeCard.jsx`: "Sem contato cadastrado" impresso ao lado de um botão de WhatsApp funcional (a string usa `ramal || email`, o botão usa `fone_celular` — checks independentes).
- Hierarquia de heading pulando h2 (h1 → h3 direto, em cards e cabeçalhos de grupo).
- Nomes de produção sem sanitização (") Andreliane...", "...Santos2").
- Neumorfismo do card quase invisível no AMOLED (face e fundo ambos próximos do preto).
- Placeholder da busca cortado sem reticências a 360px (mesmo padrão já visto na Fase 5, Comunicados).
- Rótulos de chip de departamento em CAIXA ALTA crua do backend, sem tratamento de copy.
