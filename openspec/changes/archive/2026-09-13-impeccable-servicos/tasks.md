## 1. Teclado no GradientCard (P0)

- [x] 1.1 Adicionado `role="button"`, `tabIndex={0}` e `onKeyDown` (Enter/Espaço → `handleClick`) ao `motion.div` externo de `ui/gradient-card.jsx`, com guarda `e.target !== e.currentTarget` para não disparar quando o foco está num botão aninhado
- [x] 1.2 Verificado ao vivo: Tab até o card + Enter abriu `ServiceDetailModal` ("300 Mega"); com foco no botão "Editar Plano" aninhado, Enter abriu SÓ o `PlanEditModal` (1 diálogo, não 2) — guarda funcionando

## 2. Semântica de diálogo (P0)

- [x] 2.1 Aplicado `useDismissable` + `trapTab` local + `role="dialog"`/`aria-modal`/`aria-labelledby` em `services/modals/ModalShell.jsx` (usado por `PlanEditModal`/`TechServiceModal`/`StreamingServiceModal`)
- [x] 2.2 Aplicado o mesmo padrão ao diálogo de exclusão inline em `ServicesDirectory.jsx`
- [x] 2.3 Adicionado `trapTab` local ao `ServiceDetailModal.jsx` (já tinha Escape/foco inicial/role, só faltava o trap de Tab)
- [x] 2.4 Verificado ao vivo nos 3 diálogos testados (`PlanEditModal`, diálogo de exclusão de Serviço Técnico, `ServiceDetailModal`): Escape fecha todos sem confirmar/salvar nada; Shift+Tab do primeiro item vai para o último (trap funcionando); Tab do último item volta ao primeiro (`ServiceDetailModal`: 3 focáveis, Tab de "Editar" — último — voltou para "Fechar" — primeiro). Nenhum dado real tocado durante a verificação.

## 3. Cores do Rankings (P1)

- [x] 3.1 `RankingsSection.jsx`: heading `text-slate-900 dark:text-white` → `text-foreground`; ícone do heading `text-[#C2410C]` → `text-[var(--accent)]`; tabs inativas `bg-[#FFF7ED] text-[#9A3412] hover:bg-[#D6E9FF] dark:...` → `bg-[var(--accent-soft)] text-[var(--accent-dark)] hover:opacity-80` (removeu de quebra o resquício azul `#D6E9FF` da paleta "Bento Blue")
- [x] 3.2 `RankingPodium.jsx`: heading → `text-foreground`; `LEGENDA` unificada para uma única classe `bg-[var(--accent-soft)] text-[var(--accent-dark)]` nas 3 entradas (antes 3 pares hex quase-duplicados); `RANK_STYLES` (cartão opaco do pódio) ficou intocado por design — é uma identidade "troféu" fixa, texto interno já em branco/claro contra fundo próprio
- [x] 3.3 Corrigido `openspec/specs/gamificacao-podio-vendas/spec.md`: removida a "Interactive Confetti Celebration" (confete já tinha sido removido pela change `services-directory-confetti-carousel-ux`, arquivada nesta mesma sessão, mas a spec nunca foi atualizada) e a "Premium Visual Podiums" corrigida (brilho "azul/ciano" → laranja da marca; formalizado que só o pódio opaco é fixo por tema, cabeçalho/legenda usam tokens)
- [x] 3.4 Verificado ao vivo: heading 21:1 (AMOLED); legenda e tab inativa 12,45:1 (AMOLED) e 4,88:1 (claro) — ambos muito acima do piso de 4,5:1

## 4. Contraste de texto secundário (P1)

- [x] 4.1 Trocado `text-muted` → `text-faint` nos usos como texto real em: `ModalShell.jsx` (hint, botão Cancelar — o ícone de fechar ficou `text-muted` de propósito, é ícone isolado), `PlanEditModal.jsx` (campo desabilitado), `ServiceDetailModal.jsx` (6 instâncias), `ServicesFilterBar.jsx` (rótulo "Ordenar por:" e texto do sort inativo), `ServicesDirectory.jsx` (subtítulos das abas Técnico/Streaming e diálogo de exclusão, 4 instâncias), `PlansGrid.jsx` (estado vazio), `RankingPodium.jsx` (estado vazio), `RankingsSection.jsx` (subtítulo), `PlanoComparador.jsx` (8 instâncias — feature atrás da flag `COMPARADOR_PLANOS_ATIVO=false`, corrigido por higiene mas não verificável ao vivo hoje)
- [x] 4.2 Medido ao vivo: "Ordenar por:" 2,85:1 → 7,28:1 no claro (AMOLED já passava, 5,92:1, antes e depois); legenda/tab do Rankings medidos junto com a tarefa 3.4

## 5. Alvos de toque (P1)

- [x] 5.1 `ServicesFilterBar.jsx`: `min-h-[44px]` nos botões de ordenação — medido 44px (era 32px)
- [x] 5.2 `ServicesHero.jsx`: toggle Velocidade/Dia manteve a caixa visual compacta (24,5px, painel denso do hero) e ganhou expansão por pseudo-elemento assimétrica (`after:-inset-x-1 after:-inset-y-[10px]`) — confirmado via `elementFromPoint` 8px acima da caixa visual resolvendo para o botão
- [x] 5.3 `PlanoBentoCard.jsx`: botão de editar (único, sem vizinho) ganhou `after:-inset-3` — confirmado via `elementFromPoint` 8px à direita da caixa visual (22×32) resolvendo para o botão
- [x] 5.4 `TechBentoCard.jsx`/`StreamingBentoCard.jsx`: padding real `p-1.5`→`p-2` (caixa visual foi de ~26px para 30×40) e gap `gap-1`→`gap-3` (12px) entre editar/excluir, com `after:-inset-1.5` (6px) em cada — 1ª tentativa com `gap-2`/gap de 8px teve sobreposição real (achado e corrigido nesta mesma verificação, ver 5.6)
- [x] 5.5 `ModalShell.jsx`: botão de fechar ganhou padding real `p-2.5`/`-m-2.5` (ícone visualmente no mesmo lugar, área clicável cresce) — medido 44×50 (era ~24px sem nenhuma classe de tamanho)
- [x] 5.6 Verificado ao vivo com `elementFromPoint` varrendo pixel a pixel o gap entre editar/excluir: 1ª versão (`gap-2` + `after:-inset-1.5`) tinha 4px de sobreposição real capturados só pelo botão de excluir (mais tarde no DOM); corrigido para `gap-3` (12px) — nova varredura confirmou transição exata no meio do gap (6px "edit", 6px "delete"), sem sobreposição e sem buraco

## 6. Fechamento

- [x] 6.1 `npx vite build` limpo (2 rodadas — 1ª antes da correção do gap 5.4/5.6, 2ª depois)
- [x] 6.2 `openspec validate impeccable-servicos --strict` limpo
- [ ] 6.3 Commit
