# Audit Global — Fase 16 (Encerramento), tarefa 16.3

Auditoria de contraste ao vivo, com passagem explícita em Cyber-Obsidian, Deep-Space Aurora e AMOLED, cobrindo as 13 views principais (Dashboard, Serviços, Cobertura, Colaboradores, Setores, Plantão, Histórico de Plantão, Processos, Comunicados, Configurações, Meus Chamados, Escritórios, TI) mais o Painel Admin e 2 de seus sub-painéis (Usuários, Comunicados). Metodologia: script de varredura ao vivo (relative-luminance + WCAG contrast + alpha-compositing contra o ancestral opaco mais próximo, mesma fórmula usada em fases anteriores), com cada achado verificado em contexto antes de ser registrado — vários falsos-positivos do próprio script foram descartados no caminho (documentados abaixo).

Sessão logada com a conta real de admin (Marcio Felix); nenhum dado real foi alterado durante a auditoria.

## Falsos-positivos descartados (metodologia)

- Primeira versão do script de varredura não checava o próprio `background` do elemento antes de subir para os ancestrais — gerou 2 falsos "1,06:1" (botão "Gerenciar Meus Chamados" do Dashboard, badge "IMPORTANTE") que na verdade têm ótimo contraste. Corrigido checando o elemento antes de seus pais.
- Ícone `photo_camera` do avatar em Configurações: o script tratou o glifo como texto (limiar 4,5:1) quando na verdade é um ícone decorativo dentro de um botão já rotulado (`aria-label="Alterar foto de perfil"`) — o limiar correto de não-texto é 3:1, e mede 2,8:1 (reprova, mas por pouco — registrado como P3, não P1).
- Badge "3" do `RankingPodium.jsx` (medalha de bronze) a 4,34:1: decisão já tomada e documentada na Fase 10 ("pódio é identidade de troféu, fixa por design, ouro é ouro em qualquer tema") — não é um achado novo, é uma nota de que o valor está perto do piso mesmo sendo intencional.
- Links de atribuição do Leaflet (2,31-2,92:1) em Cobertura: já registrado como Pendência desde a Fase 9 ("herda a cor de link global do app") — reconfirmado, não é achado novo.

## Achados novos (não cobertos por nenhuma das 15 fases anteriores)

### 1. `--danger-strong` alias para `--danger-bento` falha em 2 dos 5 temas (P1)

`index.css` define `--danger-strong: var(--danger-bento)` em Default Dark, Deep-Space Aurora e AMOLED — ou seja, o token "para texto" é literalmente o mesmo tom do token "para preenchimento gráfico" (que só precisa passar 3:1, não 4,5:1). Cyber-Obsidian já tem um `--danger-strong` bespoke (`#FF5C7A`, com comentário "texto: 5,4:1 sobre danger-soft no vidro") — os outros três nunca receberam o mesmo tratamento.

Medido ao vivo (`bg-[var(--danger-soft)] text-[var(--danger-strong)]` sobre `bg-surface-raised`, o uso real do par):
- **AMOLED: 2,98:1** (reprova)
- **Aurora: 3,57:1** (reprova)
- Default Dark: 4,50:1 (no limite, passa)
- Cyber: já correto por token bespoke
- Success/Warning: 6,05-8,07:1 em todos os temas testados (passam com folga — só o par `danger` está sub-calibrado)

Confirmado ao vivo em `TicketsList.jsx` ("Limpar filtros", 3,61:1 em AMOLED — `danger-strong` usado como texto direto, fora de um badge). Consumidores conhecidos do par: `ManagePlantaoModal.jsx`, `MultiSelectEmployee.jsx`, `Dashboard.jsx`, `ScheduleHistoricoTab.jsx`, `TicketsList.jsx`.

