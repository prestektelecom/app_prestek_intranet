## Context

Escopo P0+P1 dos relatórios de crítica (`.impeccable/critique/2026-09-12T21-43-27Z__src-components-sectors-jsx.md`, 22/40) e audit (9/20, Ruim) da Fase 7 do programa Impeccable. Decisão do Felix: P2/P3 ficam para uma rodada de polish futura.

## Decisões técnicas

### 1. Semântica de diálogo em `OrgChartEditor.jsx` (P0)

Mesmo padrão já usado em `TiSupportModal`, `ManagePlantaoModal` e `CrudModal`/`DeleteModal` (Comunicados): `useDismissable(modalRef, { open: true, onClose, lockScroll: true, closeOnOutside: true })` no painel interno (não no backdrop — o backdrop deixa de ter `onClick` manual, já que `closeOnOutside` cobre o mesmo caso via `mousedown` fora do container), mais um `trapTab` local ligado a `onKeyDown`. `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h2>`. Verificado ao vivo: Escape fecha e devolve o foco ao botão "Editar"; o foco entra no ✕ ao abrir.

### 2. CEO centralizado por padrão (P0)

`OrgChart.jsx`: o CEO fica centralizado na LARGURA TOTAL do diagrama (não na borda esquerda), então `scrollLeft: 0` (o padrão do navegador) mostra só a metade esquerda das áreas e deixa o CEO inteiro fora da viewport em mobile. Um `useEffect` com `scrollRef` centraliza a rolagem na montagem (`scrollLeft = (scrollWidth - clientWidth) / 2`). Verificado ao vivo em 360px: `scrollLeft` calculado em 450px, exatamente o centro, e o card do CEO fica inteiramente visível. A dica "← arraste para ver todas as áreas →" continua correta sem alteração de texto — antes só valia para a direita, agora vale para os dois lados.

### 3. `C.muted`/`text-muted` como texto real (P1, recorrência)

Mesma regra transversal já aplicada nas Fases 1, 3, 5 e 6: `C.muted`/`text-muted` só para ícone inativo e placeholder. Substituído por `C.ink2` (sistema de tokens JS) ou `text-faint` (sistema de variáveis CSS) em `OrgChart.jsx`, `OrgChartEditor.jsx`, `SectorCard.jsx`, `SectorRow.jsx`, `SectorsToolbar.jsx`, `SectorsStates.jsx`. Não alterado onde `C.muted` já cumpria seu papel de placeholder (ex.: `EmployeeRow`-style "sem dado" em `SectorRow.jsx`, ícones decorativos).

### 4. Tom de marca como texto, 2 instâncias (P1)

- `OrgChartEditor.jsx`: os botões "Exportar JSON" e "Salvar alterações" usavam `color: 'white'` sobre `background: C.accent` — trocado por `C.onAccent`. Medido ao vivo: 7,06:1 no AMOLED.
- `SectorsToolbar.jsx`: o toggle Cards/Lista ativo (`SEG_ATIVO`) usava `text-[var(--accent)]` sobre `bg-[var(--accent-soft)]` — trocado por `text-[var(--accent-dark)]`, o par CSS-variável equivalente ao `accentSoft`/`accentDark` já usado pela Sidebar e por `ChipButton.jsx` (Fase 6). Medido ao vivo: 4,88:1 no claro, mesma ordem de grandeza da correção do `ChipButton`.
- **Pendência registrada, não corrigida aqui**: `DirectoryToolbar.jsx` tem o MESMO `SEG_ATIVO`/`SEG_INATIVO` com o mesmo bug, ainda sem correção — só a altura (`h-9`→`h-11`) foi corrigida na Fase 6, não a cor. Registrado em `MEMORIA.md` para uma varredura futura; fora do escopo desta change (Fase 7 é Setores, não Colaboradores).

### 5. Alvos de toque (P1)

Corrigidos: `SectorsToolbar.jsx` (`SEG_BASE` `h-9`→`h-11`), `SectorCard.jsx` ("Ver mais": `after:-inset-y-[13px] after:-inset-x-2`, mesma técnica do botão de editar), `OrgChartEditor.jsx` (✕ `44×44`, `minHeight: 44` nos 3 botões do rodapé e nos 2 da aba JSON).

