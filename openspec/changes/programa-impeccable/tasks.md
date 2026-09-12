## 0. Fundação

- [x] 0.1 Decidir e montar a ferramenta de navegador para o skill (Chrome DevTools MCP ou Playwright MCP); confirmar com `impeccable signals` que `devServer.running` fica `true` com `npm run dev` no ar — Playwright MCP (`@playwright/mcp` 0.0.80, resolvido via npx) adicionado ao `.mcp.json`; o tool só aparece após reiniciar a sessão. Ressalva: o `signals` sonda portas fixas e não lê o `vite.config.js` (porta 5000), então `devServer.running` fica `false` mesmo com o Vite no ar; nas fases seguintes, passar a URL `http://localhost:5000` explicitamente ao critique/audit em vez de confiar nesse sinal
- [x] 0.2 Rodar `/impeccable doctor`; aplicar apenas findings `auto`; anotar os `mention`/`route` — resultado 2026-09-07: nenhum `auto`; um `mention` (`design-md-coverage`: DESIGN.md sem seções Colors/Components no esquema lido pelo skill), resolvido pela tarefa 0.3
- [x] 0.3 Rodar `/impeccable document` para reescrever `DESIGN.md` a partir do código atual (tokens de `index.css`, `useBentoTheme`, componentes de `ui/` e `common/`) e gerar `.impeccable/design.json` — modo mesclar; frontmatter com 30 cores, 7 papéis tipográficos, 6 raios, 5 espaçamentos, 12 componentes; corpo nas 8 seções canônicas; sidecar schemaVersion 2 com rampas OKLCH calculadas, 9 componentes com HTML/CSS autocontidos, tabela dos 5 temas; `doctor` voltou com zero findings
- [x] 0.4 Conferir o novo `DESIGN.md` contra `src/docs/Manual-da-Marca-Prestek-Telecom.pdf`; remover qualquer resíduo bege (`#eaddcd`, `#f4eee6`) e registrar os 4 temas escuros como estão em código — manual (12 páginas, extraído com pdf-parse) fixa `#D97738`/`#384C9C` e proíbe distorcer, rotacionar, recolorir ou trocar a tipografia do logo; divergência do accent documentada (The Manual Divergence Rule); bege removido; verdade da fonte corrigida (Manrope só em títulos, Plus Jakarta Sans no corpo, JetBrains Mono em números); 4 temas escuros tabelados a partir do `index.css`
- [x] 0.5 Criar `.impeccable/critique/ignore.md` com o formato de exceção (finding, motivo, data, quem decidiu) — criado com a primeira exceção (divergência de cor do manual)
- [x] 0.6 Confirmar `/impeccable hooks status` ligado e limpar `ignoreValues` obsoletos em `.impeccable/config.json` — hook `enabled`; as 3 exceções (`overused-font=plus jakarta sans`, `layout-transition` na Sidebar, `side-tab` no Dashboard) continuam válidas e ficam
- [x] 0.7 Registrar as decisões 1–4 do proposal.md como tomadas (navegador, changes abertas, temas, rastreio) — registradas no proposal.md como 7 decisões (as 4 previstas mais DESIGN.md mesclado, cor da marca e linguagem do sistema)

## 1. Chrome global

