## Why

A Fase 7 (Setores + Organograma) do programa Impeccable rodou uma crítica dual-agent (`.impeccable/critique/2026-09-12T21-43-27Z__src-components-sectors-jsx.md`, 22/40, Aceitável) e um audit técnico (9/20, Ruim, 45%) sobre `src/components/Sectors.jsx`, `src/components/sectors/*` e `src/components/OrgChartEditor.jsx`. Os dois relatórios encontraram 2 achados P0 (o primeiro par desde a Fase 5) e 5 P1:

- **P0** — `OrgChartEditor.jsx` (o editor admin do organograma inteiro da empresa) não tinha NENHUMA semântica de diálogo: sem `role="dialog"`, sem `aria-modal`, Escape não fechava, o foco não entrava nele ao abrir e Tab escapava do diálogo para a página por trás. Confirmado de forma independente pelos dois assessments. Pior que os achados equivalentes já corrigidos nas Fases 4 e 5.
- **P0** — o nó do CEO no organograma ficava fora da tela por padrão em mobile: `scrollWidth` de 1148px contra `clientWidth` de 248px, com o CEO centralizado na largura total (~x452–692) e a rolagem padrão começando em 0. A dica existente ("← arraste para ver todas as áreas →") só descrevia ver mais áreas, não que a própria raiz estava fora da tela.
- **P1** — `C.muted`/`text-muted` usado como texto real (rótulos "Responsável"/"Equipe"/"Composição", textos de estado, contador, micro-rótulos do organograma), medido a 2,85-3,0:1 no tema claro — recorrência do antipadrão mais repetido do programa.
- **P1** — tom de marca usado diretamente como texto em 2 lugares: os dois botões primários do `OrgChartEditor` (`color:'white'` em vez de `C.onAccent`) e o toggle Cards/Lista ativo do `SectorsToolbar` (`text-[var(--accent)]` sobre `bg-[var(--accent-soft)]`, 2,6:1) — o mesmo padrão do `DirectoryToolbar.jsx`, ainda não corrigido lá (ver Pendências).
- **P1** — alvos de toque abaixo de 44px em 5 controles: o toggle Cards/Lista (36px), 29 botões de editar descrição por card (26×26px, embora com técnica de expansão de alvo que se mostrou funcional na verificação — ver design.md), o toggle "Ver mais" (67×18px), o ✕ do editor (24×24px) e os 3 botões do rodapé/aba JSON do editor (40-42px).
- **P1** — status inativo/afastado vazando como texto cru sem modelo: `"(INATIVO) AUDITORIA DE CONTRATOS"` como nome de setor (ordenava alfabeticamente ANTES de qualquer setor ativo) e `"(AFASTADO) JOYCE..."` como nome de responsável, sem nenhum tratamento equivalente ao que o Diretório já tem desde a Fase 6.
- **P1** — 10 tamanhos de fonte fora da rampa, locais a esta superfície (não compartilhados com as telas irmãs — 9 outros achados do detector eram o mesmo padrão de hero/estados já visto em `TiHero`/`CoverageHero`/`DirectoryHero`/`SectorsStates`+`DirectoryStates`, fora de escopo pelo mesmo motivo da Fase 6).

Por decisão do Felix (2026-09-12), o escopo desta change é P0 + P1.

## What Changes

- `OrgChartEditor.jsx`: ganha `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `useDismissable` (Escape, clique fora, foco de entrada/retorno, trava de scroll) e um trap de Tab local — mesmo padrão já usado em `TiSupportModal`, `ManagePlantaoModal` e `CrudModal`/`DeleteModal` (Comunicados).
- `OrgChart.jsx`: o container de rolagem centraliza no CEO ao montar (`scrollLeft = (scrollWidth - clientWidth) / 2`), em vez de abrir sempre em `scrollLeft: 0`.
- `Sectors.jsx`: reaproveita `situacaoColaborador` (já usado pelo Diretório) para extrair o prefixo de situação do nome do setor e do responsável; setores com situação não-"Ativo" vão para o fim da ordenação, independente do critério escolhido.
- `SectorCard.jsx`, `SectorRow.jsx`: exibem um badge de situação (mesma paleta `coresSituacao` do Diretório) quando o setor ou o responsável tem uma situação não-"Ativo".
- `C.muted`/`text-muted` → `C.ink2`/`text-faint` nos textos reais de `OrgChart.jsx`, `OrgChartEditor.jsx`, `SectorCard.jsx`, `SectorRow.jsx`, `SectorsToolbar.jsx`, `SectorsStates.jsx`.
- `color:'white'`/`text-[var(--accent)]` → `C.onAccent`/`text-[var(--accent-dark)]` em `OrgChartEditor.jsx` e `SectorsToolbar.jsx`.
- Alvos de toque corrigidos para 44px em `SectorsToolbar.jsx` (toggle), `SectorCard.jsx` ("Ver mais", com a mesma técnica de pseudo-elemento já usada no botão de editar) e `OrgChartEditor.jsx` (✕ e rodapé).
- 10 tamanhos de fonte locais normalizados para a rampa (11/13/14/18px, ver design.md).

## Capabilities

### Modified Capabilities

- `organograma-prestek`: adiciona requisito de CEO visível por padrão em qualquer largura, e de contraste/tipografia dos textos locais do organograma.

### New Capabilities

- `orgchart-editor`: primeira spec para `OrgChartEditor.jsx` — semântica de diálogo, contraste e área de toque.
- `setores-diretorio`: primeira spec para o diretório de setores (`Sectors.jsx`, `SectorCard.jsx`, `SectorRow.jsx`, `SectorsToolbar.jsx`) — modelo de situação, contraste, tipografia e área de toque.

## Impact

- **`src/components/OrgChartEditor.jsx`**: semântica de diálogo, contraste, área de toque.
- **`src/components/sectors/OrgChart.jsx`**: centralização de rolagem, contraste, tipografia local.
- **`src/components/Sectors.jsx`**: enriquecimento com situação, ordenação.
- **`src/components/sectors/SectorCard.jsx`**, **`SectorRow.jsx`**: badge de situação, contraste, tipografia, área de toque.
- **`src/components/sectors/SectorsToolbar.jsx`**: contraste, tipografia.
- **`src/components/sectors/SectorsStates.jsx`**: contraste (não o tamanho do título, compartilhado com `DirectoryStates.jsx`).
- Nenhuma alteração de API ou banco de dados.