✅ **Resolvido nesta tarefa**: `index.css` — Default Dark `#FF8A8A` (8,72:1/7,21:1), Aurora `#FF7AB8` (7,98:1/5,61:1), AMOLED `#FF6E6E` (7,27:1/6,01:1), todos com folga real, não só no limite. `hooks/useBentoTheme.js` tinha um sistema de token PARALELO e SEPARADO (`C.dangerStrong`) com o mesmo problema em Default Dark (`#FF6B6B`, idêntico a `danger`) — corrigido para `#FF8A8A` também. Achado extra: `responsive/FilterBar.jsx` ("Limpar filtros"/"Limpar", componente compartilhado) usava `C.danger` (errado) em vez de `C.dangerStrong` (que já existia correto em Cyber/Aurora/AMOLED) — trocado. Verificado ao vivo: AMOLED 6,58:1 (antes 3,61:1), badge `danger-soft`/`danger-strong` 6,0:1 (antes 2,98:1) em AMOLED e 5,64:1 (antes 3,57:1) em Aurora.

### 2. `C.accentDeep` usado como texto/badge sem inverter por tema (P0/P1)

`accentDeep` (#7C2D12) é calibrado para texto sobre fundo CLARO — o mesmo raciocínio já documentado para `accentDark`/`accentSoft` (Fase 6) e para o pill de privilégio do Painel Admin (Fase 15), mas aqui é uma ocorrência DIFERENTE e nunca catalogada: em vez de aparecer como o token errado escolhido por atalho, `accentDeep` está sendo usado literalmente como "a cor escura da marca" sem o `isDark ? accentDark : accentDeep` que os pontos já corrigidos usam.

Medido ao vivo, todas em texto pequeno/badge:
- Dashboard, `⚡ Assumidas` (rótulo de KPI): **AMOLED 2,04:1, Cyber 1,84:1, Aurora 2,31:1** — reprova nos 3 temas escuros testados.
- `TicketsList.jsx`, badge de status "Aberto" (`bg-[var(--accent-soft)]`-equivalente + `color: accentDeep`): **AMOLED 1,77:1** — a pior medição desta auditoria.
- Botão secundário do hero (`style={{ background: C.surface, color: C.accentDeep }}`) — o mesmo código aparece em **4 arquivos**: `Schedule.jsx` ("Exportar iCal"), `Processos.jsx` ("Novo Processo"), `Comunicados.jsx`, `Offices.jsx`. Confirmado ao vivo em `Schedule.jsx` e `Processos.jsx`: **2,11:1 em AMOLED**. A causa raiz é assumir que `C.surface` é sempre claro — verdade nos 4 temas coloridos, falso no AMOLED (`C.surface` = `#121212`, quase preto).

✅ **Resolvido nesta tarefa**: `isDark ? C.accentDark : C.accentDeep` (mesmo padrão de `ChipButton.jsx`/`AdminUsuarios.jsx`) aplicado em `Dashboard.jsx` (KPI "Assumidas" + chip "Info", este último via `text-[var(--accent-deep)]`→`text-[var(--accent-dark)]`, equivalente em CSS-variável), `ManagePlantaoModal.jsx` (mesmo padrão CSS-variável), `TicketsList.jsx` (badge "Aberto" + botão "Ver todos" do estado vazio), e os 4 arquivos do botão-hero (`Schedule.jsx`, `Processos.jsx`, `Comunicados.jsx`, `Offices.jsx`). Verificado ao vivo: "Assumidas" e "Exportar iCal"/"Novo Processo" sem mais achados de contraste em AMOLED; badge "Aberto" não aparece mais na varredura.

### 3. `text-white` hardcoded em vez de `text-[var(--on-accent)]` — família nova do antipadrão já catalogado (P1)

O antipadrão "branco/`C.surface` sobre laranja" já tinha 7 ocorrências fechadas na tarefa 16.1 (todas via o hook JS `useBentoTheme` ou variável CSS `--accent`). Esta auditoria achou uma OITAVA família, nunca capturada pelos `grep`s anteriores porque usa a classe Tailwind literal `text-white` em vez de uma referência a token:

`grep "bg-\[var(--accent)\] text-white"` → **5 arquivos**: `ServicesFilterBar.jsx`, `ScheduleRow.jsx`, `ScheduleMobileCard.jsx`, `MultiSelectEmployee.jsx`, `CalendarDay.jsx`.

Confirmado ao vivo em `CalendarDay.jsx` (marcador do dia atual no mini-calendário do Plantão, dia 16 = hoje): **2,8:1 em AMOLED**. O mesmo padrão (`color: 'white'` inline) apareceu também no avatar de iniciais da sidebar do Painel Admin (`AdminDashboard.jsx`), não capturado por nenhum `grep` textual anterior porque é JS inline, não Tailwind: **2,8:1 em AMOLED**.

✅ **Resolvido nesta tarefa**: correção do grep no caminho — `ServicesFilterBar.jsx` já estava corrigido (o "achado" ali era só um COMENTÁRIO relembrando o bug antigo, não código vivo); os outros 4 (`ScheduleRow.jsx`, `ScheduleMobileCard.jsx`, `MultiSelectEmployee.jsx`, `CalendarDay.jsx`) trocados para `text-[var(--on-accent)]`; avatar do Painel Admin trocado de `color={[C.accent, '#fff']}` para `color={[C.accent, C.onAccent]}` (prop de `common/Avatar.jsx`). Verificado ao vivo: marcador "hoje" do calendário sem mais achado (era 2,8:1); avatar "ME" da sidebar do Painel Admin em 7,06:1 (era 2,8:1).

### 4. Badges de status/tecnologia da Cobertura com hex fixo não calibrado por tema (P1/P2)

`coverage/constants.js` documenta explicitamente por que usa hex fixo (`STATUS_META`, `TECH_META`): o Leaflet desenha os marcadores em SVG inline e precisa do valor literal, e a UI deriva a versão translúcida via `tone()` para manter marcador e badge com a mesma cor — uma decisão de PARIDADE deliberada, não um descuido. O que nunca foi verificado é se essas cores, depois de `tone()`, ainda passam contraste em AMOLED:

Medido ao vivo (`bg-[cor]/14%` + `color: [cor]`, sobre `--surface` real do AMOLED):
- Ativo (#16A34A): 4,82:1 — passa
- Expansão (#2563EB): 3,24:1 — reprova
- Inativo (#DC2626): 3,52:1 — reprova
- Padrão/fallback (#64748B): 3,44:1 — reprova
- FTTH (#7C3AED, `TECH_META`): 3,03:1 — reprova (confirmado ao vivo em `RegionCard.jsx`)

3 dos 4 status e a tecnologia FTTH reprovam AA no AMOLED especificamente — os outros 4 temas (com fundos mais claros/coloridos) provavelmente têm folga suficiente, não testados individualmente aqui.

✅ **Resolvido nesta tarefa**: `STATUS_META`/`TECH_META` (`coverage/constants.js`) ganharam um campo `corTexto` por entrada (tom mais claro, só para texto; `cor` sozinha nunca muda, preservando a paridade com o marcador do Leaflet) — `corDoStatus()` ganhou uma irmã `corTextoDoStatus()`. Aplicado em `RegionCard.jsx` (badge de estado, chip de tecnologia, chip de status) e `CoverageFilters.jsx` (chips de filtro, via `ChipButton`). Verificado ao vivo em AMOLED: os badges "AL"/"SE"/FTTH somem da varredura; só a Pendência já catalogada do Leaflet permanece.

## Achados menores (P2/P3, não bloqueantes)

- Ícone `photo_camera` do avatar em Configurações: 2,8:1 contra o piso de não-texto de 3:1 (por pouco); botão já tem `aria-label`, então não é um problema de nome acessível, só de nitidez do ícone.
- "em 3 dias"/"em 6 dias" (rótulos de prazo relativo) no Dashboard em Cyber-Obsidian: 4,24:1, logo abaixo do piso de 4,5:1 — não verificado em outros temas.
- Badge "3" (bronze) do `RankingPodium.jsx`: 4,34:1 — decisão de design já tomada na Fase 10 (trophy fixo por tema), registrado só como observação.

### 5. `text-muted` (Tailwind) — mesma falha do `C.muted` (JS hook), nunca verificada (P1)

Achado ao vivo verificando o achado #4: `RegionCard.jsx:39` usava `text-muted` (não `C.muted`) e media **3,01:1 no claro**. A tarefa 16.1 tinha marcado esse antipadrão como "totalmente resolvido" — alegação **errada**, feita sem rodar `grep "text-muted"` (só o hook JS foi checado). `grep -rn "text-muted" src/` real encontrou **~20 arquivos, 60+ ocorrências**; a maioria texto real (labels, dicas, contadores, estados vazios), uma fração menor ícones/placeholders `aria-hidden` (uso correto, sem mudança).

**Corrigido nesta mesma tarefa** (aprovado pelo Felix via AskUserQuestion, "Corrigir tudo agora"): `text-muted`→`text-faint` em todo texto real de `Dashboard.jsx` (~14), `Processos.jsx` (9), `coverage/{OverrideModal,RegionCard,RegionPanel,MapLegend,CoverageFilters}.jsx`, `Coverage.jsx`, `services/modals/ModalShell.jsx` (`HINT_CLASS`, compartilhado por 3 modais), `directory/DirectoryToolbar.jsx` (`SEG_INATIVO`), `schedule/UserAvatar.jsx`, `common/GlowingEffectDemo.jsx` (código morto, corrigido por consistência). Ícones/placeholders confirmados corretos e não tocados: `Coverage.jsx`, `RegionPanel.jsx`, `OverrideModal.jsx`, `MapLegend.jsx`, `Processos.jsx` (10 botões-ícone + 1 placeholder), `ModalShell.jsx`, `DirectoryStates.jsx`, `SectorsStates.jsx`, `ScheduleStates.jsx`, `Ti.jsx`, `RankingPodium.jsx`, `PlansGrid.jsx`. `directory/GrupoSecao.jsx` já estava correto (`text-faint` com comentário explicando o mesmo achado — conhecimento que não se propagou para o resto do código).

Achado colateral no caminho: `schedule/UserAvatar.jsx`'s rótulo "Pendente" tinha `opacity-50` empilhado sobre o token — mesmo trocando para `text-faint`, a opacidade sozinha reprovava 2,35:1. Removida a opacidade (itálico já sinaliza o estado "pendente" sem precisar apagar o texto).

**Erros do próprio script de varredura descobertos ao rodar em mais páginas** (não são bugs do produto): dois "1,05-1,06:1" no Dashboard eram um `<h2>` branco sobre o gradiente do hero (`background` via imagem, não `backgroundColor` — limitação de detector já documentada desde fases anteriores) e um `<span>` dentro do carrossel de comunicados (múltiplos slides empilhados, o script encontrou o fundo de um slide inativo). Não investigados a fundo nem corrigidos — ficam fora do escopo desta tarefa; se uma auditoria futura tocar o Dashboard ou o carrossel, vale re-verificar com uma ferramenta que leia `background-image` e distinga slide ativo/inativo.

## Cobertura desta auditoria

Testado com passagem explícita nos 3 temas pedidos (Cyber-Obsidian, Deep-Space Aurora, AMOLED) nas views onde os 3 padrões novos (`accentDeep`, `danger-strong`, `text-white`) foram encontrados; Default Dark testado pontualmente para o achado #1. Varredura de contraste completa (todas as views) feita em AMOLED, o tema historicamente mais revelador de bugs neste programa. Views cobertas: Dashboard, Serviços, Cobertura, Colaboradores, Setores, Plantão, Histórico de Plantão, Processos, Comunicados, Configurações, Meus Chamados, Escritórios, TI, Painel Admin (Visão Geral + Usuários + Comunicados). Não cobertas nesta rodada: Auditoria e Responsáveis do Painel Admin (sub-páginas administrativas de menor tráfego, sem indício de padrão novo nas fases anteriores), e uma varredura pixel-a-pixel de todo modal/estado de erro/vazio de cada tela.
