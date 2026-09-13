---
target: Escritórios (Offices.jsx)
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 4
target_identity: "file:F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Offices.jsx"
target_fingerprint: "sha256:f8a791d94d66ebd3e5dadfce61cd9fb8ab0ab992a587b81c173dfb09d1fae323"
target_path: "F:\\vault\\20 Projetos\\prestek_intranet\\src\\components\\Offices.jsx"
timestamp: 2026-09-13T19-59-22Z
slug: src-components-offices-jsx
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Loading/erro/vazio existem; abrir/fechar modal não move foco nem anuncia nada a leitor de tela |
| 2 | Match System / Real World | 3 | Formato de endereço/estado, "Matriz/Filial" e iconografia lêem natural para o público |
| 3 | User Control and Freedom | 1 | Escape fecha os 2 diálogos, mas filtrar/buscar dá falsa sensação de controle — o mapa ignora os dois |
| 4 | Consistency and Standards | 1 | Contradiz a própria regra do projeto (`AGENTS.md` §4, sem ação só-no-hover) e repete 2 antipadrões já corrigidos em outras fases (tema travado, diálogo sem semântica) |
| 5 | Error Prevention | 2 | Form só valida no submit; "Extrair" sobrescreve lat/lng digitados manualmente sem aviso |
| 6 | Recognition Rather Than Recall | 3 | Legenda de cores, contagens e flyTo+popup apoiam bem o reconhecimento |
| 7 | Flexibility and Efficiency | 1 | O extrator de link do Maps é um atalho real; anulado por um mapa que não reflete o filtro e um divisor sem equivalente de teclado |
| 8 | Aesthetic and Minimalist Design | 2 | Hero polido; o resto vira um retângulo branco chapado sobre preto nos temas escuros |
| 9 | Error Recovery | 1 | Erro de exclusão cai em `alert()` cru — antipadrão banido desde a Fase 2, recorrendo num caminho de ação destrutiva |
| 10 | Help and Documentation | 2 | "Extrair" tem `title` mas nenhuma orientação sobre formatos de link aceitos |
| **Total** | | **18/40** | **Ruim (45%)** |

## Design Specificity Verdict

**LLM assessment**: Não é uma crítica genérica — cada achado foi medido ao vivo contra este arquivo específico (`getBoundingClientRect()` em `[title="Excluir escritório"]` retornando 24×32px, `getComputedStyle().opacity` continuando `"0"` após `.focus()`, contagem de `.leaflet-marker-icon` parada em 16 depois de um filtro que deveria deixar 5). O desalinhamento mapa/filtro em particular é um bug funcional único da arquitetura split-view desta tela, não uma repetição de padrão de outra fase.

**Deterministic scan**: `impeccable detect --json` sobre `Offices.jsx` retornou 21 achados. Falsos positivos confirmados: tamanhos de fonte do hero (10px kicker, 17px KPI, 15px subtítulo) idênticos byte-a-byte a `TiHero`/`CoverageHero`/`ServicesHero`/`DirectoryHero`/`SectorsHero` (6-9 arquivos, transversal já catalogado); 4 tamanhos de glifo de ícone Material Symbols. Achados reais: badge "Matriz" 9px + contraste 2,80:1; legenda de cidade/estado 10px + contraste 3,01:1; `labelCls` do modal em 10px com `text-[#475467]` hardcoded onde `Processos.jsx` (mesmo padrão de modal admin) já usa o token `text-faint` — divergência específica desta tela, não cópia fiel de um padrão compartilhado.

**Achado curioso**: o gradiente dos botões (`from-[#9A3412] to-[#EC7D23]`) mistura um hex do tema claro (`#EC7D23`, `BENTO_LIGHT.accent`) com um hex do tema Aurora ESCURO (`#9A3412`, `BENTO_DARK_AURORA.accentDeep`) — nunca corresponde à rampa real de nenhum tema, claro ou escuro.

## Overall Impression

O hero é genuinamente bem construído, mas tudo abaixo dele foi aparentemente nunca revisado pelo programa: um bug funcional real (mapa não filtra), o antipadrão de tema travado na sua forma mais extensa até agora (tela inteira, não só um componente), e ações administrativas que são ao mesmo tempo invisíveis por teclado e inatingíveis por toque. A pergunta mais reveladora da Assessment A: "Offices foi genuinamente nunca auditada, ou foi despriorizada atrás das outras nove fases já endurecidas?"

## What's Working