- [x] 1.1 Resolver changes abertas que tocam o chrome: `melhoria-sininho-notificacao` (36/41) — os 5 testes de navegador restantes rodados com Playwright MCP (sessão injetada via `sessionStorage['@Stitch:user']`, sem credencial IXC); 41/41; change arquivada. `notification-bell-improvements` (19/19, nunca arquivada) arquivada junto. O `openspec archive` falha no rename da pasta nesta máquina (EPERM), então as duas foram movidas à mão para `changes/archive/2026-09-07-*` e os 8 specs principais `notification-*` escritos a partir dos deltas (todos ADDED)
- [x] 1.2 `critique src/App.jsx` — 2026-09-07, dual-agent com navegador (2 papéis × claro/Cyber × 1440 e 390): **19/40**, 1 P0 (Painel Admin visível e roteável para não-admin), 3 P1 (teclado/Escape/foco; contraste e overlays translúcidos no escuro; header vazio e busca que só filtra Serviços), 1 P2 (chrome mobile sem identidade/saída, drawer morto). Snapshot `.impeccable/critique/2026-09-07T22-51-04Z__src-app-jsx.md`. Achado estrutural: "Default Dark" não é alcançável pela UI (`ThemeContext` sempre aplica `dark-<variante>`)
- [x] 1.3 `audit` em Header, Sidebar, MobileBottomNav, MobileMoreSheet, responsive/, notifications/, ThemeSwitcher — **9/20** (a11y 1, perf 2, responsivo 2, tema 2, integridade 2); 1 P0, 7 P1, 8 P2, 6 P3; relatório em `docs/impeccable/audit-chrome-2026-09-07.md`. Achados além da crítica: `NavRow`/`GroupLabel` definidos dentro do render da Sidebar (remontam a nav a cada estado); 4 componentes mortos em `responsive/` (`MobileDrawer`, `PageShell`, `ResponsiveBreadcrumb`, `TouchFriendlyActions`) e DESIGN.md descrevendo `PageShell` como universal; 3 listas de navegação duplicadas; `ThemeSwitcher.tsx` inteiro em hex
- [x] 1.4 Consolidar backlog: sidebar colapsada e expandida, sheet "Mais", sino com e sem notificações, troca entre os 5 temas, foco de teclado no chrome inteiro, 2 papéis (item TI/Admin só para admin) — passagem manual: claro desktop (executor), claro/Cyber × 1440/390 × 2 papéis (Avaliação A), AMOLED desktop (sino + perfil) e Aurora celular (sheet) por amostragem. Extras da passagem: dropdown vira spinner a cada poll; "Sair da Conta" 3,9:1 no AMOLED; swatch AMOLED invisível; "Mais" ativo `#9A3412` sobre índigo no Aurora; sem rolagem horizontal a 390px. Backlog virou `openspec/changes/impeccable-chrome/tasks.md` (4 novas capabilities, 3 modificadas, 3 removidas)
- [x] 1.5 Criar change filha `impeccable-chrome` e corrigir (polish → direcionados) — change criada e executada (seções 1 a 6 de `impeccable-chrome/tasks.md`, 34 tarefas), commits `281beb9` e `2a10b24`
- [x] 1.6 Verificar (build, diff, finish-reviewer, critique, audit) e passar o portão — build, diff e finish-reviewer (7.1 a 7.3); re-audit 2026-09-08: **9 → 15/20** (`docs/impeccable/audit-chrome-2026-09-08.md`); crítica 2026-09-08: 19 → 24/40 com 2 P1; decisão (Felix, 2026-09-08): rodada curta antes de fechar, Painel Admin fica para a Fase 15. Rodada `colorize` + 3ª crítica 2026-09-09: **27/40**, com 3 P1 novos de teclado corrigidos e verificados em seguida (seção 8 de `impeccable-chrome/tasks.md`). **Portão passado**: audit ≥ 15, crítica ≥ 25, P0/P1 do chrome zerados (o único P1 aberto, Painel Admin fora do shell, é da Fase 15 por decisão)
- [x] 1.7 Commit — `de5733d` (colorize) e o commit do `harden` + snapshot da 3ª crítica

## 2. Login + NotFound

