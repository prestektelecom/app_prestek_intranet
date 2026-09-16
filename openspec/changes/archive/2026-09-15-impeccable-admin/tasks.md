## 1. Header reativo ao tema (P0)

- [x] 1.1 `AdminDashboard.jsx`: `background: 'rgba(255,255,255,0.88)'` → `tone(C.surface, 0.88)`. Achado no caminho: `C.surface` no tema Cyber já vem como string `rgba(...)`, não hex — a função `tone()` local foi estendida para reconhecer os dois formatos.
- [x] 1.2 Verificado ao vivo nos 3 temas mais relevantes: claro (header `rgba(255,255,255,0.88)`, wordmark 16,42:1), Cyber (header `rgba(17,28,44,0.88)`, wordmark 18,64:1) e AMOLED (header `rgba(10,10,10,0.88)`, wordmark 21:1) — o pior caso documentado antes da correção (branco fixo nos 4 temas escuros) não existe mais

## 2. Confirmação antes de conceder/revogar admin (P0)

- [x] 2.1 `AdminUsuarios.jsx`: novo estado `confirmando`; `onClick` do botão da tabela abre o modal em vez de chamar `toggleAdmin` direto
- [x] 2.2 Modal de confirmação com `useDismissable`+`trapTab` local (padrão de `Comunicados.jsx`), nomeando a pessoa e o efeito; botão de confirmação com cor por severidade (laranja conceder / vermelho revogar)
- [x] 2.3 Botão da tabela: rótulo passa a nomear a AÇÃO do clique ("Conceder"/"Revogar"), não o estado atual ("Admin"/"Usuário"); `aria-label` completo (ex.: "Revogar acesso admin de FULANO")
- [x] 2.4 Erro do `toggleAdmin`: `alert()` → estado de erro inline no modal com `role="alert"`
- [x] 2.5 Verificado ao vivo usando a conta de teste real "MARCIO - TESTES" (nunca a conta do próprio Felix, nunca confirmado de fato): modal abre com `role="dialog"`/`aria-modal="true"`/`aria-labelledby` resolvendo para "Revogar acesso de administrador"; texto nomeia a pessoa; foco inicial em "Cancelar"; Escape fecha e devolve o foco exato ao botão que abriu; Shift+Tab do primeiro item vai para o último e volta; fechar por "Cancelar" confirmado não alterando o status da conta (continua "Admin" depois); botões medem exatamente 44px; contraste 5,36:1 (revogar/vermelho) e 11,68:1 (conceder/laranja) no tema Cyber

## 3. Cards de atalho alcançáveis por teclado (P0)

- [x] 3.1 `AdminDashboard.jsx`: os 3 cards de `<div onClick>` → `<button type="button">`
- [x] 3.2 Verificado ao vivo: os 3 `tabIndex === 0`, focáveis via `.focus()`; Enter no card "Comunicados" focado navegou para a aba "Gerenciar Comunicados" com o mesmo efeito de um clique

## 4. Semântica de diálogo no modal de comunicado (P0)

- [x] 4.1 `AdminComunicados.jsx`: `useDismissable`+`trapTab` local + `FOCUSABLE`, copiado do `CrudModal` de `Comunicados.jsx`
- [x] 4.2 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no `<h2>`
- [x] 4.3 5 campos ganham `htmlFor`/`id`; botão de fechar ganha `aria-label="Fechar"`
- [x] 4.4 Verificado ao vivo (sem salvar/excluir um comunicado real): `role="dialog"`/`aria-modal`/`aria-labelledby` resolvendo para "Novo Comunicado"; os 5 `label[for]` resolvem para o campo certo; Escape fecha o modal. Achado de metodologia: a 1ª tentativa de testar o retorno de foco via `element.click()` programático (não um clique real do Playwright) deu falso-negativo (foco caiu em `<body>`) — refeito com um clique real (`browser_click`), confirmando o foco retornando exatamente ao botão "Novo Comunicado" que abriu o modal

## 5. Alcance mobile das 6 abas (P0)

- [x] 5.1 `AdminDashboard.jsx`: barra inferior mostra as 6 abas, não `slice(0, 4)`
- [x] 5.2 Verificado ao vivo em 390px: as 6 abas visíveis (Painel/Usuários/Responsáveis/Comunicados/Auditoria/Plantões), cada uma medindo 61px de altura, `aria-current="page"` presente só na aba ativa