1. **Extrator de coordenadas via link do Google Maps** (linhas 165-184, 279-313): substitui uma busca manual de lat/lng propensa a erro por um clique, com feedback inline de sucesso/erro — um atalho real para o fluxo de trabalho do admin.
2. **`flyToOffice`** (linhas 511-518): pan suave + auto-abertura do popup ao clicar num item da lista — uma interação bem executada que conecta lista e mapa, quando o dado por trás é confiável.
3. **Painel de KPIs do hero** (linhas 126-136): reaproveita o padrão de kicker/tabular-nums das heroes irmãs com boa consistência interna.

## Priority Issues

**[P0] O mapa ignora completamente o filtro e a busca**
- **What**: O `useEffect` que sincroniza os marcadores (linhas 460-491) itera sobre `offices` bruto, não sobre `filtrados` (a lista já filtrada, computada nas linhas 428-435) — e sua dependência é `[mapPronto, offices]`, nunca reagindo a `filtro`/`busca` sozinhos. Confirmado ao vivo: selecionar o chip "SE" (5 de 16 escritórios) ou buscar um termo sem resultado nenhum mantém os 16 marcadores no mapa.
- **Why it matters**: Numa tela onde o mapa ocupa a maior parte da viewport, filtrar dá uma falsa sensação de controle — lista e mapa, que deveriam sempre concordar numa visão split, silenciosamente discordam.
- **Fix**: Trocar o loop de sincronização para iterar `filtrados` em vez de `offices`, e recalcular os bounds do mapa quando `filtro`/`busca` mudar.
- **Suggested command**: /impeccable harden

**[P0] A tela inteira abaixo do hero nunca muda de tema**
- **What**: `useBentoTheme()` é chamado mas `C` só é usado uma vez fora do hero (`backgroundColor: C.bg` no wrapper externo). Lista, legenda, chips de filtro, busca, moldura do mapa e AMBOS os modais usam hex cru (`bg-white`, `#0B1B2E`, `#E4ECF5`, `#8896A8`, `#F97316`, `#3B82F6`, `#10B981`, `#E84545`...). Confirmado ao vivo em AMOLED: sidebar/header/hero corretamente ficam pretos, mas o painel da lista continua um retângulo branco opaco com texto navy, flutuando numa página inteiramente preta. Contraste medido: badge "Matriz" 2,80:1; legenda de cidade/estado 3,01:1 — ambos abaixo do piso de 4,5:1, independente do tema ativo.
- **Why it matters**: Mesmo antipadrão já corrigido como P0 em `PlantaoHistorico.jsx` (Fase 4) e `AdminComunicados.jsx` (Fase 5), aqui recorrendo numa superfície muito maior — essencialmente a tela inteira — e quebrando também os dois modais administrativos, o mesmo tipo de modal já endurecido em outras fases.
- **Fix**: Rotear todo hex hardcoded por tokens de `useBentoTheme()`/CSS vars, no mesmo padrão que `OfficesHero` já usa corretamente.
- **Suggested command**: /impeccable harden

**[P0] Ações de editar/excluir por item são invisíveis por teclado e inatingíveis por toque; nenhum dos dois modais tem semântica de diálogo**
- **What**: O wrapper dos botões admin por linha (linhas 690-708) é `opacity-0 group-hover/item:opacity-100`, sem nenhuma regra de `focus`/`focus-within`. Confirmado ao vivo: `.focus()` no botão "Editar escritório" deixa `getComputedStyle(wrapper).opacity` em `"0"` — o botão fica focado mas TOTALMENTE INVISÍVEL. Em toque, não existe `:hover`, então a ação nunca aparece. Pior: abrir o diálogo de exclusão não move o foco para dentro dele, e pressionar Tab depois move o foco para o botão de excluir invisível de OUTRA linha, embaixo do diálogo — um teclado-usuário pode ativar a exclusão do escritório errado. Nenhum dos dois modais tem `role="dialog"`/`aria-modal`/trap de Tab.
- **Why it matters**: Contradiz diretamente a regra do próprio projeto (`AGENTS.md` §4, proibe ação só-no-hover) e é uma versão mais grave do antipadrão de diálogo sem semântica já corrigido nas Fases 4/5/7/10 — aqui com um risco concreto de ativar a ação destrutiva errada.
- **Fix**: Revelar as ações também em `focus-within`/toque; adicionar `role="dialog"`/`aria-modal`/foco inicial/trap de Tab aos dois modais, seguindo o padrão já estabelecido (`useDismissable`+`trapTab`).
- **Suggested command**: /impeccable harden