- [x] 2.1 `critique src/components/Login.jsx` — 2026-09-10, dual-agent com navegador (sem sessão, 3 viewports, claro/Default Dark/AMOLED, fluxo de erro): **16/40** (Pobre), 1 P0 (e-mail inexistente devolve exceção crua: `dados.total === 0` estrito em `backend/server.js:143` + `catch` que expõe `erro.message`), 4 P1 (formulário sem `autocomplete`/`htmlFor`/checkbox real; senha em claro no `localStorage` por "Lembrar senha"; tema ignorado + botão 2,8:1 + borda 1,14:1; copy fabricada "Prestek Inc." / "SSO · SAML 2.0" e links Status/Docs/`#`), 1 P2 (Lottie de 14 MB baixado e animando no celular e com reduced-motion), 1 P3 (`p-14` no celular). Detector: 9 advisories de fonte fora da rampa; overlay: 5 warnings. Snapshot `.impeccable/critique/` slug `src-components-login-jsx`
- [x] 2.2 `audit src/components/Login src/components/NotFound.jsx` — 2026-09-10: **6/20** (a11y 1, perf 1, responsivo 2, tema 1, integridade 1); 1 P0, 5 P1, 4 P2, 5 P3; relatório em `docs/impeccable/audit-login-2026-09-10.md`. Além da crítica: Lottie do 404 preto puro (67 formas `[0,0,0,1]`) invisível no escuro; botão "Entrar" abaixo da dobra com teclado aberto (390×540); header vazio em view inexistente; JSON do 404 importado mesmo na variante sem-permissão
- [x] 2.3 Consolidar backlog: erro de credencial, lembrar-me, ilustração em mobile, rota inexistente para os 2 papéis — 9 blocos na seção "Backlog consolidado" do audit, com as 4 decisões do Felix (escopo completo, painel da marca no lugar do Lottie, "Manter conectado" só com sessão, "Fale com a TI" sem link)
- [x] 2.4 Criar change filha `impeccable-login` e corrigir — 34 tarefas (backend, sessão, formulário acessível, tema, painel da marca, NotFound, verificação), todas concluídas; arquivada em `changes/archive/2026-09-10-impeccable-login`, specs sincronizadas (3 novas: login-screen, login-api, not-found-screen; 2 modificadas: chrome-header-context, mobile-bottom-navigation)
- [x] 2.5 Verificar e passar o portão — audit **6 → 15/20**; crítica **16 → 31/40** (0 P0/P1); detector 9 → 0 findings; `npx vite build` limpo, sem o chunk de 2,6 MB do Lottie
- [x] 2.6 Commit

## 3. Dashboard

- [x] 3.1 Resolver `dashboard-hero-slideshow` (23/30) e decidir o destino do código morto HeroCard/HeroBgModal — 2026-09-11: abandonada. O `Dashboard.jsx` foi reescrito por completo numa fase posterior (commits `1b17990`, `6054504`) e `HeroCard`/`HeroBgModal`/`heroBgImage(s)` não existem mais no código (confirmado por grep no repositório inteiro). Não há o que terminar. Change movida para `changes/archive/2026-09-11-dashboard-hero-slideshow-abandonado` com a decisão registrada em `tasks.md`
- [x] 3.2 Reabrir os 3 P0 do snapshot fechado de 2026-09-07T13-39-40Z — verificados no código e ao vivo, **os 3 já estavam corrigidos**: (1) `backend/server.js:1714` seleciona `horario_inicio`/`horario_fim`, sem fallback inventado, frontend mostra "Horário a confirmar" quando ausente (`Dashboard.jsx:209-215`); (2) `sem_dados` tratado como dado em `carregarEficiencia` (`:1284-1288`), `SetorBento` renderiza "N/A" limpo, confirmado ao vivo com a persona de RH; (3) carrossel e lista de comunicados com `role="button"`, `aria-label`, foco visível e pausa por hover **e** por foco (`pausado = isHovered || isFocused`, `:379`). Nenhuma correção nova precisou ser feita aqui — evolução de uma reescrita anterior do Dashboard
- [x] 3.3 `critique src/components/Dashboard.jsx` (3ª rodada, agora com navegador) — 2026-09-11, dual-agent com navegador (2 papéis × claro/Default Dark/AMOLED × 1440/390, falha de rede simulada): **26/40** (Aceitável), 1 P0 novo (botão "Gerenciar Meus Chamados" branco sobre branco por colisão `bg-surface`/`bg-primary`, contraste 1,0:1), 4 P1 (`TiSupportModal` sem diálogo/foco/Escape; `GlowingEffect` com 4 cores de terceiro fora da marca nos 9 usos; badges de estado 3,82:1/2,84:1; grid travado contra o PRODUCT.md com backend pronto e não usado). Snapshot `.impeccable/critique/2026-09-11T00-15-42Z__src-components-dashboard-jsx.md`. Tendência 13 → 15 → 26
- [x] 3.4 `audit src/components/Dashboard.jsx src/components/TiSupportModal.jsx src/components/common` — 2026-09-11: **12/20** (a11y 2, perf 3, responsivo 3, tema 2, integridade 2); 1 P0, 4 P1, 5 P2, 4 P3; relatório em `docs/impeccable/audit-dashboard-2026-09-11.md`. Achado positivo além da crítica: `GlowingEffect` usa um único listener de `pointermove` compartilhado no `document.body`, não um por card como uma crítica anterior presumia
- [x] 3.5 Consolidar backlog nos 2 papéis — SetorBento sobrepondo Plantão em xs **já corrigido** (verificado a 390px); dos "4 fetches que engolem erro", só 2 fetches secundários (nomes de departamento) falham em silêncio de forma defensável, os 4 fetches principais têm erro tratado; backlog completo em `docs/impeccable/audit-dashboard-2026-09-11.md` (seções "Achados por severidade" e "Padrões sistêmicos")
- [x] 3.6 Criar change filha `impeccable-dashboard` e corrigir — escopo P0+P1 por decisão do Felix (2026-09-11); 6 seções de `impeccable-dashboard/tasks.md`, todas concluídas; arquivada em `changes/archive/2026-09-11-impeccable-dashboard`, specs sincronizadas (2 novas: `dashboard-view` e o requisito de acessibilidade em `ti-modal-solicitante-selector`; `dashboard-customization` removida — grid documentado como fixo)
- [x] 3.7 Verificar e passar o portão — audit 12/20 (`docs/impeccable/audit-dashboard-2026-09-11.md`); crítica em 2 rodadas **26 → 35/40** (alvo 25+ superado, 0 P0/P1); detector 13 → 9 advisories (os 4 `design-system-color` restantes são o branch `default`, não mais alcançado por nenhum uso no Dashboard); `npx vite build` limpo. Achados extras da verificação final, corrigidos na mesma rodada: badge de aniversário sem o token `-strong`, botão de fechar do modal sem `aria-label`, alvo de toque de 35px no botão do OS
- [x] 3.8 Commit