**Achado de verificação, não uma correção**: o botão "Editar descrição" de `SectorCard.jsx` (26×26px visualmente) já tinha `after:-inset-3` (mesma técnica da `Pilula` do Diretório, Fase 6) — testado ao vivo com `elementFromPoint` a 8px acima da caixa visual, resolve para o MESMO botão. A área de clique funcional já é ~50×50px; o achado do detector de "26×26, FAIL" é uma limitação de medição (`getBoundingClientRect()` não captura a extensão de um pseudo-elemento), não um bug real. Nenhuma mudança de código foi necessária ali.

### 6. Status inativo/afastado sem modelo (P1)

`Sectors.jsx` reaproveita `situacaoColaborador(nomeBruto, ativo)` (já testado no Diretório) para extrair o prefixo `(INATIVO)`/`(AFASTADO)`/`(FÉRIAS)` tanto do nome do setor quanto do nome do responsável, passando `ativo='S'` como padrão seguro — não existe uma flag "setor ativo" real para comparar aqui, então o efeito prático é que só o prefixo entre parênteses vira badge; a ausência de prefixo nunca gera um badge "Ativo" (evita ruído, já que a maioria dos setores é normal). `SectorCard.jsx`/`SectorRow.jsx` ganham um badge (`coresSituacao`, mesma paleta do Diretório) quando `_situacaoSetor`/`_situacaoResp` está presente. A ordenação em `Sectors.jsx` põe setores com `_situacaoSetor` sempre por último, independente do critério (nome ou membros).

### 7. Tipografia fora da rampa, parcial (P1)

10 achados locais normalizados (`DESIGN.md`: Overline 11px, Label/Mono 13px, Body 14px):

| Arquivo:contexto | Antes | Depois |
|---|---|---|
| `OrgChart.jsx` (kicker "Hierarquia Organizacional") | 10px | 11px |
| `OrgChart.jsx` (nome do CEO) | 17px | 18px (mesma convenção do nome no `EmployeeCard`, Fase 6) |
| `OrgChart.jsx` (micro-rótulo do responsável na área) | 10.5px | 11px |
| `SectorCard.jsx` (h3 do setor) | 19px | 18px |
| `SectorCard.jsx` ("Ver mais") | 12px | 13px |
| `SectorCard.jsx` (labels "Responsável"/"Equipe"/"Composição") | 10px ×3 | 13px |
| `SectorRow.jsx` (nome) | 15px | 14px |
| `SectorRow.jsx` (contagem de pessoas) | 12px | 13px |
| `SectorsToolbar.jsx` (contador) | 12px | 13px |

9 outros achados do detector (`SectorsHero.jsx`: kicker 10px/KPI 17px/subtítulo 15px; `SectorsStates.jsx`: título 15px ×2) **não entram nesta change** — são o mesmo padrão compartilhado com `TiHero`/`CoverageHero`/`DirectoryHero` e `DirectoryStates.jsx` já identificado e deferido na Fase 6, confirmado aqui byte-a-byte pelo detector.

## Fora de escopo (P2/P3, registrados em MEMORIA.md)

- `alert()` cru no `importJson` do `OrgChartEditor.jsx` (mesmo antipadrão banido desde a Fase 2).
- `<a aria-disabled>` sem `href` no botão de ligação desativado de `SectorRow.jsx`/`EmployeeRow.jsx` — mesmo padrão nos dois arquivos, VoiceOver anuncia como link comum, não desativado.
- Hover decorativo (`hover:-translate-y-[3px]`) nos nós do organograma, que não são interativos (`cursor:auto`, sem `role`/`tabindex`).
- "RECURSOS HUMANOS" e "RECURSOS HUMANOS (RH)" como entradas duplicadas no diretório de setores (provável duplicata de dado do IXC).
- `ICON_MAP` (`sectorMeta.js`) cai em ícone genérico para nomes de setor não reconhecidos.
- `podeExpandir` (`SectorCard.jsx`) usa contagem de caracteres, não largura real renderizada.
