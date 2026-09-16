## Context

Fase 15 do programa Impeccable (`openspec/changes/programa-impeccable/tasks.md`, seção 15). Crítica dual-agent isolada — Assessment A 17/40 (Ruim), Assessment B com achados ao vivo convergentes — e audit técnico direto 5/20 (Crítico) — a pior nota já registrada neste programa. Escopo aprovado pelo Felix: P0 + P1.

Achado colateral: duas specs base (`admin-panel-overview-bento`, `bento-blue-admin-auditoria-polish`) descrevem uma paleta "Bento Blue" (`#4A9EF5`) que não existe mais no código — o painel inteiro usa laranja (`C.accent`/`#EC7D23`) há tempos. Mesma classe de gap já catalogada nas specs de Tickets (Fase 8) e Rankings (Fase 10) — reescritas para a paleta real como parte desta change, em vez de arquivar informação errada.

## Decisões técnicas

### 1. Header: `tone(C.surface, 0.88)` no lugar de `rgba(255,255,255,0.88)`

O header do painel usa um fundo translúcido com blur para o efeito "glass" — a intenção visual é legítima, só a cor de base estava hardcoded em branco. `AdminDashboard.jsx` já define um helper `tone(hex, alpha)` local; a correção troca o literal por `tone(C.surface, 0.88)`, mantendo o mesmo efeito visual mas reagindo ao tema (branco translúcido no claro, quase-preto translúcido no AMOLED, etc.).

### 2. Confirmação de admin: modal local em `AdminUsuarios.jsx`, nunca `window.confirm()`

Este projeto baniu `window.confirm()`/`alert()` nativos desde a Fase 2 (recorrências pontuais registradas em Pendências, nunca reintroduzidas de propósito). A ação de conceder/revogar admin ganha um modal de confirmação PRÓPRIO, no mesmo padrão `useDismissable`+`trapTab` local já usado em `Comunicados.jsx`/`Offices.jsx`/`OrgChartEditor.jsx`/`TiSupportModal.jsx` — não um novo mecanismo. O modal nomeia a pessoa e o efeito ("Conceder acesso de administrador a Fulano de Tal" / "Revogar acesso de administrador de Fulano de Tal"), com um botão "Cancelar" e um botão de confirmação cuja cor reflete a severidade (laranja para conceder, vermelho para revogar — revogar o próprio acesso por engano é mais perigoso para quem opera o painel do que conceder). O botão da tabela deixa de disparar a gravação direto: `onClick` agora abre o modal (`setConfirmando(usuario)`), e o texto do botão passa a nomear a AÇÃO do clique, não o estado atual — hoje um admin mostra "Admin" (o que ELE é); passa a mostrar "Revogar" quando é admin e "Conceder" quando não é (o que o CLIQUE faz), resolvendo o achado de rótulo ambíguo das duas avaliações.

### 3. Erro do `toggleAdmin`: toast local com `role="alert"`, não `alert()`

Como o fluxo inteiro já está sendo reconstruído para ter confirmação, o `alert(`Erro: ${e.message}`)` desta ação específica é substituído por um estado de erro inline no próprio modal (`role="alert"`), sem introduzir um sistema de toast novo para o arquivo inteiro — os outros 2 `alert()` do painel (fora do fluxo de admin) ficam fora do escopo desta change, registrados em Pendências.

### 4. Cards de atalho: `<button>` real em vez de `<div onClick>`

Os 3 cards da seção "Atalhos" trocam a tag de `<div>` para `<button type="button">`, preservando todas as classes visuais — a mudança de elemento HTML sozinha já resolve foco/Enter/Espaço/`role` sem precisar reimplementar semântica de teclado manualmente (mais simples e mais robusto que adicionar `role`/`tabIndex`/`onKeyDown` a uma div, e nenhum desses cards tem um botão aninhado dentro que precisaria da guarda `target !== currentTarget` da Fase 10).

### 5. Modal de comunicado: `useDismissable`+`trapTab` local, copiado do `CrudModal` de `Comunicados.jsx`

`AdminComunicados.jsx` e `Comunicados.jsx` compartilham a mesma anatomia de modal (mesmo `getInputStyle`/`focusedInput`, mesmos nomes de campo) — quase certamente a versão admin foi copiada de uma versão ANTERIOR de `Comunicados.jsx`, antes da correção da Fase 5. A correção replica exatamente o padrão já em produção em `Comunicados.jsx` (`useDismissable(modalRef, { open, onClose, lockScroll: true, closeOnOutside: true })` + `trapTab` local + `FOCUSABLE`), em vez de inventar um mecanismo novo: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para o `<h2>`, foco inicial automático (o hook já move o foco para o primeiro controle focável que não seja o gatilho), foco de retorno automático ao fechar. Os 5 campos ganham `htmlFor`/`id`; o botão de fechar (ícone "close") ganha `aria-label="Fechar"`.