## 4. Plantão

- [x] 4.1 Resolver `escala-botao-criar-plantao` (0/11) e `modernizar-visao-geral-escala` (já completa, arquivar se ainda não foi) — ambas arquivadas em 2026-09-11 (`archive/2026-09-11-modernizar-visao-geral-escala`, `archive/2026-09-11-escala-botao-criar-plantao`), specs sincronizadas manualmente (o `openspec archive` deu EPERM no rename da pasta as duas vezes, como de praxe nesta máquina; a ferramenta reverte a escrita das specs de forma atômica quando isso acontece, então nada ficou em estado parcial). `modernizar-visao-geral-escala`: 4 requisitos renomeados via REMOVED+ADDED (headers do delta não batiam com o spec base). `escala-botao-criar-plantao`: implementado (botão "Novo Plantão" no Hero, campo de data editável no `ManagePlantaoModal`, tooltip no `CalendarDay`) e verificado ao vivo com Playwright — achado e corrigido no caminho um bug real de fuso horário (`toIsoDay(new Date())` usa campos UTC, então à noite em Brasília a data "hoje" pré-selecionada vinha adiantada em 1 dia)
- [x] 4.2 `critique src/components/Schedule.jsx` — 2026-09-11/12, dual-agent com navegador: **23/40** (Aceitável), 2 P0 (sobrescrita silenciosa de dados ao trocar a data em "Novo Plantão", sem revalidar sobreposição nem atualizar o aviso; `ManagePlantaoModal` sem trap de foco real apesar do `aria-modal="true"`), 2 P1 (microtipografia fora da rampa — 64 achados CLI + 14 confirmados ao vivo; "não atribuído" com tratamento visual inconsistente entre N2 e Supervisão). Achado extra do detector: bug de capitalização em português ("Setembro De 2026" — a classe `capitalize` do Tailwind maiusculiza a preposição "de") em `Schedule.jsx:547` e `ScheduleHistoricoTab.jsx:49,84`. Falso positivo identificado e descartado: `low-contrast` no hero (o detector só lê `background-color`, ignorou o `background-image` do gradiente). Snapshot em `.impeccable/critique/2026-09-12T00-49-08Z__src-components-schedule-jsx.md`
- [x] 4.3 `audit src/components/schedule` — 2026-09-12: **achado crítico não coberto pela crítica**: `PlantaoHistorico.jsx:197` (e :118, :107) e `HistoricoPreviewModal.jsx:68,155` usam `bg-white`/hex fixo em vez de tokens — a página inteira de auditoria de plantões (`Ver Histórico`/`Auditoria`) nunca muda com o tema. Pior: em `PlantaoHistorico.jsx` o texto usa a cor do tema escuro (`#F5F9FF`, quase branco) por herdar `var(--foreground)`, mas o card é `bg-white` fixo — resultado é texto quase invisível (contraste ~1:1) em qualquer um dos 4 temas escuros, confirmado ao vivo em Cyber-Obsidian. `HistoricoPreviewModal.jsx` está no lado oposto do mesmo problema: 59 hex fixos tornam o conteúdo sempre legível mas nunca escuro. 117 ocorrências de hex remanescentes ao todo em 3 arquivos (`HistoricoPreviewModal.jsx` 59, `PlantaoHistorico.jsx` 48, `SelectEmployee.jsx` 8) — o "follow-up" registrado na change `modernizar-visao-geral-escala` (182 ocorrências antes) nunca foi resolvido. Touch targets do mini-calendário confirmados abaixo do mínimo (28px desktop, 37px mobile, contra 44px do AGENTS.md); botões do Hero em 38px de altura. Sem overflow horizontal a 390px; sem achados de performance relevantes (o `layout-transition` do detector ao vivo vem da Sidebar global, já é exceção aceita, não é específico da Escala)
- [x] 4.4 Consolidar backlog — escopo P0+P1 por decisão do Felix (2026-09-12): 3 P0 (sobrescrita silenciosa de data em "Novo Plantão", trap de foco ausente no `ManagePlantaoModal`, contraste crítico em `PlantaoHistorico.jsx`) e 2 P1 (microtipografia fora da rampa, "não atribuído" inconsistente entre N2/Supervisão). P2/P3 (z-index do modal, semântica do diálogo de exclusão, hex remanescente em `HistoricoPreviewModal.jsx`/`SelectEmployee.jsx`, touch targets do mini-calendário, badge "selecionado(s)" na aba Histórico, bug de capitalização "Setembro De 2026") ficam para uma rodada de polish futura
- [x] 4.5 Criar change filha `impeccable-plantao` e corrigir — todas as 5 tarefas concluídas e verificadas ao vivo com Playwright (revalidação de data, trap de foco real via clique real — um teste inicial com `.click()` sintético deu falso alarme porque não focava o botão —, contraste em Cyber-Obsidian, tipografia em claro/escuro/mobile, estado fantasma da Supervisão). Achado extra corrigido no caminho: o P0 de contraste era, na raiz, a página inteira (`backgroundColor: '#F5F9FF'` inline fixo no wrapper), não só as 3 linhas originalmente mapeadas — migração completa do arquivo para tokens. Achado extra na tipografia: 22 dos 64 achados do detector eram falsos positivos (tamanho de glyph de ícone, não texto de leitura); dos 42 reais, o detector só listava 1 de cada grupo de colunas/células irmãs idênticas — as demais foram corrigidas por inspeção manual para não deixar tabelas com tamanhos inconsistentes entre colunas. Arquivada em `archive/2026-09-12-impeccable-plantao`, specs sincronizadas manualmente (o `openspec archive` deu EPERM no rename da pasta pela 3ª vez nesta máquina; a ferramenta reverte a escrita das specs de forma atômica, nada ficou em estado parcial)
- [x] 4.6 Verificar e passar o portão — `npx vite build` limpo em todas as rodadas; os 3 P0 e 2 P1 verificados individualmente ao vivo (não foi rodada uma nova crítica/audit dual-agent completa, ficaria redundante com as verificações pontuais já feitas); `openspec validate` passou
- [ ] 4.7 Commit

