## Why

A crítica dual-agent isolada (Assessment A 17/40, Assessment B com achados ao vivo convergentes) e o audit técnico direto (5/20 — a pior nota já registrada neste programa) da Fase 15 encontraram 5 problemas P0 e 7 P1 no Painel Admin (`src/components/AdminDashboard.jsx` + `src/components/admin/*` + `src/components/ResponsaveisManual.jsx`):

- **P0**: o header do painel usa `background: 'rgba(255,255,255,0.88)'` hardcoded — nunca muda de tema. Medido ao vivo: o nome "Prestek Admin" cai para 1,23-1,32:1 nos 4 temas escuros, no cabeçalho **persistente das 6 abas**.
- **P0**: conceder/revogar privilégio de administrador (`AdminUsuarios.jsx`) dispara a gravação direto no clique — sem confirmação, sem desfazer, com o rótulo mostrando o estado ATUAL em vez da ação que o clique vai executar. É a ação de maior privilégio do produto inteiro, e a única sem nenhuma proteção — excluir um comunicado (reversível) já tem `window.confirm`.
- **P0**: os 3 cards de atalho do painel (`<div onClick>`) não têm `role`/`tabIndex`/`onKeyDown` — inatingíveis por teclado, mesma classe do P0 do `gradient-card.jsx` (Fase 10).
- **P0**: o modal de criar/editar comunicado — que edita o feed publicado para a empresa inteira — não tem NENHUMA semântica de diálogo: sem `role`, sem trap de Tab, Escape não fecha, foco não entra nem retorna.
- **P0**: a aba "Plantões" fica inatingível abaixo de 1024px — a barra de navegação inferior mobile só mostra 4 das 6 abas, sem nenhum menu de sobra.
- **P1**: `C.surface` como texto sobre `C.accent` no item ativo da barra lateral — 2,79:1 no claro (badge de contagem 2,20:1), passa nos 4 temas escuros por coincidência de token (o mesmo achado já apontado em Pendências desde a Fase 8, agora confirmado e corrigido).
- **P1**: texto branco sobre laranja/gradiente reprovando em TODOS os 5 temas em vários controles (botão "Sair", card de atalho em gradiente, botão "Filtrar" da Auditoria com hex hardcoded, pills de Responsáveis).
- **P1**: `C.accentDeep` sobre `C.accentSoft` (pill "Admin" do `AdminUsuarios.jsx`) passa no claro (8,83:1) mas reprova nos 4 temas ESCUROS (1,50-1,93:1) — direção inversa da recorrência usual deste antipadrão.
- **P1**: `C.muted` como texto real em 6+ lugares (2,85-3,01:1 no claro) — 7ª+/8ª+ recorrência do antipadrão mais repetido do programa.
- **P1**: zero `aria-current`/`aria-selected`/`aria-pressed`/`aria-live` na tela inteira.
- **P1**: 8+ alvos de toque abaixo de 44px.
- **P1**: `ICONE_ACAO`/`ICONES_ACAO` duplicados entre `AdminDashboard.jsx` e `AdminAuditoria.jsx`, com cores DIFERENTES para a mesma ação (`create_comunicado`).

Achado colateral: duas specs base já arquivadas (`admin-panel-overview-bento`, `bento-blue-admin-auditoria-polish`) descrevem uma paleta "Bento Blue" (azul `#4A9EF5`) que não existe mais no código atual (laranja `C.accent`/`#EC7D23`) — mesma classe de gap já catalogada em specs de Tickets (Fase 8) e Rankings (Fase 10).

## What Changes

- **Corrige** o header para usar um tom reativo ao tema em vez de branco hardcoded.
- **Adiciona** um diálogo de confirmação (nunca `window.confirm()` nativo) antes de conceder ou revogar admin, com rótulo descrevendo a AÇÃO (não o estado atual) e nome acessível completo.
- **Corrige** os 3 cards de atalho para elementos de botão reais, alcançáveis por teclado.
- **Adiciona** semântica de diálogo completa ao modal de comunicado (`role="dialog"`, trap de Tab, Escape, foco inicial e de retorno, `htmlFor`/`id` nos 5 campos).
- **Corrige** a navegação mobile para expor as 6 abas (não só 4).
- **Corrige** `C.surface`→`C.onAccent` no item ativo da navegação; gradientes e botões sólidos com laranja recalculados para passar em todos os 5 temas; `C.accentDeep`→`isDark ? C.accentDark : C.accentDeep` na pill "Admin"; `C.muted`→`C.ink2`/`text-faint` conforme o sistema de token do arquivo.
- **Adiciona** `aria-current="page"` nos itens de navegação ativos.
- **Corrige** os 8+ alvos de toque para 44px mínimos.
- **Unifica** `ICONE_ACAO`/`ICONES_ACAO` num único módulo compartilhado.
- **Reescreve** as duas specs base "Bento Blue" para descrever a paleta laranja real, incorporando os requisitos novos de acessibilidade/contraste/segurança desta fase.

## Capabilities

### Modified Capabilities

- `admin-panel-overview-bento`: reescrita da paleta (azul abandonado → laranja real) e requisitos novos de tema do header, navegação por teclado dos cards, alcance mobile das 6 abas, `aria-current` e módulo único de ícones de ação.
- `bento-blue-admin-auditoria-polish`: reescrita da cor do botão "Filtrar" (azul abandonado → laranja real) com requisito de contraste em todo tema.
- `admin-comunicados-panel`: ganha requisito de semântica de diálogo completa no modal de criar/editar.

### New Capabilities

- `admin-usuarios-seguranca`: confirmação obrigatória antes de conceder/revogar privilégio de administrador, com rótulo descrevendo a ação e nome acessível completo.

## Impact

- **Arquivos**: `src/components/AdminDashboard.jsx`, `src/components/admin/AdminUsuarios.jsx`, `src/components/admin/AdminComunicados.jsx`, `src/components/admin/AdminAuditoria.jsx`, `src/components/ResponsaveisManual.jsx`, novo `src/components/admin/iconeAcao.js`
- **Sem impacto** em dado real — todos os fixes são de interface; a única mudança de comportamento é EXIGIR confirmação onde hoje uma gravação real acontecia sem ela (mais seguro, nunca menos)
- **Fora de escopo** (registrado em Pendências): 3× `alert()` cru com erro de backend fora do fluxo de conceder/revogar admin; `window.confirm()` nativo na exclusão de comunicado; 7+ rótulos sem `htmlFor` fora do modal de comunicado; dois sistemas de token entre painéis-irmãos (arquitetural, não um bug pontual); falha silenciosa de `dashboard-stats` mascarada de estado vazio; `ResponsaveisManual` escrevendo sem confirmação (mesma classe do achado de admin, um degrau abaixo em consequência); copy inconsistente ("Ações (g)", "Super Admin" fabricado, nomenclatura divergente de KPIs); 2 chips de Auditoria hardcoded-claro; `text-faint/60` desfazendo a correção de opacidade da Fase 12; hierarquia de heading h1→h3.
