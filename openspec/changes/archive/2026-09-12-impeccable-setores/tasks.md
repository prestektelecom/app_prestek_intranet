## 1. Semântica de diálogo (P0)

- [x] 1.1 `OrgChartEditor.jsx`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `useDismissable` (Escape, clique fora, foco, trava de scroll) e trap de Tab local
- [x] 1.2 Verificado ao vivo: Escape fecha e devolve foco ao botão "Editar"; foco entra no ✕ ao abrir

## 2. CEO visível em mobile (P0)

- [x] 2.1 `OrgChart.jsx`: centralizar `scrollLeft` no diagrama ao montar
- [x] 2.2 Verificado ao vivo em 360px: `scrollLeft` = 450 (centro exato), CEO inteiramente visível

## 3. Contraste — muted como texto real (P1)

- [x] 3.1 `OrgChart.jsx`: subtítulo de carregamento, "Atualizado em", botão "Editar", hint mobile, micro-rótulo do responsável
- [x] 3.2 `OrgChartEditor.jsx`: subtítulo, labels dos campos (CEO e Áreas), abas inativas, "Restaurar padrão"
- [x] 3.3 `SectorCard.jsx`: "Cancelar", labels "Responsável"/"Equipe"/"Composição", "Sem responsável definido", chip "Sem grupo"/"+restante"
- [x] 3.4 `SectorRow.jsx`: contagem de pessoas
- [x] 3.5 `SectorsToolbar.jsx`: contador de resultados
- [x] 3.6 `SectorsStates.jsx`: corpo de `ErrorState`/`EmptyState`, botão "Limpar busca"

## 4. Contraste — tom de marca como texto (P1)

- [x] 4.1 `OrgChartEditor.jsx`: botões "Exportar JSON" e "Salvar alterações" (`color:'white'` → `C.onAccent`)
- [x] 4.2 `SectorsToolbar.jsx`: toggle Cards/Lista ativo (`text-[var(--accent)]` → `text-[var(--accent-dark)]`)
- [x] 4.3 Verificado ao vivo: 7,06:1 (AMOLED, editor) e 4,88:1 (claro, toggle)
- [x] 4.4 Registrado em MEMORIA.md: `DirectoryToolbar.jsx` tem o mesmo bug de cor no toggle, ainda não corrigido (só a altura foi, na Fase 6) — fora do escopo desta change

## 5. Área de toque (P1)

- [x] 5.1 `SectorsToolbar.jsx`: `SEG_BASE` `h-9` → `h-11`
- [x] 5.2 `SectorCard.jsx`: "Ver mais" ganha `after:-inset-y-[13px] after:-inset-x-2`
- [x] 5.3 `OrgChartEditor.jsx`: ✕ vai para 44×44; botões do rodapé e da aba JSON ganham `minHeight: 44`
- [x] 5.4 Verificado ao vivo (`elementFromPoint`): "Editar descrição" (26×26 visual) já resolve para o mesmo botão a 8px de distância — área funcional ~50×50, achado do detector era limitação de medição, não um bug real; nenhuma mudança necessária ali

## 6. Status sem modelo (P1)

- [x] 6.1 `Sectors.jsx`: reaproveitar `situacaoColaborador` para extrair situação do nome do setor e do responsável
- [x] 6.2 `SectorCard.jsx`/`SectorRow.jsx`: badge de situação (`coresSituacao`, mesma paleta do Diretório)
- [x] 6.3 Ordenação: setores com situação não-"Ativo" sempre por último
- [x] 6.4 Verificado ao vivo: "Auditoria de Contratos" (antes primeiro, alfabético) agora é o último item, com badge "Inativo"

## 7. Tipografia (rampa 11/13/14/18px)

- [x] 7.1 `OrgChart.jsx` (kicker 10→11, nome do CEO 17→18, micro-rótulo 10.5→11)
- [x] 7.2 `SectorCard.jsx` (h3 19→18, "Ver mais" 12→13, labels 10→13 ×3)
- [x] 7.3 `SectorRow.jsx` (nome 15→14, contagem 12→13)
- [x] 7.4 `SectorsToolbar.jsx` (contador 12→13)
- [x] 7.5 Confirmado fora de escopo, registrado para a Fase 16: `SectorsHero.jsx` (compartilhado com TiHero/CoverageHero/DirectoryHero) e `SectorsStates.jsx` (compartilhado com `DirectoryStates.jsx`)

## 8. Specs

- [x] 8.1 Atualizar `openspec/specs/organograma-prestek/spec.md` — requisito de CEO visível por padrão e de contraste/tipografia local
- [x] 8.2 Criar `openspec/specs/orgchart-editor/spec.md` — primeira spec do editor admin
- [x] 8.3 Criar `openspec/specs/setores-diretorio/spec.md` — primeira spec do diretório de setores

## 9. Verificação

- [x] 9.1 `npx vite build` sem erro
- [x] 9.2 Diálogo do editor, CEO em mobile, contraste e badges de situação verificados ao vivo em claro e AMOLED
- [x] 9.3 `openspec validate --strict` limpo nas specs tocadas