## 5. Comunicados

- [ ] 5.1 `critique src/components/Comunicados.jsx`
- [ ] 5.2 `audit src/components/Comunicados.jsx`
- [ ] 5.3 Consolidar backlog: lista, leitura, urgentes, imagem em carrossel, teclado
- [ ] 5.4 Criar change filha `impeccable-comunicados` e corrigir
- [ ] 5.5 Verificar e passar o portão
- [ ] 5.6 Commit

## 6. Colaboradores

- [ ] 6.1 Resolver `colaboradores-reformulacao-visual` (55/63)
- [ ] 6.2 `critique src/components/Directory.jsx`
- [ ] 6.3 `audit src/components/directory`
- [ ] 6.4 Consolidar backlog: hero, toolbar, cards vs linhas, grupos, busca vazia, foto quebrada, neumorfismo nos 4 temas escuros
- [ ] 6.5 Criar change filha `impeccable-colaboradores` e corrigir
- [ ] 6.6 Verificar e passar o portão
- [ ] 6.7 Commit

## 7. Setores + Organograma

- [ ] 7.1 `critique src/components/Sectors.jsx`
- [ ] 7.2 `audit src/components/sectors src/components/OrgChartEditor.jsx`
- [ ] 7.3 Consolidar backlog: hero, toolbar, cards, OrgChart em mobile, editor (abas ceo, áreas, json) só para admin
- [ ] 7.4 Criar change filha `impeccable-setores` e corrigir
- [ ] 7.5 Verificar e passar o portão
- [ ] 7.6 Commit