## 6. Contraste (P1)

- [x] 6.1 `NavRow` (`AdminDashboard.jsx`): `C.surface`→`C.onAccent` (texto e ícone do item ativo, badge)
- [x] 6.2 Botão "Sair": `text-white` fixo → `style={{ color: C.onAccent }}`
- [x] 6.3 Card de atalho em gradiente + cabeçalho do modal de comunicado: 3º stop (`C.accent`) removido, gradiente capado em `C.accentDeep`→`C.accentDark`
- [x] 6.4 `AdminAuditoria.jsx`: botão "Filtrar" `bg-[#EC7D23]`→`bg-[var(--accent)]`, texto `text-[var(--on-accent)]`
- [x] 6.5 `AdminUsuarios.jsx`: pill de privilégio `C.accentDeep`→`isDark ? C.accentDark : C.accentDeep` (novo `isDark`, `BENTO_LIGHT` importado)
- [x] 6.6 `C.muted`→`C.ink2` em `AdminDashboard.jsx`, `AdminUsuarios.jsx`, `AdminComunicados.jsx`, `ResponsaveisManual.jsx` (icones decorativos isolados mantidos); `text-muted`→`text-faint` em `AdminAuditoria.jsx` (incluindo `text-faint/60`→`text-faint` sem opacidade); `C.accent` como texto real em `ResponsaveisManual.jsx` (nome do responsável manual) também corrigido com o mesmo `isDark`
- [x] 6.7 Verificado ao vivo em claro, Cyber e AMOLED: "Filtrar" 6,11:1 (Cyber) com fundo `rgb(249,115,22)`/texto `rgb(17,28,44)` resolvidos corretamente das variáveis CSS; "Ver Tudo" 11,68:1; item ativo da navegação 6,22:1 (claro)/7,06:1 (AMOLED)

## 7. `aria-current` na navegação (P1)

- [x] 7.1 `NavRow` e botões da barra inferior: `aria-current={ativo ? 'page' : undefined}`
- [x] 7.2 Verificado ao vivo: `aria-current="page"` presente só no item ativo, confirmado nos dois navs (lateral e barra inferior mobile)

## 8. Alvos de toque (P1)

- [x] 8.1 Botão "Sair", link "Ver Tudo", pill de privilégio, filtro/paginação da Auditoria, limpar-busca do `AdminUsuarios.jsx`, "Atualizar"/"Buscar"/"Novo Comunicado"/"Criar primeiro comunicado" → 44px mínimos
- [x] 8.2 Verificado ao vivo via `getBoundingClientRect`: "Filtrar" 44px, "Ver Tudo" 44px, pills de privilégio 44px, itens da barra inferior mobile 61px

## 9. Módulo único de ícone de ação (P1)

- [x] 9.1 Criado `src/components/admin/iconeAcao.js` com o mapa único
- [x] 9.2 `AdminDashboard.jsx` e `AdminAuditoria.jsx` importam do módulo único, cópias locais removidas
- [x] 9.3 Verificado por leitura de código: `create_comunicado` agora usa a mesma definição (`bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400`) nos dois arquivos — a divergência de cor (laranja vs. o antigo hex claro-fixo `#FFF7ED`/`#C2410C` da Auditoria) deixou de existir; de brinde, o ícone "create_comunicado" e o ícone de fallback da Auditoria ganharam variante `dark:`, que não tinham antes (P2 da Assessment A resolvido de graça)

## 10. Reconciliação das specs "Bento Blue"

- [x] 10.1 Reescrita `admin-panel-overview-bento` para a paleta laranja real + requisitos novos desta fase
- [x] 10.2 Reescrita `bento-blue-admin-auditoria-polish` para o botão "Filtrar" laranja real
- [x] 10.3 `admin-comunicados-panel` ganhou requisito de semântica de diálogo
- [x] 10.4 Nova spec `admin-usuarios-seguranca` (confirmação antes de mudar privilégio)

## 11. Fechamento

- [x] 11.1 `npx vite build` limpo (4 rodadas ao longo da implementação)
- [x] 11.2 `openspec validate impeccable-admin --strict` limpo
- [x] 11.3 Commit
