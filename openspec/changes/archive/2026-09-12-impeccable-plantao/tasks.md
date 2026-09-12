## 1. P0 — Revalidar sobreposição ao trocar a data em "Novo Plantão"

- [x] 1.1 Em `Schedule.jsx`, extrair a busca de plantão existente (hoje só em `openManagement`) para uma função reutilizável (`carregarDadosDaData`) e chamá-la também no handler passado como `onDateChange` ao `ManagePlantaoModal` (`trocarDataNoModal`), atualizando `existingPlantao` e `formData`
- [x] 1.2 Verificado ao vivo: abrir "Novo Plantão" → trocar a data para um dia com plantão existente (VILKER SILVA SANTOS em N1) → aviso "Já existe um plantão — salvar irá substituir" aparece imediatamente, N1 é pré-marcado e o botão Excluir aparece; trocar de volta para um dia livre → aviso some, N1 desmarca e Excluir some

## 2. P0 — Trap de foco no `ManagePlantaoModal`

- [x] 2.1 Trocado o `useEffect` manual de Escape pelo hook compartilhado `useDismissable` (Escape, clique fora, foco de entrada/retorno) + `trapTab` local (mesmo padrão do `TiSupportModal`)
- [x] 2.2 Verificado ao vivo com teclado real (clique real via Playwright, não `.click()` sintético — que não focava o botão e dava falso alarme): Tab do último elemento (Salvar) volta ao primeiro (Fechar); Shift+Tab do primeiro vai para o último; nunca escapa para o hero atrás do backdrop; Escape fecha e devolve o foco ao botão "Novo Plantão" que abriu o modal

## 3. P0 — Contraste crítico em `PlantaoHistorico.jsx`

- [x] 3.1 Migração completa do arquivo para tokens semânticos (não só as 3 linhas originalmente mapeadas — o achado real era a página inteira, incluindo o wrapper com `backgroundColor: '#F5F9FF'` inline fixo): `bg-background`, `bg-surface`, `text-foreground`, `text-faint`, `border-border`, `bg-surface-raised`, gradiente `from-[var(--accent-deep)] to-[var(--accent)]`. Zero hex restante (`grep` confirma)
- [x] 3.2 Verificado ao vivo em Cyber-Obsidian: página inteira (título, filtros, tabela, paginação) segue o tema corretamente, texto com contraste alto e legível — comparado por screenshot antes/depois

## 4. P1 — Microtipografia fora da rampa do DESIGN.md

- [x] 4.1 Normalizados os 64 achados do detector: descoberto que 22 eram falsos positivos (tamanho de glyph de ícone `material-symbols-outlined`, não tipografia de leitura — fora de escopo, não tocados) e 42 eram texto real. Mapeamento: 8/9/10px → `text-[11px]` (overline do DESIGN.md); 12px → `text-xs`; 15px → `text-base`/`text-lg` conforme contexto; 17px → `text-lg`; achados também corrigidos em 6 colunas de tabela e 3 células irmãs que o detector não listou individualmente (mesmo padrão repetido)
- [x] 4.2 Detector re-rodado 3 vezes até zero achados de texto restantes; 21 achados de ícone permanecem (esperado, fora de escopo)
- [x] 4.3 Revisão visual ao vivo (claro + Cyber-Obsidian, desktop 1440px + mobile 390px): nenhum truncamento, sobreposição ou quebra de alinhamento

## 5. P1 — Tratamento fantasma consistente para Supervisão sem atribuição

- [x] 5.1 `mgr` passa a ser condicional em `Schedule.jsx` (`mgr={p.gerente_id ? mapIdsToPessoas(p.gerente_id) : null}`), igual a `n2`, nas duas chamadas (desktop e mobile)
- [x] 5.2 `ScheduleRow.jsx`: bloco de Supervisão trata `mgr === null` com `<UserAvatar user={null} allowEmpty size="size-8" />`, em vez de assumir `mgr.name`
- [x] 5.3 Mesmo ajuste em `ScheduleMobileCard.jsx`
- [x] 5.4 Verificado ao vivo: plantão sem supervisor mostra o mesmo estado fantasma discreto do N2 (ícone `person_off`, "Pendente" em itálico) na tabela desktop — confirmado no mesmo teste do item 1.2

## 6. Verificação final e portão

- [x] 6.1 `npx vite build` limpo em todas as 5 rodadas de edição
- [x] 6.2 Os 3 P0 e 2 P1 verificados individualmente ao vivo (ver itens acima); não foi feita uma nova rodada completa de crítica/audit dual-agent (ficaria redundante com as verificações pontuais já feitas)
- [x] 6.3 `openspec validate impeccable-plantao --strict` — válida

## 7. Commit