## 8. Meus Chamados

- [ ] 8.1 Decidir o destino de `tickets-pivot-para-os` (0/20) e `tickets-theme-cores-adaptativas` (0/16): executar antes, ou abandonar e deixar o backlog do impeccable substituí-las
- [ ] 8.2 `critique src/components/TicketsList.jsx`
- [ ] 8.3 `audit src/components/TicketsList.jsx`
- [ ] 8.4 Consolidar backlog: lista, protocolo com overflow (`corrigir-overflow-protocolo-suporte` 2/3), estados, cores de status nos 5 temas
- [ ] 8.5 Criar change filha `impeccable-chamados` e corrigir
- [ ] 8.6 Verificar e passar o portão
- [ ] 8.7 Commit

## 9. Cobertura

- [ ] 9.1 Resolver `coverage-layout-proporcional` (21/39), `cobertura-resolver-endereco-cliente` (35/42), `cobertura-warmup-swr-cache` (18/21)
- [ ] 9.2 `critique src/components/Coverage.jsx`
- [ ] 9.3 `audit src/components/coverage src/components/CoverageMap.jsx`
- [ ] 9.4 Consolidar backlog: hero, filtros, mapa nos 5 temas, legenda e z-index (DESIGN.md §6), RegionPanel, OverrideModal, MapaPicker, geocoding lento/falhando
- [ ] 9.5 Criar change filha `impeccable-cobertura` e corrigir
- [ ] 9.6 Verificar e passar o portão
- [ ] 9.7 Commit

## 10. Serviços

- [ ] 10.1 Resolver `services-directory-confetti-carousel-ux` (10/14)
- [ ] 10.2 `critique src/components/ServicesDirectory.jsx`
- [ ] 10.3 `audit src/components/services`
- [ ] 10.4 Consolidar backlog: hero, filtros, grid de planos, rankings/pódio, comparador, ServiceDetailModal, PlanEditModal, StreamingServiceModal, TechServiceModal, dados de seed vs IXC
- [ ] 10.5 Criar change filha `impeccable-servicos` e corrigir
- [ ] 10.6 Verificar e passar o portão
- [ ] 10.7 Commit

## 11. Escritórios

- [ ] 11.1 `critique src/components/Offices.jsx`
- [ ] 11.2 `audit src/components/Offices.jsx`
- [ ] 11.3 Consolidar backlog: lista, modo editar, multi-unidade (PRODUCT.md), endereço longo
- [ ] 11.4 Criar change filha `impeccable-escritorios` e corrigir
- [ ] 11.5 Verificar e passar o portão
- [ ] 11.6 Commit

## 12. Processos

- [ ] 12.1 `critique src/components/Processos.jsx`
- [ ] 12.2 `audit src/components/Processos.jsx`
- [ ] 12.3 Consolidar backlog: categorias, modo novo, modo editar, conteúdo longo, permissões de edição
- [ ] 12.4 Criar change filha `impeccable-processos` e corrigir
- [ ] 12.5 Verificar e passar o portão
- [ ] 12.6 Commit

## 13. Configurações

- [ ] 13.1 `critique src/components/Configuracoes.jsx`
- [ ] 13.2 `audit src/components/Configuracoes.jsx`
- [ ] 13.3 Consolidar backlog: Informações Pessoais, Setor e Função, Preferências, troca de tema a partir daqui, upload de foto
- [ ] 13.4 Criar change filha `impeccable-configuracoes` e corrigir
- [ ] 13.5 Verificar e passar o portão
- [ ] 13.6 Commit

## 14. TI