### 6. Navegação mobile: as 6 abas cabem na barra inferior

A barra inferior mostrava só `menuItens.slice(0, 4)`. Em vez de construir um menu "Mais" novo (a barra do painel admin é um componente próprio, fora do shell principal, sem acesso ao `MobileMoreSheet` do app), a correção mostra as 6 abas na mesma barra — cada rótulo já usa só a primeira palavra (`label.split(' ')[0]`), então 6 colunas de ~65px em 390px cabem com ícone+rótulo curto, mesma densidade já usada noutras barras do projeto. Mais simples e sem introduzir um componente novo para um painel que só tem 6 itens ao todo.

### 7. Contraste: `C.onAccent` para texto sólido sobre `C.accent`, gradiente capado, `isDark` para `accentDeep`/`accentDark`, `C.ink2`/`text-faint` para texto real

- **Item ativo da navegação** (`NavRow`, `C.surface`→texto): troca para `C.onAccent` — o token do projeto feito exatamente para "texto sobre o laranja" (comentário de `useBentoTheme.js`: "branco sobre o accent rende 2,8:1 no claro, então é navy; nos escuros, a superfície do tema").
- **Botão "Sair"**: mesma troca, `C.surface`... espera, já usa `background: C.accent` com `text-white` fixo via classe Tailwind — troca a classe fixa por `style={{ color: C.onAccent }}`.
- **Card de atalho em gradiente**: mesmo raciocínio da Fase 14 — a ponta mais clara do degradê (`C.accent`) não sustenta texto branco. Capado para dois tons escuros (`C.accentDeep`→`C.accentDark`), removendo o terceiro stop.
- **Botão "Filtrar" da Auditoria** (sistema de variável CSS, não o hook JS): troca `bg-[#EC7D23]` fixo por `bg-[var(--accent)]` + `text-[var(--on-accent)]` (o par correto já documentado no `DESIGN.md`), substituindo também o hover hardcoded.
- **Pill "Admin" do `AdminUsuarios.jsx`** (`C.accentDeep` sobre `C.accentSoft`): recebe o mesmo padrão já usado em `ChipButton.jsx`/`Coverage.jsx`/`Configuracoes.jsx` — `isDark ? C.accentDark : C.accentDeep`, com `isDark = C.bg !== BENTO_LIGHT.bg`.
- **`C.muted` como texto real**: em todos os arquivos que usam o hook JS (`AdminDashboard.jsx`, `AdminUsuarios.jsx`, `ResponsaveisManual.jsx`), troca para `C.ink2`. Em `AdminAuditoria.jsx` (sistema de variável CSS), `text-muted`→`text-faint`, e o achado extra da Assessment A (`text-faint/60` no timestamp, que a opacidade de 60% desfaz o ganho de contraste da correção da Fase 12) vira `text-faint` sem modificador de opacidade.

### 8. `aria-current="page"` nos itens de navegação ativos

Tanto o `NavRow` da barra lateral quanto os botões da barra inferior ganham `aria-current={ativo ? 'page' : undefined}` — o mesmo padrão já usado na bandeja de ferramentas da aba TI (Fase 14).

### 9. Alvos de toque: `min-h-[44px]` pontual

Diferente da Fase 14 (onde uma constante compartilhada cobria a maioria dos casos), aqui os controles sub-44px estão espalhados em 4 arquivos sem um estilo compartilhado — a correção aplica `min-h-[44px]` (ou ajusta padding) ponto a ponto: botão "Sair", link "Ver Tudo" (`padding` extra sem mudar o tamanho do texto), pill de admin (36px→44px, junto da mudança de rótulo da decisão 2), filtro/edição da Auditoria, botão limpar-busca do `AdminUsuarios.jsx`, paginação da Auditoria.

### 10. `ICONE_ACAO`/`ICONES_ACAO`: módulo único `src/components/admin/iconeAcao.js`

As duas cópias divergiam na cor de `create_comunicado` — evidência de que já saíram de sincronia uma vez e vão sair de novo. Um módulo só, importado pelos dois arquivos, elimina a classe inteira de bug (não só o sintoma pontual encontrado agora).

## Verificação

Cada fix verificado ao vivo via Playwright em claro e AMOLED, sem gravar nenhum dado real: o fluxo de conceder/revogar admin testado até a ABERTURA do modal de confirmação (nunca confirmado de fato, per a restrição padrão do programa de nunca mutar dado real de usuário); o modal de comunicado testado com Escape/Tab/foco sem submeter o formulário; os 3 cards testados com Tab+Enter sem soltar o clique real (ou soltando apenas quando o destino é a mesma aba já ativa, sem efeito colateral); a barra mobile testada em 390/768px contando os 6 itens visíveis; contraste medido nos pontos citados em claro e AMOLED; alvos de toque medidos via `getBoundingClientRect`.