**[P1] Todos os 10 campos do formulário são `<label>` órfãos, sem associação com o input**
- **What**: Nenhum campo de `EscritorioModal` (Nome, Tipo, Estado, Cidade, Endereço, CEP, Cor, Link do Maps, Latitude, Longitude) tem `htmlFor`/`id` pareado, nem `aria-label` nos `<select>`/color-picker.
- **Why it matters**: Leitor de tela não anuncia a identidade do campo além de um placeholder fraco (ou nada, nos `<select>`s) — afeta todos os campos do fluxo admin principal da tela.
- **Fix**: Adicionar pares `htmlFor`/`id` — mecânico, ~10 repetições.
- **Suggested command**: /impeccable harden

**[P1] `alert()` cru na falha de exclusão**
- **What**: `excluirEscritorio` (linha 532) chama `alert(e.erro || 'Erro ao excluir.')`.
- **Why it matters**: Antipadrão banido desde a Fase 2, recorrendo justo num caminho de ação destrutiva, onde um diálogo nativo bloqueante é mais disruptivo.
- **Fix**: Reaproveitar o padrão de erro inline que o próprio arquivo já usa na validação do formulário (`erro`/`erroLink`).
- **Suggested command**: /impeccable harden

**[P1] Alvos de toque abaixo de 44px nos chips de filtro e na busca**
- **What**: Chip "Todos" medido em 82,8×28px; campo de busca em 30px de altura.
- **Why it matters**: Consistente com o padrão já corrigido em outras 5 fases desta jornada.
- **Fix**: `min-h-[44px]` nos chips e no campo de busca.
- **Suggested command**: /impeccable harden

**[P1] No mobile, lista+mapa ficam espremidos a ~27-55px de altura visível, sem nenhuma rota de rolagem**
- **What**: Em 375×812, o hero+KPIs+filtros consomem tanto espaço vertical que a área combinada de lista+mapa mede só ~159px no total — confirmado que toda a cadeia de ancestrais até a casca do app é `overflow:hidden`, sem escape de rolagem.
- **Why it matters**: Um usuário de celular praticamente não consegue navegar a lista nem ver o mapa — a pior experiência de todo o programa Impeccable até agora num viewport mobile.
- **Fix**: Reduzir a altura do hero em mobile e/ou dar mais proporção vertical à área de lista+mapa; considerar um toggle Lista/Mapa em vez de split vertical fixo abaixo de `md`.
- **Suggested command**: /impeccable layout

## Persona Red Flags

**Alex (Power User)**: Tabular até o botão de editar/excluir não dá nenhuma confirmação visual de foco; dentro do diálogo de exclusão, Tab escapa para a lista escondida por trás em vez de ficar preso em Cancelar/Excluir; o divisor de redimensionamento não tem equivalente de teclado; ao perceber que os chips AL/SE não afetam o mapa, toda a barra de filtro/busca passa a parecer não confiável.

**Sam (Accessibility)**: Nenhum campo do formulário tem rótulo programático; nenhum dos dois modais anuncia-se como diálogo nem move o foco ao abrir; o nome acessível dos botões de editar/excluir resolve para o texto do ícone ("edit"/"delete") em vez do `title` mais descritivo — Sam ouve "edit, button" idêntico nas 16 linhas, sem saber qual escritório é qual.

**Casey (Mobile)**: Os ícones de editar/excluir nunca aparecem em toque (proibido pela própria `AGENTS.md`); a lista fica espremida a ~27px de altura visível antes de alcançar o mapa; o divisor de redimensionamento fica oculto abaixo de `md`, então Casey nunca consegue reivindicar mais espaço para a lista, justo onde ela mais precisa aqui.

## Minor Observations

- Nome do escritório trunca ("PENEDO/AL (M…") ao lado de um badge "Matriz" redundante que já informa o mesmo.
- Ícone decorativo de busca sem `aria-hidden="true"`, diferente de outros ícones decorativos no mesmo arquivo.
- `<input type="color">` e seu par de texto hex não têm validação de sincronia — digitar um valor não-hex desalinha o dois.
- Nenhum aviso antes de "Extrair" sobrescrever Latitude/Longitude digitados manualmente.
- Moldura do mapa (`border-[#E4ECF5]`) também não adapta por tema — parte do mesmo P0 de tema travado.
- Divisor de redimensionamento sem `role="separator"` nem suporte de teclado; chips de filtro sem `aria-pressed`.

## Questions to Consider

- Se o mapa ocupa a maior parte da tela, por que todo filtro/busca só afeta a lista — o mapa deveria ser o que filtra, com a lista como índice secundário?
- O efeito de Escape (linhas 504-509) foi claramente escrito de propósito para os dois modais — por que `role="dialog"`, trap de foco e tokens de tema (todos padrões já resolvidos em outras fases) nunca chegaram a este arquivo? Escritórios foi genuinamente nunca revisada, ou ficou de fora das 9 fases já endurecidas?