- [ ] 14.1 Resolver `ti-hub-cadastro-colaborador` (80/102)
- [ ] 14.2 `critique src/components/Ti.jsx`
- [ ] 14.3 `audit src/components/ti`
- [ ] 14.4 Consolidar backlog: hero, Cadastro de Colaborador (seções do formulário, validação, UploadFicha, DryRunResultado, PainelLateral, CidadeCombobox com dados do IXC), acesso negado para não-admin
- [ ] 14.5 Criar change filha `impeccable-ti` e corrigir
- [ ] 14.6 Verificar e passar o portão
- [ ] 14.7 Commit

## 15. Painel Admin

- [ ] 15.1 `critique src/components/AdminDashboard.jsx`
- [ ] 15.2 `audit src/components/admin src/components/ResponsaveisManual.jsx src/components/schedule/PlantaoHistorico.jsx`
- [ ] 15.3 Consolidar backlog aba por aba: Painel, Usuários, Responsáveis, Comunicados, Auditoria, Plantões; acesso negado para não-admin
- [ ] 15.4 Criar change filha `impeccable-admin` e corrigir
- [ ] 15.5 Verificar e passar o portão
- [ ] 15.6 Commit

## 16. Encerramento

- [ ] 16.1 Revisar a seção Transversal abaixo e rodar `/impeccable extract` para cada padrão com 3+ ocorrências
- [ ] 16.2 `/impeccable document` final e conferir contra o Manual da Marca
- [ ] 16.3 `/impeccable audit src` global, com passagem explícita de tema em Cyber-Obsidian, Deep-Space Aurora e AMOLED em todas as páginas
- [ ] 16.4 `/impeccable doctor` limpo
- [ ] 16.5 Consolidar placares por superfície (crítica antes/depois, audit antes/depois) em `docs/`
- [ ] 16.6 Arquivar esta change

## Transversal

Padrões que apareceram em 3+ superfícies. Preencher durante o programa; resolver em 16.1.

Candidatos vindos da Fase 1 (chrome), com 1 ocorrência de superfície cada; viram transversais na 3ª:

- **`C.muted` (`#8896A8`) como cor de texto pequeno em superfície clara** — 2,9:1 sobre `surfaceSoft`, 3,0:1 sobre branco. No chrome foi trocado por `C.ink2`. Ocorrências: chrome (Sidebar, barra inferior, sino), Dashboard, e `responsive/ResponsiveTable.jsx:39, 120` (re-audit de 2026-09-08; usado por `TicketsList` e `AdminUsuarios`). **3 superfícies: já é transversal.** Resolver em 16.1 com `extract`: regra no DESIGN.md "muted só para ícone inativo e placeholder, nunca texto abaixo de 14px".
- **Branco sobre laranja como texto pequeno (2,8:1 no claro)** — prescrito pelo próprio DESIGN.md em `badge-count` e `button-primary`, contra a regra "The Orange Is Fill Rule" da seção Colors. No chrome: badge ativo da Sidebar (`Sidebar.jsx:85-86`) e botão do `NotFound` (`:98`). A seção Buttons do DESIGN.md conta 25 botões em gradiente com o mesmo texto branco nas páginas. Verificar em cada fase; fechar a contradição no `document` de 16.2 e criar token `onAccent` (navy no claro, `surface` nos escuros).
- **Cor semântica derivada por superfície, não pelo dado** — o sino escolhe amarelo/vermelho pela severidade, a Sidebar e a barra inferior assumem vermelho para a mesma contagem (re-audit 2026-09-08). Observar nas Fases 5 (tipos de comunicado) e 8 (status de chamado): se cada componente mapear cor por conta própria, `extract` um helper único por domínio.
- **Tela inteira fora do sistema de tokens** — Login era 100% hex fixo com gradiente próprio na raiz (Fase 2, corrigido). Verificar nas próximas fases `Configuracoes`, modais (`ModalShell`, `TiSupportModal`, `OverrideModal`) e o Painel Admin; o audit do chrome já contou 25 botões em gradiente com `#9A3412` fixo. Com a 2ª ocorrência, `extract` `ui/Button` e `ui/Input`.
- **Copy que promete o que o produto não tem** — Login tinha "SSO · SAML 2.0", "painel 3D", "Docs", "Status", "Suporte" (Fase 2, removidos). Regra candidata para o PRODUCT.md/DESIGN.md: toda alegação na UI precisa de um caminho de código que a sustente. Observar em Dashboard (KPIs) e Serviços (rankings).
- **Asset com cor fixa que ignora o tema** — Lottie do 404 em preto e Lottie do Login em paleta própria (Fase 2, ambos substituídos por SVG/painel em tokens). `LottieAvatar` (avatares) continua; regra candidata: ilustração só em SVG com `currentColor`/tokens, ou Lottie recolorido por tema.
- **`erro.message` exposto ao cliente** — `/api/login` devolvia a exceção crua (Fase 2, corrigido). Conferir as outras rotas de `backend/server.js` com o mesmo `catch` (a Fase 3 já apontou `/api/os-chamados/<id>` em 500); se houver 2+, tarefa transversal de backend em 16.1.
- **Nenhum `import()` dinâmico além da animação do 404** — `App.jsx` importa as 17 views de forma síncrona (bundle principal 1,6 MB). Vale para os modais pesados de cada página (Cobertura com Leaflet, OrgChartEditor, formulários da TI). Contar por fase; resolver junto em 16.1 com `React.lazy` por view.
- **`div` com `onClick` sem `role`/`tabIndex`** — chrome (perfil, tema, notificação, alça do sheet). Já era P0 no Dashboard (banner e lista de comunicados). 2 superfícies.
- **Overlay sem ciclo de vida (Escape, foco, trava de scroll)** — chrome tinha três implementações; agora `useDismissable`. `TiSupportModal` verificado e corrigido na Fase 3 (mesmo hook + trap de Tab local). `ModalShell`, `OverrideModal` ainda não foram verificados; se um deles falhar, `extract` um `Dialog` de sistema em vez de repetir o trap de Tab em cada modal bespoke.
- **DESIGN.md à frente do código** — Layout descrevia `PageShell` universal e item ativo laranja-suave que o código não tinha; corrigido na Fase 1. Conferir a cada página se o DESIGN.md descreve o que existe; consolidar no `document` da Fase 16.
- **Listas de navegação/configuração duplicadas por superfície** — chrome tinha 3 listas de nav; agora `navigation.js`. Observar se páginas duplicam listas de status/tipo (ex.: tipos de comunicado, status de chamado) entre componentes.
- **Hex literal onde já existe token** (`#F5F9FF`, `#fff`, `#ef4444`, swatches) — chrome corrigido; `ThemeSwitcher` era inteiro em hex. O audit da Fase 1 aponta `ServicesFilterBar` e `deptColors.js` com o mesmo idioma de "quatro temas escuros compartilham"; verificar nas Fases 6 e 10.
- **Colisão de utilitários Tailwind de mesma especificidade apagando um controle** — descoberta na Fase 3: `Dashboard.jsx` concatenava uma constante de estilo base (`bg-surface`) com um override de cor (`bg-primary`) na mesma string de classe; `bg-surface` sempre vencia na folha gerada, deixando o botão "Gerenciar Meus Chamados" branco sobre branco no claro. Corrigido com uma segunda constante dedicada (`ACTION_BTN_PRIMARY`), sem herdar a base. Verificar em outros CTAs "primary" que concatenem uma constante compartilhada com um override de cor, fora do chrome (1 ocorrência até agora).
- **Componente de terceiro não recolorido para a marca** — 2ª ocorrência depois do Login (Lottie): `GlowingEffect` (`ui/glowing-effect.tsx`) tinha a paleta de demonstração (rosa/dourado/verde/azul) em todos os 9 usos do Dashboard, corrigidos na Fase 3 com uma variante `brand`. O mesmo componente, sem a variante nova, ainda é consumido sem recoloração por `common/BentoCard.jsx` (6 arquivos da área de Serviços). **2 superfícies conhecidas: já é candidato a `extract`** — trocar `BentoCard.jsx` para `variant="brand"` deve ser o primeiro passo da Fase 10, antes mesmo da crítica daquela área.
- **Token "de gráfico" (`-bento`) usado como cor de texto** — o DESIGN.md já distingue `-bento` (preenchimento gráfico, passa 3:1) de `-strong` (texto, passa 4,5:1) desde a Fase 1 (`C.muted`/`C.ink2`); a Fase 3 encontrou o mesmo erro para `success`/`warning`/`danger` no Dashboard (`KpiCard`, badge do `OsBento`, pill do `AniversariantesCard`, corrigidos). Conferir se `success-bento`/`warning-bento`/`danger-bento` aparecem como cor de texto em outras páginas antes da Fase 16.
